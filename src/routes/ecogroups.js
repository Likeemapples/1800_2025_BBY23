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

router.post("/create", authenticateToken, async (request, response) => {
  // create ecogroup
  const { uid: userID } = request.user;
  const { groupName: groupNm } = request.body;
  console.log("userID", userID);

  db.collection("ecogroups").get()
    .then(allGroups => {
      let pass = true;
      allGroups.forEach(doc => {
        // Loop through all documents in ecogroups, then check if the user that created that group is this user
        if (doc.data().createdByUser == userID) { pass = false; } 
      });
      if (pass) {
        // Create ecogroup if user has not created a group before
        var ref = db.collection("ecogroups");
        ref.add({
            name: groupNm,
            users: [userID],
            createdByUser: userID
        });
      }
    });

  // const userDoc = db.collection("ecogroups").doc(userID);

  // try {
  //   //if the userDoc doesn't exist, create it
  //   if (!(await userDoc.get()).exists) {
  //     await userDoc.set({
  //       email: userAuth.email,
  //       displayName: userAuth.displayName || "",
  //       createdAt: admin.firestore.FieldValue.serverTimestamp(),
  //     });
  //     console.log("User document created");
  //     response.status(200).send("User document created");
  //   } else {
  //     console.log("User document already exists");
  //     response.status(200).send("User document already exists");
  //   }
  // } catch (error) {
  //   console.error("Error creating user document:", error);
  //   response.status(200).json({ message: "Error creating user document", error });
  // }

});

router.post("/member", (request, response) => {
  // add member to ecogroup
});

router.delete("/member", (request, response) => {
  // remove member from ecogroup
});

export default router;
