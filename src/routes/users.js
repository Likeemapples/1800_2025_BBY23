import express, { Router } from "express";
import { db, admin, app } from "../config/firebase.js";

const router = Router();

app.post("/", async (request, response) => {
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

app.put("/publicInfo", async (request, response) => {
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
app.put("/privateInfo", async (request, response) => {

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

export default router;
