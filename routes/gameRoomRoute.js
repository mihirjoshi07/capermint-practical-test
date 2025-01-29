const express = require("express");
const { createRoom, joinRoom, listActiveRooms, makeMove, getTopPlayers, requestRematch } = require("../controllers/gameRoomController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


router.post("/createRoom",authMiddleware, createRoom);
router.post("/joinRoom",authMiddleware, joinRoom);
router.get("/list", authMiddleware,listActiveRooms);
router.post("/make-move",authMiddleware, makeMove);
router.post("/rematch", authMiddleware, requestRematch);
module.exports = router;
