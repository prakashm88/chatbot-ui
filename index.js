const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
let dotenv = require("dotenv").config();

const api_helper = require("./services/d-id.service");

console.log(dotenv);

const app = express();
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));

app.listen(dotenv.parsed.PORT, () => {
  console.log("Server is running on port " + dotenv.parsed.PORT);
});

app.post("/generate/video", async (req, res) => {
  const requestBody = req.body;
  try {
    const videoUrl = await api_helper.processDIDRequest(
      requestBody.prompt, //"hello how are you?", //
      requestBody.voiceId, //"en-US-BrandonNeural", //
      requestBody.avatarImgUrl //"https://itechgenie.com/demos/genai/1560895433149.jpg" //
    );
    res.json({ videoUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

let counter = 0;

app.get("/dummy/talks/:id", (req, res) => {
  // const requestBody = req.body;

  console.log("choice id is " + req.params.id);

  if (counter++ <= 3) {
    let data = {
      status: "started",
    };
    res.json(JSON.stringify(data));
  } else {
    fs.readFile("./mocks/did-talks.json", "utf8", function (err, data) {
      if (err) throw err;
      counter = 0;
      res.json(data);
    });
  }
  // res.json({ data: videoGenerateResp, status: "success" });
});

app.post("/dummy/talks", (req, res) => {
  const requestBody = req.body;
  console.log(req.body);
  fs.readFile("./mocks/did-talks-generate.json", "utf8", function (err, data) {
    if (err) throw err;
    res.status(201);
    res.json(data);
  });
});
