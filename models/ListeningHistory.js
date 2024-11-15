const mongoose = require("mongoose");

const listeningHistorySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  trackId: {
    type: String,
    required: true,
  },
  trackName: {
    type: String,
    required: true,
  },
  artistName: {
    type: String,
    required: true,
  },
  albumName: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
    index: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  playedDuration: {
    type: Number,
    required: true,
  },
});

// Index for efficient querying of user's listening history by date range
listeningHistorySchema.index({ userId: 1, timestamp: 1 });

module.exports = mongoose.model("ListeningHistory", listeningHistorySchema);
