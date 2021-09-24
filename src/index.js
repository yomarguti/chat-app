const app = require("./app");
const socketio = require("socket.io");
const Filter = require("bad-words");

require("./db/mongoose");
const User = require("./models/users");

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
  socket.on("join", async (options, cb) => {
    try {
      const user = await User.create({ socketId: socket.id, ...options });
      const usersInRoom = await User.find({ room: user.room });

      socket.join(user.room);

      socket.emit("message", generateMessage("Admin", "Welcome!"));
      socket.broadcast
        .to(user.room)
        .emit(
          "message",
          generateMessage("Admin", `${user.username} has joined`)
        );

      io.to(user.room).emit("roomData", {
        room: user.room,
        users: usersInRoom,
      });

      cb();
    } catch (error) {
      cb(error.message);
    }
  });

  socket.on("sendMessage", async (message, cb) => {
    try {
      const user = await User.findOne({ socketId: socket.id });

      const filter = new Filter();
      if (filter.isProfane(message)) {
        return cb("Profanity is not allow");
      }

      io.to(user.room).emit("message", generateMessage(user.username, message));

      cb();
    } catch (error) {
      return cb("Internal server error");
    }
  });

  socket.on("sendLocation", async ({ lat, lon }, cb) => {
    try {
      const user = await User.findOne({ socketId: socket.id });

      io.to(user.room).emit(
        "locationMessage",
        generateLocationMessage(
          user.username,
          `https://google.com/maps?q=${lat},${lon}`
        )
      );

      cb();
    } catch (error) {
      return cb("Internal server error");
    }
  });

  socket.on("disconnect", async () => {
    try {
      const usrRemoved = await User.findOneAndRemove({ socketId: socket.id });
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
    } catch (error) {
      console.log(error);
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
