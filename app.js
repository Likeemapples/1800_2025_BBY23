import express, { json, static as expressStatic } from "express";
import { readFileSync, writeFileSync } from "fs";
import { createServer } from "livereload";
import connectLiveReload from "connect-livereload";
import { firebaseConfig } from "./src/config/auth.js";
import { db, admin } from "./src/config/firebase.js";
import seedDatabase from "./src/populate-firestore.js";
import seedUser from "./src/populate-user.js";

import usersRouter from "./src/routes/users.js";
import ecoactionsRouter from "./src/routes/ecoactions.js";
import ecogroupsRouter from "./src/routes/ecogroups.js";
import statsRouter from "./src/routes/stats.js";

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
app.use("/stats", statsRouter);

const command = process.argv[2];

(async () => {
  if (command === "seed-db") {
    console.log("Command 'seed-db' detected. Running database seeder...");
    try {
      await seedDatabase(db, admin);
      console.log("Database seeding completed successfully.");
    } catch (error) {
      console.error("Database seeding failed:", error);
    }
  } else if (command === "seed-user") {
    console.log("Command 'seed-user' detected. Running user seeder...");
    try {
      await seedUser(db, admin, "VhJaHIJyKkfYmacWw361OR6ED3X2");
      console.log("User seeding completed successfully.");
    } catch (error) {
      console.error("User seeding failed:", error);
    }
  }
})();

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
