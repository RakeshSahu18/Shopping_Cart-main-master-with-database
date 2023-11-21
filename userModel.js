var mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  Email: {
    type: String,
    required: true,
    unique: true,
  },
  Password: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("users", userSchema);

module.exports = User;
