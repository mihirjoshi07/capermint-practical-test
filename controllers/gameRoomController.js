const GameRoom = require("../models/GameRoom");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/User");


// Hey recruiter This is create room controller
const createRoom = async (req, res) => {
    try {
        const createdBy = req.user._id;
        const { roomName, isPrivate } = req.body;

        let joinCode;
        if (isPrivate) {
            joinCode = uuidv4();
        }

        const newRoom = await GameRoom.create({
            roomName,
            createdBy,
            isPrivate,
            joinCode,
            players: [createdBy],
        });

        res.status(201).json(newRoom);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
//Hey there, this is join room controller
const joinRoom = async (req, res) => {
    try {
        const { roomId, joinCode } = req.body;
        const playerId = req.user._id;

        // Find the room by either joinCode or roomId YO!
        const room = joinCode
            ? await GameRoom.findOne({ joinCode })
            : await GameRoom.findById(roomId);

        if (!room) {
            return res.status(404).json({ error: "Room not found" });
        }


        if (room.players.includes(playerId)) {
            return res
                .status(400)
                .json({ message: "You have already joined this room." });
        }


        if (room.players.length >= room.maxPlayers) {
            return res.status(400).json({ message: "Room is full." });
        }


        room.players.push(playerId);

        // Start the game if two players have joined
        if (room.players.length === room.maxPlayers) {
            room.currentTurn = room.players[0]; // Set the first player's turn
        }

        await room.save();

        res
            .status(200)
            .json({ message: "Successfully joined the room.", room });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// HEY YOU CAN JOIN IN ONE OF THESE ACTIVE ROOMS
const listActiveRooms = async (req, res) => {
    try {
        const rooms = await GameRoom.find({
            isPrivate: false,
            $expr: { $lt: [{ $size: "$players" }, 2] }, // Check if the array size is less than 2
        });

        res.status(200).json(rooms);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//THE GAME begins.... make move and play
const makeMove = async (req, res) => {
    try {
        const { roomId, position } = req.body; // Position is the index (0-8)
        const playerId = req.user._id;

        // Validate position
        if (position < 0 || position > 8) {
            return res.status(400).json({ message: "Invalid position. Position must be between 0 and 8." });
        }

        const room = await GameRoom.findById(roomId);

        if (!room) {
            return res.status(404).json({ error: "Room not found" });
        }

        if (room.winner) {
            return res.status(400).json({ message: "Game is already over." });
        }

        if (String(room.currentTurn) !== String(playerId)) {
            return res.status(400).json({ message: "Not your turn!" });
        }

        if (room.gameState[position]) {
            return res.status(400).json({ message: "Position already taken." });
        }

        // Make the move
        room.gameState[position] = String(playerId);

        // Check for a winner or a draw
        const winner = checkWinner(room.gameState);
        if (winner) {
            room.winner = playerId;


            await User.updateOne({ _id: playerId }, { $inc: { wins: 1 } });


            const loser = room.players.find((p) => String(p) !== String(playerId));
            if (loser) {
                await User.updateOne({ _id: loser }, { $inc: { losses: 1 } });
            }
        } else if (!room.gameState.includes(null)) {

            await User.updateMany({ _id: { $in: room.players } }, { $inc: { draws: 1 } });

            return res.status(200).json({ message: "It's a draw!" });
        } else {
            // Switch the turn
            const nextPlayer = room.players.find((p) => String(p) !== String(playerId));
            room.currentTurn = nextPlayer;
        }

        await room.save();
        res.status(200).json({ message: "Move successful.", room });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



const checkWinner = (gameState) => {
    const winningCombinations = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    for (const [a, b, c] of winningCombinations) {
        if (
            gameState[a] &&
            gameState[a] === gameState[b] &&
            gameState[a] === gameState[c]
        ) {
            return gameState[a];
        }
    }

    return null;
};


//Need to take revenge.. Lets sent request for rematch......
const requestRematch = async (req, res) => {
    try {
        const { roomId } = req.body;
        const playerId = req.user._id;

        const room = await GameRoom.findById(roomId);

        if (!room) {
            return res.status(404).json({ error: "Room not found" });
        }

        if (!room.winner && room.gameState.includes(null)) {
            return res.status(400).json({ message: "Game is still in progress." });
        }

        if (room.rematchRequested.includes(String(playerId))) {
            return res.status(400).json({ message: "You have already requested a rematch." });
        }

        // Add the player to the rematch request list
        room.rematchRequested.push(playerId);

        // If both players requested a rematch, reset the game
        if (room.rematchRequested.length === 2) {
            room.gameState = Array(9).fill(null); 
            room.winner = null;
            room.rematchRequested = []; 
            room.currentTurn = room.players[Math.floor(Math.random() * 2)]; // Randomize starting player
        }

        await room.save();
        res.status(200).json({ message: "Rematch request sent.", room });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


module.exports = { createRoom, requestRematch, makeMove, joinRoom, listActiveRooms };
