import express, { json, static as expressStatic } from "express";
import { readFileSync, writeFileSync } from "fs";
import { createServer } from "livereload";
import connectLiveReload from "connect-livereload";
import { firebaseConfig } from "./src/config/auth.js";

import usersRouter from "./src/routes/users.js";
import ecoactionsRouter from "./src/routes/ecoactions.js";
import ecogroupsRouter from "./src/routes/ecogroups.js";

const app = express();
const PORT = 8050;

const liveReloadServer = createServer();
liveReloadServer.watch("./src/");
liveReloadServer.watch("./public/");
app.use(connectLiveReload());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(json());
app.use("/scripts", expressStatic("./public/scripts"));
app.use("/css", expressStatic("./public/styles"));
app.use("/assets", expressStatic("./public/assets"));
app.use("/html", expressStatic("./public/html"));
app.use("/config", expressStatic("./src/config"));

app.use("/users", usersRouter);
app.use("/ecoactions", ecoactionsRouter);
app.use("/ecogroups", ecogroupsRouter);

async function authenticateToken(request, response, next) {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return response.status(401).send("Unauthorized: No token provided");
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    request.user = decodedToken;
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    response.status(401).send("Unauthorized: Invalid token");
  }
}

app.get("/login", (request, response) => {
  response.status(200).send(readFileSync("./public/html/login.html", "utf8"));
});

app.get("/", (request, response) => {
  response.status(200).send(readFileSync("./public/html/index.html", "utf8"));
});

app.get("/firebase-config", (request, response) => {
  response.status(200).json(firebaseConfig);
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
