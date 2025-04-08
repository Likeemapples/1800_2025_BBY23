import admin from "firebase-admin";
import express from "express";
import { serviceAccount } from "./auth.js";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

export { admin, db };
