const express = require("express");
const db = require("./db");

const app = express();

app.use(express.json());

app.use("/auth", require("./routes/auth"));
app.use("/blog", require("./routes/blog"));
app.all("*", (_, res) => {
  return res.json({ error: "not found" });
});

db.connect().then(() => {
  app.listen(3000, () => {
    console.log("Started");
  });
});
