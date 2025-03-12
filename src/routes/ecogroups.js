import express, { Router } from "express";
import { db, admin, app } from "../config/firebase.js";

const router = Router();

app.post("/", (request, response) => {
  // create ecogroup
});

app.post("/member", (request, response) => {
  // add member to ecogroup
});

app.delete("/member", (request, response) => {
  // remove member from ecogroup
});

export default router;
