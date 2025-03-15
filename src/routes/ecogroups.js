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
});

router.post("/member", (request, response) => {
  // add member to ecogroup
});

router.delete("/member", (request, response) => {
  // remove member from ecogroup
});

export default router;
