const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Title of the announcement
  announcement: { type: String, required: true }, // Content of the announcement
  date: { type: Date, default: Date.now }, // Date of announcement
});

// Indexing announcement field to improve search performance
announcementSchema.index({ announcement: "text" });

module.exports = mongoose.model("Announcement", announcementSchema);
