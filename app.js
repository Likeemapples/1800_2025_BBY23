const PORT = 8050;
import express, { json, static as expressStatic } from "express";
const app = express();
import { readFileSync, writeFileSync } from "fs";
import { createServer } from "livereload";
import connectLiveReload from "connect-livereload";
import { serviceAccount } from "./src/scripts/auth.js";
import admin from "firebase-admin";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();



const liveReloadServer = createServer();
liveReloadServer.watch("./src/");
liveReloadServer.watch("./public/");
app.use(connectLiveReload());

app.use(json());
app.use("/scripts", expressStatic("./src/scripts"));
app.use("/css", expressStatic("./public/styles"));
app.use("/assets", expressStatic("./public/assets"));
app.use("/html", expressStatic("./public/html"));

app.get("/login", (request, response) => {
  response.status(200).send(readFileSync("./public/html/login.html", "utf8"));
});

app.get("/", (request, response) => {
  response.status(200).send(readFileSync("./public/html/index.html", "utf8"));
});

app.post("/serverlog", (request, response) => {
  console.log("req body", request.body);
  response.status(200).send("logged");
});

app.post("/actions", (request, response) => {});

app.post("/ecogroups", (request, response) => {});

app.post("/user-doc", async (request, response) => {
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

// for resource not found (404)
app.use((request, response, next) => {
  response.status(404).send(readFileSync("./public/html/404.html", "utf8"));
});

app.listen(PORT, () => {
  console.log(`EcoAction is listening on ${PORT}!`);
});
