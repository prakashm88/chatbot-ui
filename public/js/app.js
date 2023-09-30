var isMuted = false;
var isVideoHidden = true;
let msgCounter = 0;

var chatVideo = document.getElementById("chatVideo");
var hideVideo = document.getElementById("hideVideo");
var chatMessages = document.getElementById("chatMessages");
var messageInput = document.getElementById("messageInput");
var chatBody = document.getElementById("chatMessages");

if (isVideoHidden === true) {
  chatVideo.style.display = "none";
  hideVideo.innerHTML = "Show video";
  chatMessages.style.height = "90%";
}

chatBody.scrollTop = chatBody.scrollHeight;

function toggleVoiceBot() {
  alert("inside voice bot invocation");
}

function handleFeedback(msgId, eventType) {
  alert("inside handleFeedback: " + msgId + " - " + eventType);
}

function toggleChat() {
  var chatWindow = document.getElementById("chatWindow");
  chatWindow.style.display =
    chatWindow.style.display === "none" ? "block" : "none";
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
  var chatBody = document.getElementById("chatBody");
  var currentFontSize = window
    .getComputedStyle(chatBody, null)
    .getPropertyValue("font-size");
  var currentFontSizeValue = parseFloat(currentFontSize);

  if (action === "increase") {
    chatBody.style.fontSize = currentFontSizeValue * 1.2 + "px";
  } else if (action === "decrease") {
    chatBody.style.fontSize = currentFontSizeValue * 0.8 + "px";
  }
}

function createMessagesContainer(message, eventType, iMsgCounter) {
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

  return messagesContainer;
}

function sendMessage() {
  msgCounter++;
  var messageText = messageInput.value.trim();
  if (messageText === "") return;

  var messageDiv = createMessagesContainer(messageText, "sent");

  chatBody.appendChild(messageDiv);

  // Simulate a received message (you can replace this with actual backend communication)
  setTimeout(function () {
    var receivedMessageDiv = createMessagesContainer(
      "Thank you for your message!",
      "received",
      msgCounter
    );

    chatBody.appendChild(receivedMessageDiv);
    chatBody.scrollTop = chatBody.scrollHeight; // Scroll to the bottom of the chat
  }, 500);

  messageInput.value = "";
  chatBody.scrollTop = chatBody.scrollHeight; // Scroll to the bottom of the chat
}

document
  .getElementById("messageInput")
  .addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      sendMessage();
    }
  });
