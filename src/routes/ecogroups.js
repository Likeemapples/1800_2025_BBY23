import express, { Router } from "express";
import { db, admin } from "../config/firebase.js";

const router = Router();

router.post("/", (request, response) => {
  // create ecogroup
});

router.post("/member", (request, response) => {
  // add member to ecogroup
});

router.delete("/member", (request, response) => {
  // remove member from ecogroup
});

export default router;
