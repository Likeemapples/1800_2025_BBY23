import express, { Router } from "express";
import { db, admin } from "../config/firebase.js";
import { cloudinary } from "../config/cloudinary.js";


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
  const { user: userAuth } = request.body.authResult;
  console.log("userAuth.uid", userAuth.uid);
  const userDoc = db.collection("users").doc(userAuth.uid);

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
  const { displayName, bio, profileImage } = request.body;
  const { uid: userID } = request.user;
  const userDoc = db.collection("users").doc(userID);

  try {


    const uploadResult = await cloudinary.uploader.upload(
      profileImage,
      { 
        folder: `users/${userID}`,  // Explicitly set the folder
        public_id: "profileImage",  // Image name inside the folder
        overwrite: true
      }
    );

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
  const { uid: userID } = request.user; // Extract user ID from token
  const userDoc = db.collection("users").doc(userID); // Reference to user document

  try {
    // const imageRef = liveDatabase.ref(`users/${userID}/images/profileImage`);
    
    // // 🔹 Await directly instead of using .then()
    // const snapshot = await imageRef.once("value");
    
    // let imageBase64 = snapshot.exists() ? snapshot.val() : "";
      
    const docSnapshot = await userDoc.get(); // Retrieve document snapshot

    if (!docSnapshot.exists) {
      return response.status(404).json({ success: false, message: "User not found" });
    }

    const data = docSnapshot.data(); // Extract data from snapshot

    const imageInfo = await cloudinary.api.resource(`users/${userID}/profileImage`);
    

    response.json({ success: true, data: data, profileImage : imageInfo.secure_url});
  } catch (error) {
    console.error("Error fetching user document:", error);
    response.status(500).json({ success: false, message: error.message });
  }
});

router.get("/test1", authenticateToken, async (request, response) => {
  const { uid: userID } = request.user; // Extract user ID from token

  try {
    // Query the 'ecoactions' collection for the specific user
    const ecoActionsSnapshot = await db
      .collection("users")
      .doc(userID)
      .collection("ecoactions")
      .get(); // Use .get() to retrieve the documents

    // Format the data to return it as an array of documents
    const ecoActions = ecoActionsSnapshot.docs.map((doc) => ({
      id: doc.id, // Get document ID
      data: doc.data(), // Get document data
    }));

    // Return the ecoActions in the response
    response.json({ success: true, ecoActions });
  } catch (error) {
    console.error("Error fetching user document:", error);
    response.status(500).json({ success: false, message: error.message });
  }
});

router.put("/ecoaction", authenticateToken, async (request, response) => {
  const { ecoactionID } = request.body;
  const { uid: userID } = request.user;

  try {
    const addEcoActionToUserResponse = await db
      .collection("users")
      .doc(userID)
      .collection("ecoactions")
      .doc(ecoactionID)
      .set(
        {
          completionDate: null,
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

// router.put("/ecopoints", async (request, response) => {
//   const { ecoactionID } = request.body;
//   const { uid: userID } = request.user;

//   try {
//     const addEcoPointsToUserResponse = await db
//       .collection("users")
//       .doc(userID)
//       .update({
//         ecoPoints: admin.firestore.FieldValue.increment(
//           (await db.collection("ecoactions").doc(ecoactionID).get()).data().ecoPoints
//         ),
//       });
//     console.log("response", addEcoPointsToUserResponse);
//     response.status(200).send("Ecopoints successfully added to user");
//   } catch (error) {
//     console.log(`${error.name} adding ecopoints to user ${userID}`, error);
//     response
//       .status(500)
//       .json({ message: `${error.name} adding ecopoints to user ${userID}`, error });
//   }
// });

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
