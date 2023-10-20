var isChatWindowOpen = true;
var isMuted = false;
var isVideoHidden = false;
var isWindowMaxed = false;
var isSmallScreenDetected = false;

let msgCounter = 0;

let itemListFromApi = [];
let langLists = ["en-US-BrandonNeural", "en-US-ChristopherNeural", "en-US-AshleyNeural", "en-US-AriaNeural"];

var chatVideo = document.getElementById("chatVideo");
var hideVideo = document.getElementById("hideVideo");
var chatMessages = document.getElementById("chatMessages");
var messageInput = document.getElementById("messageInput");

var videoHolder = document.getElementById("videoHolder");
var chatWindow = document.getElementById("chatWindow");
var chatBodyContainer = document.getElementById("chatBody");
var chatIconId = document.getElementById("chatIcon");
var chatSpeakerIconId = document.getElementById("chatSpeakerIcon");
var waitingIcon = document.getElementById("waitingIcon");

if (window.innerWidth < 768) {
  isSmallScreenDetected = true;
  if (chatVideo) chatVideo.style.height = "30%";
}

if (isVideoHidden === true) {
  chatVideo.style.display = "none";
  hideVideo.innerHTML = "Show video";
  chatMessages.style.height = "90%";
}

if (isWindowMaxed === true) {
  chatWindow.style.width = "90%";
  chatWindow.style.height = "95%";
  chatBodyContainer.style.height = "85%";
}

if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;

function toggleVoiceBot() {
  alert("inside voice bot invocation");
}

function handleFeedback(msgId, eventType) {
  alert("inside handleFeedback: " + msgId + " - " + eventType);
}

function toggleChat() {
  if (chatWindow) {
    if (isChatWindowOpen) {
      chatWindow.style.display = "block";
    } else {
      chatWindow.style.display = "none";
    }
    isChatWindowOpen = !isChatWindowOpen;
  }
}

function maxMinToggle() {
  isWindowMaxed = !isWindowMaxed;
  if (isWindowMaxed === true) {
    chatWindow.style.width = "90%";
    chatWindow.style.height = "95%";
    chatBodyContainer.style.height = "85%";
    chatMessages.style.height = "58%";
  } else {
    if (window.innerWidth > 768) {
      chatWindow.style.width = "350px";
      chatWindow.style.height = "550px";
    } else {
      chatWindow.style.width = "90%";
      chatWindow.style.height = "95%";
    }
    chatBodyContainer.style.height = "78%";
    chatMessages.style.height = "51%";
  }
}

function toggleVideo() {
  if (isVideoHidden === true) {
    chatVideo.style.display = "block";
    hideVideo.innerHTML = "Hide video";
    chatMessages.style.height = "51%";
  } else {
    chatVideo.style.display = "none";
    hideVideo.innerHTML = "Show video";
    chatMessages.style.height = "90%";
  }

  isVideoHidden = !isVideoHidden;
}

function toggleMute() {
  // Add your mute logic here
  // alert("Mute button clicked!");

  var muteButton = document.getElementById("muteButton");
  var unmuteButton = document.getElementById("unmuteButton");

  muteButton.style.display = isMuted === true ? "inline" : "none";
  unmuteButton.style.display = isMuted === false ? "inline" : "none";
  isMuted = !isMuted;
}

function adjustFontSize(action) {
  var currentFontSize = window.getComputedStyle(chatMessages, null).getPropertyValue("font-size");
  var currentFontSizeValue = parseFloat(currentFontSize);

  if (action === "increase") {
    chatMessages.style.fontSize = currentFontSizeValue * 1.2 + "px";
  } else if (action === "decrease") {
    chatMessages.style.fontSize = currentFontSizeValue * 0.8 + "px";
  }
}

function addMessageResponse(message, eventType, iMsgCounter) {
  const messagesContainer = document.createElement("div");

  const robotIconContainerElement = document.createElement("div");
  robotIconContainerElement.classList.add("icon-container");

  const robotIconElement = document.createElement("i");
  robotIconElement.classList.add("icon");

  if (eventType === "received") {
    robotIconContainerElement.classList.add("robot-icon");
    messagesContainer.classList.add("message", "received");
  } else {
    robotIconContainerElement.classList.add("user-icon");
    messagesContainer.classList.add("message", "sent");
  }

  robotIconContainerElement.appendChild(robotIconElement);

  const chatMessageElement = document.createElement("div");
  chatMessageElement.classList.add("chat-message");
  chatMessageElement.textContent = message;

  messagesContainer.appendChild(robotIconContainerElement);
  messagesContainer.appendChild(chatMessageElement);

  if (eventType === "received") {
    const thumbsContainerElement = document.createElement("div");
    thumbsContainerElement.classList.add("thumbs-container");

    const thumbsUpElement = document.createElement("i");
    thumbsUpElement.classList.add("icon", "thumbs-up");
    thumbsUpElement.onclick = function () {
      handleFeedback(iMsgCounter, "thumbsUp");
    };

    const thumbsDownElement = document.createElement("i");
    thumbsDownElement.classList.add("icon", "thumbs-down");
    thumbsDownElement.onclick = function () {
      handleFeedback(iMsgCounter, "thumbsDown");
    };

    thumbsContainerElement.appendChild(thumbsUpElement);
    thumbsContainerElement.appendChild(thumbsDownElement);
    chatMessageElement.appendChild(thumbsContainerElement);
  }

  chatMessages.appendChild(messagesContainer);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function fetchNlp(message) {
  var selectedAvatar = localStorage.getItem("selected-avatar");
  var selectedLang = localStorage.getItem("selected-lang");

  if (!selectedAvatar || !selectedLang) {
    avatarImages();
  }

  let nlpUrl = "/secure/api/ccai/nlp";
  if (window.isMocked === true) {
    nlpUrl = "/secure/api/nlp";
  }
  let _avatarUrl = "https://itechgenie.com/demos/genai/pics/" + selectedAvatar;

  try {
    window.newrelic.addCustomAttribute("prompt", message);
    window.newrelic.addCustomAttribute("voiceId", selectedLang);
    window.newrelic.addCustomAttribute("avatarUrl", _avatarUrl);
  } catch (error) {
    console.error("unable to sent nr", error);
  }

  const response = await fetch(nlpUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      isVideoHidden: isVideoHidden,
      prompt: message,
      voiceId: selectedLang, // "en-US-BrandonNeural",
      avatarImgUrl: _avatarUrl,
    }),
  });
  return await response.json();
}

function sendMessage() {
  msgCounter++;
  var messageText = messageInput.value.trim();
  if (messageText === "") return;

  waitingIcon.style.display = "inline";
  addMessageResponse(messageText, "sent", msgCounter);

  fetchNlp(messageText)
    .then((respObj) => {
      if (respObj != null && respObj.message !== "error") {
        let msgResp = respObj;

        if (!isVideoHidden && msgResp.videoUrl != "error") {
          videoHolder.src = msgResp.videoUrl;
          videoHolder.load();
        }

        var resultString = msgResp.message.join(". ");

        if (msgResp.videoUrl == "error") {
          resultString += "\n (Video generation skipped !)";
        }

        addMessageResponse(resultString, "received", msgCounter);
        waitingIcon.style.display = "none";
      } else {
        addMessageResponse("Sorry... Try again: " + error, "received", msgCounter);
      }

      messageInput.value = "";
      chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to the bottom of the chat
    })
    .catch((error) => {
      console.error("Error fetching NLP:", error);
      addMessageResponse("Sorry... Try again: " + error, "received", msgCounter);
    });

  /*
  // Simulate a received message (you can replace this with actual backend communication)
  setTimeout(function () {
    var receivedMessageDiv = createMessagesContainer("Thank you for your message!", "received", msgCounter);

    chatMessages.appendChild(receivedMessageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to the bottom of the chat
  }, 500); */

  messageInput.value = "";
  chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to the bottom of the chat
}

async function fetchAndSetApiKeys() {
  try {
    // Make an API call to retrieve keys
    const response = await fetch("/secure/api/keys");
    if (!response.ok) {
      throw new Error("Failed to retrieve API keys");
    }

    // Parse the response as JSON
    const data = await response.json();
    console.log("Obtianed data: ", data);

    // Access the UPLOAD_API_KEY from the keys object
    if (data.keys && data.keys.UPLOAD_API_KEY) {
      // Set the API key at the window level
      window.UPLOAD_API_KEY = data.keys.UPLOAD_API_KEY;
      console.log("API key retrieved:", window.UPLOAD_API_KEY);
      avatarImages();
    } else {
      throw new Error("API key not found in the response");
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

async function avatarImages() {
  try {
    // Make an API call to retrieve keys
    const response = await fetch("https://itechgenie.com/demos/genai/l.php?x-auth=" + window.UPLOAD_API_KEY);
    if (!response.ok) {
      throw new Error("Failed to retrieve images");
    }

    // Parse the response as JSON
    const data = await response.json();
    console.log("Obtianed data: ", data);

    // Access the UPLOAD_API_KEY from the keys object
    if (data && data.avatars) {
      // Set the API key at the window level
      window.avatars = data.avatars;
      console.log("avatars retrieved:", window.avatars);
      itemListFromApi = data.avatars;
    } else {
      throw new Error("API key not found in the response");
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

// Function to open the modal
function openModal() {
  avatarImages().then((respObj) => {
    // Populate the select element with options from the API
    const itemListSelect = document.getElementById("itemList");
    const langListSelect = document.getElementById("langList");
    itemListFromApi.forEach((item) => {
      const option = document.createElement("option");
      option.value = item;
      option.text = item;
      itemListSelect.appendChild(option);
    });

    langLists.forEach((item) => {
      const option = document.createElement("option");
      option.value = item;
      option.text = item;
      langListSelect.appendChild(option);
    });

    // Show the modal and overlay
    document.getElementById("myModal").style.display = "block";
    document.getElementById("overlay").style.display = "block";
  });
}

// Function to close the modal
function closeModal() {
  // Clear the select element
  document.getElementById("itemList").innerHTML = "";

  // Hide the modal and overlay
  document.getElementById("myModal").style.display = "none";
  document.getElementById("overlay").style.display = "none";
}

// Function to select an item and store it in local storage
function selectItem() {
  const selectedItem = document.getElementById("itemList").value;
  const langListItem = document.getElementById("langList").value;

  // Store the selected item in local storage
  if (selectedItem) {
    window.localStorage.setItem("selected-avatar", selectedItem);
    //alert("Selected avatar: " + selectedItem);
    closeModal();
  } else {
    alert("Please select an avatar");
  }

  if (langListItem) {
    window.localStorage.setItem("selected-lang", langListItem);
    //alert("Selected lang: " + langListItem);
    closeModal();
  } else {
    alert("Please select a language");
  }
}

function loadBot() {
  toggleChat();
  fetchAndSetApiKeys();
}

window.onload = loadBot;

document.getElementById("messageInput")?.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    sendMessage();
  }
});
