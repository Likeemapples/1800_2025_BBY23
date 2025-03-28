import express, { Router } from "express";
import { db, admin } from "../config/firebase.js";
import { cloudinary } from "../config/cloudinary.js";

const router = Router();
const WEEK_IN_MILLISECONDS = 6.048e8;

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
  const docSnapshot = await userDoc.get();

  if (!docSnapshot.exists) {
    return response.status(404).json({ success: false, message: "User not found" });
  }

  const data = docSnapshot.data();

  try {
    const imageInfo = await cloudinary.api.resource(`users/${userID}/profileImage`);
    const imageUrl = imageInfo?.secure_url;

    response.json({ success: true, data: data, profileImage: imageUrl });
  } catch (error) {
    console.error("Profile image not found:", error);
    response.status(404).json({ success: true, data: data, profileImage: null });
  }
});

router.get("/ecoactions", authenticateToken, async (request, response) => {
  const { uid: userID } = request.user; // Extract user ID from token

  try {
    const userDocSnapshot = await db.collection("users").doc(userID).get();
    const userDoc = userDocSnapshot.data();
    const ecoActionsIDs = userDoc.ecoactions;
    response.json({ success: true, ecoActionsIDs });
  } catch (error) {
    console.error("Error fetching user document:", error);
    response.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/ecoaction", authenticateToken, async (request, response) => {
  const { uid: userID } = request.user; // Extract user ID from token
  const { ecoactionID } = request.body;

  try {
    const userRef = await db.collection("users").doc(userID);

    // don't need to be removing the ecoaction once done, can have recurring ecoactions
    // need to change this logic to conditionally display the ecoactin if it is a certain day of the week
    await userRef.update({
      ecoactions: admin.firestore.FieldValue.arrayRemove(ecoactionID),
    });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
});

router.post("/ecoaction", authenticateToken, async (request, response) => {
  try {
    const { uid: userID } = request.user; // Extract user ID from token
    const { image, title, description, ecoactionID } = request.body;

    // Validate request body
    if (!ecoactionID || !title || !description) {
      return response.status(400).json({ success: false, message: "Missing required fields" });
    }

    const userDoc = db.collection("users").doc(userID).collection("completedEcoActions");

    // Add a new document with an auto-generated ID
    const newDocRef = await userDoc.add({
      title: title,
      ecoActionID: ecoactionID,
      description: description,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Send success response
    response.status(200).json({ success: true, message: "Ecoaction posted successfully" });
  } catch (error) {
    console.error("Error posting ecoaction:", error);
    response.status(500).json({ success: false, message: "Internal server error" });
  }
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

    const ecoActionsArray = (await db.collection("users").doc(userID).get()).get("ecoactions");
    //a collection of uniqe doc ids, each representing a completed ecoaction with an ecoactionID and timestamp
    const completedEcoActionsCollectionRef = db
      .collection("users")
      .doc(userID)
      .collection("completedEcoActions");
    const missedEcoActionsCount = await calcMissedEcoActions(
      ecoActionsArray,
      completedEcoActionsCollectionRef
    );

    const weeklyEcoPoints = await calcWeeklyEcoPoints(completedEcoActionsCollectionRef);

    console.log("missedEcoActionsCount", missedEcoActionsCount);
    response
      .status(200)
      .json({ completedEcoActionsCount, ecogroupsCount, missedEcoActionsCount, weeklyEcoPoints });
  } catch (error) {
    console.log(`${error.name} getting user stats for user ${userID}`, error);
    response
      .status(500)
      .json({ message: `${error.name} getting user stats for user ${userID}`, error });
  }
});

async function calcWeeklyEcoPoints(completedEcoActionsCollectionRef) {
  const tenWeeksAgo = new Date(Date.now() - 10 * WEEK_IN_MILLISECONDS);
  const recentCompletedEcoActions = await completedEcoActionsCollectionRef
    .where("timestamp", ">", tenWeeksAgo)
    .get();
  const weeklyEcoPointsSums = calcRecentWeeksStartDates;

  await recentCompletedEcoActions.forEach(async (doc) => {
    const { ecoActionID, timestamp } = doc.data();
    const ecoPoints = await db.collection("ecoactions").doc(ecoActionID).get("ecoPoints");

    //compute the start date of the most recent ten weeks and add them as keys in map
  });
}

function calcRecentWeeksStartDates() {
  const weekStartMap = new Map();

  for (let i = 10; i > 0; i--) {
    const weekStart = new Date(Date.now() - i * WEEK_IN_MILLISECONDS);
    weekStartMap.set(weekStart, undefined);
  }

  return weekStartMap;
}

async function calcMissedEcoActions(ecoActionsArray, completedEcoActionsCollectionRef) {
  let missedEcoActionsCount = 0;

  for (const ecoActionID of ecoActionsArray) {
    const requiredDays = (await db.collection("ecoactions").doc(ecoActionID).get()).get(
      "requiredDays"
    );
    const completedEcoActionDates = (
      await completedEcoActionsCollectionRef.where("ecoactionID", "==", ecoActionID).get()
    ).docs.map((doc) => doc.get("timestamp").toDate());

    //iterate through each day of the week in each ecoaction and see if there is a corresponding completedEcoActioDaten entry
    //if there is not, increment the missedEcoActionsCount
    missedEcoActionsCount += requiredDays.reduce((total, day) => {
      const found = completedEcoActionDates.some((date) => date.getDay() == day);
      return total + (found ? 0 : 1);
    }, 0);
  }

  return missedEcoActionsCount;
}

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
