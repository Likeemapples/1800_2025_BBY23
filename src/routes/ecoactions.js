import express, { Router } from "express";
import { db, admin } from "../config/firebase.js";
import { cloudinary } from "../config/cloudinary.js";

const router = Router();

router.post("/", (request, response) => {
  // create ecoaction
});

router.put("/", (request, response) => {
  // update ecoaction
});

router.get("/", async (request, response) => {
  let ecoactionsIDHeader = request.headers["ecoactionsids"]; // Use a clearer variable name
  // Trim whitespace from header, split, filter empty strings, trim each ID
  const ecoactionsIDs = ecoactionsIDHeader
    ? ecoactionsIDHeader
        .trim()
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id)
    : [];

  if (ecoactionsIDs.length === 0) {
    // Handle case with no IDs early
    return response.json({ success: true, ecoactionsDocs: [], ecoactionsIDs: [] });
  }

  console.log(`Fetching data for ${ecoactionsIDs.length} EcoAction IDs...`);

  try {
    const results = await Promise.all(
      ecoactionsIDs.map(async (id) => {
        const firestorePromise = db.collection("ecoactions").doc(id).get();
        const cloudinaryPromise = cloudinary.api
          .resource(`ecoactions/${id}/bannerImage`)
          .then((imageInfo) => imageInfo.secure_url)
          .catch((error) => {
            console.error(`Failed to fetch banner image for ${id}:`, error.message);
            return "";
          });
        const [ecoactionDocSnapshot, bannerImage] = await Promise.all([
          firestorePromise,
          cloudinaryPromise,
        ]);

        if (ecoactionDocSnapshot.exists) {
          return {
            id: id,
            ...ecoactionDocSnapshot.data(),
            bannerImage: bannerImage,
          };
        } else {
          console.warn(`EcoAction document with ID ${id} not found.`);
          return null;
        }
      })
    );

    // Filter out any null results (where Firestore doc wasn't found)
    const successfulEcoactionsDocs = results.filter((doc) => doc !== null);
    console.log(`Successfully processed ${successfulEcoactionsDocs.length} EcoActions.`);
    response.json({ success: true, ecoactionsDocs: successfulEcoactionsDocs, ecoactionsIDs }); // Send the combined data
  } catch (error) {
    console.error("Error fetching EcoAction data:", error);
    response
      .status(500)
      .json({ success: false, message: "Failed to fetch EcoAction data.", error: error.message });
  }
});

export default router;
