const dotenv = require("dotenv").config();
const express = require("express");
const fs = require("fs");
let formidable = require("formidable");
const bodyParser = require("body-parser");
let session = require("express-session");

const didService = require("./services/d-id.service");
const dfService = require("./services/df.service.js");

console.log(dotenv);

const app = express();
app.use(
  session({
    secret: "geniebot-session",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));

let PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
});

app.post("/generate/video", async (req, res) => {
  const requestBody = req.body;
  try {
    const videoUrl = await didService.processDIDRequest(
      requestBody.prompt, //"hello how are you?", //
      "en-US-JennyNeural", //"en-US-BrandonNeural", //requestBody.voiceId,
      "https://itechgenie.com/demos/genai/wael.png" //requestBody.avatarImgUrl
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
    message: ["Hello, I am your chatbot assistant !"],
    videoUrl: "./videos/wc.mp4",
  },
  1: {
    message: ["Welcome to VBG day"],
    videoUrl: "./videos/wael1.mp4",
  },
  2: {
    message: ["Welcome to VBG day"],
    videoUrl: "./videos/wael2.mp4",
  },
  3: {
    message: ["Create talking head video from just text and audio"],
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
  res.json(JSON.parse(JSON.stringify(respObj)));
  nlpCounter++;
});

app.post("/secure/api/tts", async (req, res) => {
  const requestBody = req.body;
  console.log(req.body);
  try {
    console.log("Request Obtained : " + requestBody);
    let dfResponse = await dfService.synthesize(requestBody.text);
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", 'attachment; filename="' + Date.now().toString(36) + '-file.mp3"');
    res.send(dfResponse);
  } catch (e) {
    console.error(e);
  }
});

app.post("/secure/api/tts/voices", async (req, res) => {
  const requestBody = req.body;
  console.log(req.body);
  try {
    console.log("Request Obtained : " + requestBody);
    let dfResponse = await dfService.listVoices(requestBody.langCode);
    res.json(dfResponse);
  } catch (e) {
    console.error(e);
  }
});

app.post("/secure/api/ccai/nlp", async (req, res) => {
  const requestBody = req.body;
  const sessionId = req.sessionID;

  try {
    console.log("Request Obtained : " + requestBody + " - sessionId: " + sessionId);
    let dfResponse = await dfService.callDetectIntent(requestBody.prompt, sessionId);

    if (dfResponse.message != null && dfResponse.message != undefined) {
      const videoUrl = await didService.processDIDRequest(
        dfResponse.message,
        requestBody.voiceId, //"en-US-BrandonNeural", //"en-US-BrandonNeural", //requestBody.voiceId,
        requestBody.avatarImgUrl //  "https://itechgenie.com/demos/genai/wael.png"
      );
      console.log("New video url: " + videoUrl);
      dfResponse.videoUrl = videoUrl;
    } else {
      dfResponse.message = "NO_RESPONSE_OBTAINED";
      dfResponse.videoUrl = "error";
    }

    console.log("Generated log: ", dfResponse.message);
    res.json(dfResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/secure/api/keys", (req, res) => {
  data = {
    UPLOAD_API_KEY: process.env.UPLOAD_API_KEY || "EMPTY",
  };
  // const requestBody = req.body;
  res.json({ keys: data, status: "success" });
  // res.json({ data: videoGenerateResp, status: "success" });
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
    res.json(JSON.parse(JSON.stringify(data)));
  } else {
    fs.readFile("./mocks/did-talks.json", "utf8", function (err, data) {
      if (err) throw err;
      counter = 0;
      res.json(JSON.parse(data));
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
    res.json(JSON.parse(data));
  });
});

app.post("/secure/api/upload", (req, res) => {
  //Create an instance of the form object
  let form = new formidable.IncomingForm();

  form.parse(req, (err, fields, files) => {
    if (err) {
      next(err);
      return;
    }

    let filepath = files.fileupload[0].filepath;
    let newpath = "./public/tmp/";
    newpath += files.fileupload[0].originalFilename;

    // res.json({ fields, files });
    fs.rename(filepath, newpath, function () {
      //Send a NodeJS file upload confirmation message
      res.write("NodeJS File Upload Success! <br /> <a href='/tmp/" + files.fileupload[0].originalFilename + "'></a>");
      res.end();
    });
  });

  /*  //Process the file upload in Node
  form.parse(req, function (error, fields, file) {
    let filepath = file.fileupload.filepath;
    let newpath = '/tmp/';
    newpath += file.fileupload.originalFilename;

    //Copy the uploaded file to a custom folder
    fs.rename(filepath, newpath, function () {
      //Send a NodeJS file upload confirmation message
      res.write('NodeJS File Upload Success!');
      res.end();
    });
  });
*/
});
