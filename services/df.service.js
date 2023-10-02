let dotenv = require("dotenv").config();
/**
 * TODO(developer): UPDATE these variables before running the sample.
 */
// projectId: ID of the GCP project where Dialogflow agent is deployed
const projectId = "sigma-zodiac-400712";
// sessionId: String representing a random number or hashed user identifier
const sessionId = "prakashm88-0001";
// queries: A set of sequential queries to be send to Dialogflow agent for Intent Detection
const queries = ["how to make a payment", "what does a POC mean"];
// languageCode: Indicates the language Dialogflow agent should use to detect intents
const languageCode = "en";

const location = "global";
const agentId = "bb19218a-e37e-4e5a-a3a4-6a8db12adab8";
// const audioFileName = '/path/to/audio.raw';
// const encoding = 'AUDIO_ENCODING_LINEAR_16';
// const sampleRateHertz = 16000;
// const languageCode = 'en'

// Imports the Google Cloud Some API library
const { SessionsClient } = require("@google-cloud/dialogflow-cx");
/**
 * Example for regional endpoint:
 *   const location = 'us-central1'
 *   const client = new SessionsClient({apiEndpoint: 'us-central1-dialogflow.googleapis.com'})
 */
const client = new SessionsClient();

const fs = require("fs");
const util = require("util");
// Assumes uuid module has been installed from npm,
// npm i uuid:
const { v4 } = require("uuid");

async function detectIntentAudio() {
  const sessionId = v4();
  const sessionPath = client.projectLocationAgentSessionPath(projectId, location, agentId, sessionId);

  // Read the content of the audio file and send it as part of the request.
  const readFile = util.promisify(fs.readFile);
  const inputAudio = await readFile(audioFileName);

  const request = {
    session: sessionPath,
    queryInput: {
      audio: {
        config: {
          audioEncoding: encoding,
          sampleRateHertz: sampleRateHertz,
        },
        audio: inputAudio,
      },
      languageCode,
    },
  };
  const [response] = await client.detectIntent(request);
  console.log(`User Query: ${response.queryResult.transcript}`);
  for (const message of response.queryResult.responseMessages) {
    if (message.text) {
      console.log(`Agent Response: ${message.text.text}`);
    }
  }
  if (response.queryResult.match.intent) {
    console.log(`Matched Intent: ${response.queryResult.match.intent.displayName}`);
  }
  console.log(`Current Page: ${response.queryResult.currentPage.displayName}`);
}

async function callDetectIntent(query, sessionId) {
  const sessionPath = client.projectLocationAgentSessionPath(projectId, location, agentId, sessionId);

  // Construct request
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        // The query to send to the dialogflow agent
        text: query,
      },
      languageCode,
    },
  };
  const [response] = await client.detectIntent(request);
  let dispText = console.log(`User Query: ${response.queryResult.transcript}`);
  for (const message of response.queryResult.responseMessages) {
    if (message.text) {
      console.log(`Agent Response: ${message.text.text}`);
      dispText = message.text.text;
    }
  }
  if (response.queryResult.match.intent) {
    console.log(`Matched Intent: ${response.queryResult.match.intent.displayName}`);
  }
  console.log(`Current Page: ${response.queryResult.currentPage.displayName}`);
  return { message: dispText, response };
}

//callDetectIntent("how to make payments", "prakashm88-0123");

module.exports = { callDetectIntent };
