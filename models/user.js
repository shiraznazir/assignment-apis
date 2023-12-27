const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      isRequired: [true, "Please enter your name"],
    },
    password: {
      type: String,
      isRequired: [true, "Please enter password"],
    },
    email: {
      type: String,
      isRequired: [true, "Please enter email"],
    },
    image: {
      type: String,
      isRequired: false,
    },
  },
  { timeStamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
