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

router.put("/publicInfo", async (request, response) => {
  try {
    const { displayName, bio } = request.body;
    // await userDoc.set({
    //   displayName: displayName,
    //   bio: bio,
    // });

    response.json({ success: true, message: "User info updated" });
  } catch (error) {
    response.status(500).json({ success: false, error: error.message });
  }
});

router.put("/privateInfo", async (request, response) => {
  // update user
  await userDoc.set({
    email: _email,
    phoneNumber: _phoneNumber,
    street: _street,
    city: _city,
    province: _province,
    postalCode: _postalCode,
  });
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
  const { ecoactionID: ecogroupID } = request.body;
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

export default router;
