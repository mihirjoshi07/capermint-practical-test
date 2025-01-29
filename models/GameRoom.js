
const mongoose = require("mongoose");

const gameRoomSchema = new mongoose.Schema({
  roomName: { type: String, required: true, unique: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  isPrivate: { type: Boolean, required: true },
  joinCode: { type: String, unique: true, sparse: true }, // Optional for private rooms
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  maxPlayers: { type: Number, default: 2 }, // For simplicity, set to 2 players
  gameState: { type: Array, default: Array(9).fill(null) }, // Represents a 3x3 grid
  currentTurn: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Tracks whose turn it is
  winner: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // Winner of the game
  rematchRequested: { type: [mongoose.Schema.Types.ObjectId], default: [] }, // Tracks players requesting rematch
});

module.exports = mongoose.model("GameRoom", gameRoomSchema);
