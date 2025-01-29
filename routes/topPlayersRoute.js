const express = require("express");
const {  getTopPlayers } = require("../controllers/topPlayers");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/get-top-10-players",authMiddleware,getTopPlayers);
module.exports = router;
