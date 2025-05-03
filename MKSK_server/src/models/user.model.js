const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  name: { type: String, required: true },
  village: { type: String, required: false },
  role: { type: String, enum: ["farmer", "admin"], default: "farmer" },
  languagePreference: { type: String, default: "en" },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", UserSchema);
module.exports = User;