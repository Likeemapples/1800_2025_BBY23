const PORT = 8050;
import express, { json, static as expressStatic } from "express";
const app = express();
import { readFileSync, writeFileSync } from "fs";
import { createServer } from "livereload";
import connectLiveReload from "connect-livereload";

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
  console.log(request.body);
});

// for resource not found (404)
app.use((request, response, next) => {
  response.status(404).send(readFileSync("./public/html/404.html", "utf8"));
});

app.listen(PORT, () => {
  console.log(`EcoAction is listening on ${PORT}!`);
});
