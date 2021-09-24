const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    minlength: 2,
  },
  room: {
    type: String,
    required: true,
    minlength: 2,
  },
  socketId: {
    type: String,
    required: true,
    unique: true,
  },
});

userSchema.index({ username: 1, room: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);

module.exports = User;
