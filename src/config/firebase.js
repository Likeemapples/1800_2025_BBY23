import admin from "firebase-admin";
import express from "express";
import { serviceAccount, liveDatabaseURL} from "./auth.js";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: liveDatabaseURL
});

const db = admin.firestore();
const liveDatabase = admin.database(); 
const app = express();

export { admin, db, liveDatabase, app };