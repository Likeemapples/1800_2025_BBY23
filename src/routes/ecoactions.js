import express, { Router } from "express";
import { db, admin, app } from "../config/firebase.js";

const router = Router();

app.post("/", (request, response) => {
  // create ecoaction
});

app.put("/", (request, response) => {
  // update ecoaction
});

export default router;
