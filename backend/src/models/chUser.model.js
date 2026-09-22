const mongoose = require("mongoose");

const chUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      unique: true,
    },
    passwordHash: { type: String, required: [true, "Password is required"] },
    phone: { type: String, required: [true, "Phone number is required"], trim: true },

    role: {
      type: String,
      enum: ["general", "volunteer"],
      default: "general",
      required: true,
    },

    bio: { type: String, default: "", trim: true },
    profilePicUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

// IMPORTANT: force collection name to avoid clashes
module.exports = mongoose.model("ChUser", chUserSchema, "ch_users");