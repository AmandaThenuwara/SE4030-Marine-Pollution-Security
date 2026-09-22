const mongoose = require("mongoose");

const chReportSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    title: { type: String, required: [true, "Title is required"], trim: true },

    // Categories (multi-select)
    categories: {
      type: [String],
      required: [true, "At least one category is required"],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "At least one category is required",
      },
    },

    // If categories includes "Other", user can specify it
    otherCategoryText: { type: String, default: "", trim: true },

    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      required: [true, "Severity is required"],
    },

    // Location selected on map
    location: {
      lat: { type: Number, required: [true, "Latitude is required"] },
      lng: { type: Number, required: [true, "Longitude is required"] },
      address: { type: String, default: "", trim: true }, // optional
    },

    // Photo URL (local storage)
    photoUrl: { type: String, required: [true, "Photo is required"] },

    // AI + final description (next milestone will generate AI)
    aiStatus: {
      type: String,
      enum: ["pending", "done", "failed", "skipped"],
      default: "pending",
    },
    aiDescription: { type: String, default: "", trim: true },
    finalDescription: { type: String, default: "", trim: true },

    // Publish flow (later endpoint toggles this)
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Force collection name: ch_reports
module.exports = mongoose.model("ChReport", chReportSchema, "ch_reports");