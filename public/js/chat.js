const socket = io();

const messageFormInput = document.querySelector("#message-form input");
const chatForm = document.getElementById("message-form");
const messageFormButton = document.querySelector("#send-message");
const sendLocationButton = document.querySelector("#send-location");
const messagesContainer = document.getElementById("messages");

//Templates
const messageTemplate = document.getElementById("message-template").innerHTML;
const messageLocationTemplate = document.getElementById(
  "message-location-template"
).innerHTML;
const sidebarTemplate = document.getElementById("sidebar-template").innerHTML;

//options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoScroll = () => {
  //New Messages Element
  const newMessage = messagesContainer.lastElementChild;

  //Height of the new message
  const newMessageStyles = getComputedStyle(newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

  //Visible Height
  const visibleHeight = messagesContainer.offsetHeight;

  //Height of the messages container
  const containerHeight = messagesContainer.scrollHeight;

  //How far have I scrolled?
  const scrollOffset = messagesContainer.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
};

document.getElementById("exit-room").addEventListener("click", () => {
  socket.disconnect();
  location.href = "/";
});

socket.on("message", ({ username, text: message, createdAt }) => {
  const html = Mustache.render(messageTemplate, {
    username,
    message,
    createdAt: moment(createdAt).format("h:mm A"),
  });
  messagesContainer.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("locationMessage", ({ username, url: locationURL, createdAt }) => {
  const html = Mustache.render(messageLocationTemplate, {
    username,
    locationURL,
    createdAt: moment(createdAt).format("h:mm A"),
  });
  messagesContainer.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, { room, users });
  document.getElementById("room-data-container").innerHTML = html;
});

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  messageFormButton.setAttribute("disabled", "disabled");
  const message = messageFormInput.value;
  socket.emit("sendMessage", message, (error) => {
    messageFormButton.removeAttribute("disabled");
    messageFormInput.value = "";
    messageFormInput.focus();

    if (error) {
      console.log(error);
      return;
    }

    console.log("Message delivered");
  });
});

sendLocationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }
  sendLocationButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    sendLocationButton.removeAttribute("disabled");
    const { latitude, longitude } = position.coords;
    socket.emit("sendLocation", { lat: latitude, lon: longitude }, () => {
      console.log("Location Shared!");
    });
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
