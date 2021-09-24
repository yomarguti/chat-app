const socket = io();

//Templates
const roomListTemplate = document.getElementById("rooms-template").innerHTML;

socket.emit("listRooms");

socket.on("activeRooms", ({ rooms }) => {
  console.log("rooms: ", rooms);
  const html = Mustache.render(roomListTemplate, { rooms });
  document.getElementById("room-list").innerHTML = html;
});
