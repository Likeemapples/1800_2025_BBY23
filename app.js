const PORT = 8000;
import express, { json, static as expressStatic } from "express";
const app = express();
import { readFileSync, writeFileSync } from "fs";
import { createServer } from "livereload";
import connectLiveReload from "connect-livereload";

const liveReloadServer = createServer();
liveReloadServer.watch("./app/");
liveReloadServer.watch("./public/");
app.use(connectLiveReload());

app.use(json());
app.use("/js", expressStatic("./app/scripts"));
app.use("/css", expressStatic("./app/css"));
app.use("/assets", expressStatic("./app/assets"));
app.use("/html", expressStatic("./app/html"));
app.use("/data", expressStatic("./app/data"));

app.get("/", (request, response) => {
  response.status(200).send(readFileSync("./app/html/login.html", "utf8"));
});

// for resoure not found (404)
app.use((request, response, next) => {
  response.status(404).send(readFileSync("./html/404.html", "utf8"));
});

app.listen(PORT, () => {
  console.log(`EcoAction is listening on ${PORT}!`);
});
