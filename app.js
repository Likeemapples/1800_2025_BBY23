import express, { json, static as expressStatic } from "express";
import { readFileSync, writeFileSync } from "fs";
import { createServer } from "livereload";
import connectLiveReload from "connect-livereload";
import { serviceAccount } from "./src/scripts/auth.js";
import admin from "firebase-admin";

import usersRouter from "./routes/users.js";
import ecoactionsRouter from "./routes/ecoactions.js";
import ecogroupsRotuer from "./routes/ecogroups.js";

const app = express();
const PORT = 8050;

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

app.use("/users", usersRouter);
app.use("/ecoactions", usersRouter);
app.use("/ecogroups", usersRouter);

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

// for resource not found (404)
app.use((request, response, next) => {
  response.status(404).send(readFileSync("./public/html/404.html", "utf8"));
});

app.listen(PORT, () => {
  console.log(`EcoAction is listening on ${PORT}!`);
});
