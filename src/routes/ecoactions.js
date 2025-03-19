import express, { Router } from "express";
import { db, admin } from "../config/firebase.js";

const router = Router();

router.post("/", (request, response) => {
  // create ecoaction
});

router.put("/", (request, response) => {
  // update ecoaction
});

router.get("/", async (request, response) => {
  let { ecoactionsIDs } = request.query;

  if (!Array.isArray(ecoactionsIDs)) {
    ecoactionsIDs = [ecoactionsIDs];
  }


  try {
    // Wait for all async operations using Promise.all
    const ecoactionsDocs = await Promise.all(
      ecoactionsIDs.map(async (id) => {
        const ecoactionDocSnapshot = await db.collection("ecoactions").doc(id).get();
        return ecoactionDocSnapshot.exists ? ecoactionDocSnapshot.data() : null;
      })
    );

    response.json({ success: true, ecoactionsDocs });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
  
});

export default router;
