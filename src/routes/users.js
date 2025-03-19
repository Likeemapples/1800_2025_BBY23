import express, { Router } from "express";
import { db, admin } from "../config/firebase.js";
import { cloudinary } from "../config/cloudinary.js";

import fs from "fs";

const router = Router();

async function authenticateToken(request, response, next) {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return response.status(401).send("Unauthorized: No token provided");
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    request.user = decodedToken;
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    response.status(401).send("Unauthorized: Invalid token");
  }
}

router.post("/", async (request, response) => {
  const { uid, email, displayName } = request.body.user;
  console.log("uid", uid);
  const userDoc = db.collection("users").doc(uid);

  try {
    //if the userDoc doesn't exist, create it
    if (!(await userDoc.get()).exists) {
      await userDoc.set({
        //email is null for google sign in
        email: email,
        displayName: displayName || "",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log("User document created");
      response.status(200).send("User document created");
    } else {
      console.log("User document already exists");
      response.status(200).send("User document already exists");
    }
  } catch (error) {
    console.error("Error creating user document:", error);
    response.status(200).json({ message: "Error creating user document", error });
  }
});

router.put("/publicInfo", authenticateToken, async (request, response) => {
  const { displayName, bio, profileImage } = request.body;
  const { uid: userID } = request.user;
  const userDoc = db.collection("users").doc(userID);

  try {
    const uploadResult = await cloudinary.uploader.upload(profileImage, {
      folder: `users/${userID}`, // Explicitly set the folder
      public_id: "profileImage", // Image name inside the folder
      overwrite: true,
    });

    await userDoc.set(
      {
        displayName: displayName,
        bio: bio,
      },
      { merge: true }
    );
  } catch (error) {
    response.json({ success: false, message: error.message });
  }
});

router.put("/privateInfo", authenticateToken, async (request, response) => {
  const { email, phoneNumber, street, city, province, postalCode } = request.body;
  const { uid: userID } = request.user;
  const userDoc = db.collection("users").doc(userID);

  try {
    await userDoc.set(
      {
        email: email,
        phoneNumber: phoneNumber,
        street: street,
        city: city,
        province: province,
        postalCode: postalCode,
      },
      { merge: true }
    );
    response.json({ success: true, message: "User info updated" });
  } catch (error) {
    response.json({ success: false, message: error.message });
  }
});

router.get("/info", authenticateToken, async (request, response) => {
  const { uid: userID } = request.user; 
  const userDoc = db.collection("users").doc(userID); 

  try {

    const docSnapshot = await userDoc.get(); 

    if (!docSnapshot.exists) {
      return response.status(404).json({ success: false, message: "User not found" });
    }

    const data = docSnapshot.data(); 

    const defaultImage = "/assets/images/profile-icon.png"; 
    let imageUrl = defaultImage; 

    try {
      const imageInfo = await cloudinary.api.resource(`users/${userID}/profileImage`);

      imageUrl = imageInfo !== undefined && imageInfo.secure_url ? imageInfo.secure_url : defaultImage;
    } catch {
    }

    response.json({ success: true, data: data, profileImage: imageUrl });
  } catch (error) {
    console.error("Error fetching user document:", error);
    response.status(500).json({ success: false, message: error.message });
  }
});

router.get("/ecoactions", authenticateToken, async (request, response) => {
  const { uid: userID } = request.user; // Extract user ID from token

  try {
    const userDocSnapshot= await db
      .collection("users")
      .doc(userID).get();
    const userDoc = userDocSnapshot.data();
    const ecoActions = userDoc.ecoactions;



    response.json({ success: true, ecoActions });
  } catch (error) {
    console.error("Error fetching user document:", error);
    response.status(500).json({ success: false, message: error.message });
  }
});

router.get("/ecoactionBanner", authenticateToken, async (request, response) => {
  const { uid: userID } = request.user; // Extract user ID from token
  const { ecoactionID } = request.query;

  let bannerImage;
  try {
    const imageInfo = await cloudinary.api.resource(
      `users/${userID}/ecoactions/${ecoactionID}/bannerImage`
    );
    bannerImage = imageInfo.secure_url;
  } catch {
    bannerImage = "";
  }

  response.json({ success: true, bannerImage });
});

router.get("/stats", authenticateToken, async (request, response) => {
  const { uid: userID } = request.user;
  console.log("userID", userID);

  try {
    const completedEcoActionsCount = (
      await db.collection("users").doc(userID).collection("completedEcoActions").get()
    ).size;
    const ecogroupsCount = (await db.collection("users").doc(userID).collection("ecogroups").get())
      .size;
    console.log("ecoactions", completedEcoActionsCount);
    response.status(200).json({ completedEcoActionsCount, ecogroupsCount });
  } catch (error) {
    console.log(`${error.name} getting user stats for user ${userID}`, error);
    response
      .status(500)
      .json({ message: `${error.name} getting user stats for user ${userID}`, error });
  }
});

router.put("/ecoaction", authenticateToken, async (request, response) => {
  const { ecoactionID, completed, title, description, shortDescription } = request.body;
  const { uid: userID } = request.user;

  try {
    const addEcoActionToUserResponse = await db
      .collection("users")
      .doc(userID)
      .collection("ecoactions")
      .doc(ecoactionID)
      .set(
        {
          completed: completed,
          title: title,
          description: description,
          shortDescription: shortDescription,
        },
        { merge: true }
      );
    console.log("response", addEcoActionToUserResponse);
    response.status(200).send("Ecoaction successfully added to user");
  } catch (error) {
    console.log(`${error.name} adding ecoaction to user ${userID}`, error);
    response
      .status(500)
      .json({ message: `${error.name} adding ecoaction to user ${userID}`, error });
  }
});

router.post("/ecoaction", authenticateToken, async (request, response) => {
  const { title, description, shortDescription, bannerImage } = request.body;
  const { uid: userID } = request.user;

  try {
    const ecoActionRef = db.collection("users").doc(userID).collection("ecoactions").doc();
    const ecoactionID = ecoActionRef.id;

    const addEcoActionToUserResponse = await db
      .collection("users")
      .doc(userID)
      .collection("ecoactions")
      .doc(ecoactionID)
      .set({
        title: title,
        description: description,
        shortDescription: shortDescription,
      });
    const uploadResult = await cloudinary.uploader.upload(bannerImage, {
      folder: `users/${userID}/ecoactions/${ecoactionID}`, // Explicitly set the folder
      public_id: "bannerImage", // Image name inside the folder
      overwrite: true,
    });
    console.log("response", addEcoActionToUserResponse);
    response.status(200).send("Ecoaction successfully added to user");
  } catch (error) {
    console.log(`${error.name} adding ecoaction to user ${userID}`, error);
    response
      .status(500)
      .json({ message: `${error.name} adding ecoaction to user ${userID}`, error });
  }
});

router.post("/ecogroup", authenticateToken, async (request, response) => {
  const { ecogroupID } = request.body;
  const { uid: userID } = request.user;

  try {
    const addEcoGroupToUserResponse = await db
      .collection("users")
      .doc(userID)
      .collection("ecogroups")
      .doc(ecogroupID)
      .set({});
    console.log("response", addEcoGroupToUserResponse);
    response.status(200).send("EcoGroup successfully added to user");
  } catch (error) {
    console.log(`${error.name} adding EcoGroup to user ${userID}`, error);
    response
      .status(500)
      .json({ message: `${error.name} adding EcoGroup to user ${userID}`, error });
  }
});

router.delete("/ecoaction", authenticateToken, async (request, response) => {
  const { ecoactionID } = request.body;
  const { uid: userID } = request.user;

  try {
    const deleteEcoActionFromUserResponse = await db
      .collection("users")
      .doc(userID)
      .collection("ecoactions")
      .doc(ecoactionID)
      .set({});
    console.log("response", deleteEcoActionFromUserResponse);
    response.status(200).send("Ecoaction successfully deleted from user");
  } catch (error) {
    console.log(`${error.name} deleting ecoaction from user ${userID}`, error);
    response
      .status(500)
      .json({ message: `${error.name} deleting ecoaction from user ${userID}`, error });
  }
});

router.delete("/ecogroup", authenticateToken, async (request, response) => {
  const { ecogroupID } = request.body;
  const { uid: userID } = request.user;

  try {
    const deleteEcoGroupFromUserResponse = await db
      .collection("users")
      .doc(userID)
      .collection("ecogroups")
      .doc(ecogroupID)
      .delete();
    console.log("response", deleteEcoGroupFromUserResponse);
    response.status(200).send("EcoGroup successfully deleted from user");
  } catch (error) {
    console.log(`${error.name} deleting EcoGroup from user ${userID}`, error);
    response
      .status(500)
      .json({ message: `${error.name} deleting EcoGroup from user ${userID}`, error });
  }
});

export default router;
