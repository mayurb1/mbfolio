const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  bio: { type: String, maxlength: 500 },
  profileImage: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Users", userSchema);
