const app = require("./app");
const socketio = require("socket.io");
const Filter = require("bad-words");

const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");

const {
  addUser,
  removeUser,
  getUsersInRoom,
  getUser,
} = require("./utils/users");

const PORT = process.env.PORT || 3000;

const io = socketio(app);

io.on("connection", (socket) => {
  socket.on("join", (options, cb) => {
    const { error, user } = addUser({ id: socket.id, ...options });

    if (error) {
      return cb(error);
    }

    socket.join(user.room);

    socket.emit("message", generateMessage("Admin", "Welcome!"));
    socket.broadcast
      .to(user.room)
      .emit("message", generateMessage("Admin", `${user.username} has joined`));
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
    cb();
  });

  socket.on("sendMessage", (message, cb) => {
    const usr = getUser(socket.id);
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return cb("Profanity is not allow");
    }

    io.to(usr.room).emit("message", generateMessage(usr.username, message));
    cb();
  });

  socket.on("sendLocation", ({ lat, lon }, cb) => {
    const usr = getUser(socket.id);

    io.to(usr.room).emit(
      "locationMessage",
      generateLocationMessage(
        usr.username,
        `https://google.com/maps?q=${lat},${lon}`
      )
    );
    cb();
  });

  socket.on("disconnect", () => {
    const usrRemoved = removeUser(socket.id);
    if (usrRemoved) {
      io.to(usrRemoved.room).emit(
        "message",
        generateMessage("Admin", `${usrRemoved.username} has left`)
      );
      io.to(usrRemoved.room).emit("roomData", {
        room: usrRemoved.room,
        users: getUsersInRoom(usrRemoved.room),
      });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
