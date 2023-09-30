const axios = require("axios");
let dotenv = require("dotenv").config().parsed;

const apiUrl = dotenv.API_URL_DID; // "https://api.d-id.com/talks" ;
const apiKey = dotenv.API_KEY_DID;

async function processDIDRequest(prompt, voiceId, avatarUrl) {
  const headers = {
    accept: "application/json",
    "content-type": "application/json",
    Authorization: apiKey,
  };

  let payload = {
    script: {
      type: "text",
      subtitles: "false",
      provider: {
        type: "microsoft",
        voice_id: voiceId,
      },
      ssml: "false",
      input: prompt,
    },
    config: {
      fluent: "false",
      pad_audio: "0.0",
    },
    source_url: avatarUrl,
  };

  try {
    console.log("##### trying : " + apiUrl + " - " + payload);

    const response = await axios.post(apiUrl, payload, { headers });

    console.log("##### response: "); //+ JSON.stringify(response));

    console.log("##### response status : " + response.status);

    if (response.status === 201) {
      const res = JSON.parse(response.data);
      const id = res.id;
      let status = "created";

      console.log("Obtained id" + id);

      let counterItr = 0;

      while (status === "created" || status === "started") {
        console.log(
          "##### ############## trying next api : " +
            id +
            " - with status: " +
            status
        );

        const getResponse = await axios.get(`${apiUrl}/${id}`, { headers });

        console.log("##### getResponse: "); // + JSON.stringify(getResponse));

        console.log("Status: " + getResponse.status);

        if (getResponse.status === 200) {
          console.log("Obtained response status: " + getResponse.status);

          const resN = JSON.parse(getResponse.data);
          console.log("New status: " + resN.status);

          status = resN.status;
          if (resN.status === "done") {
            return resN.result_url;
          } else {
            counterItr++;
            console.log("%%%% Counter: " + counterItr);
            if (counterItr >= 5) {
              status = "error";
              return "error";
            }
            await new Promise((resolve) => setTimeout(resolve, 5000)); // Sleep for 5 seconds
          }
        } else {
          console.log(
            "Obtained invalid response status: " + getResponse.status
          );
          status = "error";
          return "error";
        }
      }
    } else {
      return "error";
    }
  } catch (error) {
    console.error(error);
    return "error";
  }
}

module.exports = { processDIDRequest };
