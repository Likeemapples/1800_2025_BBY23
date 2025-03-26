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
  let ecoactionsIDs = request.headers['ecoactionsids'];
  ecoactionsIDs = ecoactionsIDs ? ecoactionsIDs.split(',') : [];



  try {
    // Wait for all async operations using Promise.all
    const ecoactionsDocs = await Promise.all(
      ecoactionsIDs.map(async (id) => {
        const ecoactionDocSnapshot = await db.collection("ecoactions").doc(id).get();
        return ecoactionDocSnapshot.exists ? { id, ...ecoactionDocSnapshot.data() } : null;
      })
    );

    for (const doc of ecoactionsDocs) {
      if (!doc) continue;
    
      let bannerImage = "";
      try {
        const imageInfo = await cloudinary.api.resource(
          `ecoactions/${doc.id}/bannerImage`
        );
        bannerImage = imageInfo.secure_url;
      } catch (error) {
        console.error(`Failed to fetch banner image for ${doc.id}:`, error.message);
      }
    
      doc.bannerImage = bannerImage;
    }

    response.json({ success: true, ecoactionsDocs, ecoactionsIDs});
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
  
});

export default router;
