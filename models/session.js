const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema({
  userId: String,
  guildId: String,
  joinTime: Date,
  leaveTime: Date,
  totalMinutes: Number
});

module.exports = mongoose.model("Session", SessionSchema);
