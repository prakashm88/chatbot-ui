var isChatWindowOpen = true;
var isMuted = false;
var isVideoHidden = false;
var isWindowMaxed = false;
var isSmallScreenDetected = false;

let msgCounter = 0;

var chatVideo = document.getElementById("chatVideo");
var hideVideo = document.getElementById("hideVideo");
var chatMessages = document.getElementById("chatMessages");
var messageInput = document.getElementById("messageInput");

var videoHolder = document.getElementById("videoHolder");
var chatWindow = document.getElementById("chatWindow");
var chatBodyContainer = document.getElementById("chatBody");
var chatIconId = document.getElementById("chatIcon");
var chatSpeakerIconId = document.getElementById("chatSpeakerIcon");

if (window.innerWidth < 768) {
  isSmallScreenDetected = true;
  chatVideo.style.height = "30%";
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

chatMessages.scrollTop = chatMessages.scrollHeight;

function toggleVoiceBot() {
  alert("inside voice bot invocation");
}

function handleFeedback(msgId, eventType) {
  alert("inside handleFeedback: " + msgId + " - " + eventType);
}

function toggleChat() {
  if (isChatWindowOpen) {
    chatWindow.style.display = "block";
  } else {
    chatWindow.style.display = "none";
  }
  isChatWindowOpen = !isChatWindowOpen;
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
  const response = await fetch("/secure/api/ccai/nlp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      isVideoHidden: isVideoHidden,
      prompt: message,
      //  voiceId: "en-US-BrandonNeural",
      //  avatarImgUrl: "https://itechgenie.com/demos/genai/1560895433149.jpg",
    }),
  });
  return await response.json();
}

function sendMessage() {
  msgCounter++;
  var messageText = messageInput.value.trim();
  if (messageText === "") return;

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

toggleChat();

document.getElementById("messageInput").addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    sendMessage();
  }
});
