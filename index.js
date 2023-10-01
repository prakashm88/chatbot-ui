const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
let dotenv = require("dotenv").config();

const api_helper = require("./services/d-id.service");

console.log(dotenv);

const app = express();
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));

let PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
});

app.post("/generate/video", async (req, res) => {
  const requestBody = req.body;
  try {
    const videoUrl = await api_helper.processDIDRequest(
      requestBody.prompt, //"hello how are you?", //
      "en-US-BrandonNeural", //requestBody.voiceId,
      "https://itechgenie.com/demos/genai/1560895433149.jpg" //requestBody.avatarImgUrl
    );
    res.json({ videoUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

let nlpCounter = 0;
let nlpResponse = {
  0: {
    message: "Hello, I am your chatbot assistant !",
    videoUrl: "./videos/wc.mp4",
  },
  1: {
    message: "Welcome to VBG day",
    videoUrl: "./videos/wael1.mp4",
  },
  2: {
    message: "Welcome to VBG day",
    videoUrl: "./videos/wael2.mp4",
  },
  3: {
    message: "Create talking head video from just text and audio",
    videoUrl: "./videos/noelle.mp4",
  },
};

app.post("/secure/api/nlp", (req, res) => {
  const requestBody = req.body;
  console.log("Request Obtained : " + requestBody);
  // isVideoHidden
  if (nlpCounter > 3) {
    nlpCounter = 0;
  }

  let respObj = nlpResponse[nlpCounter];
  console.log("Sending resp: ", respObj);
  res.json(JSON.stringify(respObj));
  nlpCounter++;
});

/*** Dummy APIS starts here  ***/

let counter = 0;

app.get("/dummy/talks/:id", (req, res) => {
  // const requestBody = req.body;

  console.log("choice id is " + req.params.id);

  if (counter++ <= 1) {
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
