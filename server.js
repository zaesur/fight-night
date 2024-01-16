const express = require("express");
const Client = require("./http.js");
const app = express();
const port = 5000;

const client = new Client("https://ontroerend-goed.eventsight.eu");
const status = {
  isActive: false,
  isClosed: false,
  question: "",
  answers: [],
};

app.use("/question.html", (req, res, next) => {
  if (!req.query.id) {
    res.redirect("/question.html?id=1");
  } else {
    next();
  }
});

app.get("/status", (req, res) => {
  res.json(status);
});

app.use(express.static("public"));
app.listen(port, async () => {
  console.log(`App listening on port ${port}`);
});
