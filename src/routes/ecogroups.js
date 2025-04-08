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
  const { groupName: groupNm, ecoAction: action } = request.body;

  db.collection("ecogroups").get()
    .then(allGroups => {
      let pass = true;
      allGroups.forEach(doc => {
        // Loop through all documents in ecogroups, then check if the user that created that group is this user
        if (doc.data().createdByUser == userID) { pass = false; } 
      });
      if (pass || true) {
        // Create ecogroup if user has not created a group before
        var ref = db.collection("ecogroups");
        ref.add({
            name: groupNm,
            users: [userID],
            createdByUser: userID,
            ecoactions: [action]
        }).then(docRef => {
          let docReference = docRef.id;
          response.status(200).json({documentId: docReference});
        });
      }
    });
});

router.put("/add-user", authenticateToken, async (request, response) => {
  const { uid: userID } = request.user;
  const { groupID: targetGroup } = request.body;
  // add member to ecogroup

  try {
    const addUserToGroupResponse = await db
      .collection("ecogroups")
      .doc(targetGroup)
      .update({
        users: admin.firestore.FieldValue.arrayUnion(userID),
      });
    console.log("response", addUserToGroupResponse);
    response.status(200).send("User successfully added to ecogroup");
  } catch (error) {
    console.log(`${error.name} adding user to ecogroup`, error);
    response.status(500).json({ message: `${error.name} adding user to ecogroup`, error });
  }
});

router.delete("/member", (request, response) => {
  // remove member from ecogroup
});

export default router;
