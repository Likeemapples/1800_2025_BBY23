import express, { Router } from "express";
import { db, admin } from "../config/firebase.js";

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
  console.log("init /users");
  const { user: userAuth } = request.body.authResult;
  console.log("userAuth.uid", userAuth.uid);
  let userDoc = db.collection("users").doc(userAuth.uid);
  const userID = userAuth.uid;
  try {
    //if the userDoc doesn't exist, create it
    if (!(await userDoc.get()).exists) {
      await userDoc.set({
        email: userAuth.email,
        displayName: userAuth.displayName || "",
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
  const { displayName, bio } = request.body;
  const { uid: userID } = request.user;
  const userDoc = db.collection("users").doc(userID);

  try {
    await userDoc.set(
      {
        displayName: displayName,
        bio: bio,
      },
      { merge: true }
    );

    response.json({ success: true, message: "User info updated" });
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
  const { uid: userID } = request.user; // Extract user ID from token
  const userDoc = db.collection("users").doc(userID); // Reference to user document

  try {
    const docSnapshot = await userDoc.get(); // Retrieve document snapshot

    if (!docSnapshot.exists) {
      return response.status(404).json({ success: false, message: "User not found" });
    }

    const data = docSnapshot.data(); // Extract data from snapshot

    response.json({ success: true, data: data });
  } catch (error) {
    console.error("Error fetching user document:", error);
    response.status(500).json({ success: false, message: error.message });
  }
});

router.post("/ecoaction", authenticateToken, async (request, response) => {
  const { ecoactionID } = request.body;
  const { uid: userID } = request.user;

  try {
    const addEcoActionToUserResponse = await db
      .collection("users")
      .doc(userID)
      .collection("ecoactions")
      .doc(ecoactionID)
      .set({});
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
