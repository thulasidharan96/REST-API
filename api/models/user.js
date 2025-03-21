const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
  },
  password: { type: String, required: true }, // Keep for fallback login
  RegisterNumber: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (v) {
        return /^9533[0-9]{8}$/.test(v);
      },
      message: (props) =>
        `${props.value} is not a valid register number! Must be 12 digits starting with 9533`,
    },
  },
  department: {
    type: String,
    required: true,
    enum: ["CSE", "ECE", "EEE", "MECH"],
    default: "CSE",
  },
  role: {
    type: String,
    required: true,
    enum: ["admin", "user"],
    default: "user",
  },
  onboard: {
    type: Boolean,
    default: false,
  },
  // webAuthnCredentials: {
  //     type: Object,
  //     default: {}, // Stores WebAuthn public key, challenge, etc.
  // }
});

module.exports = mongoose.model("User", userSchema);
