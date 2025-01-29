const express = require('express');
const app = express();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const connectDB = require("./config/db");
connectDB();
const http = require("http");
const socketIo = require("socket.io");
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Import routes
const authRoute = require("./routes/authRoute");
const gameRoomRoute = require("./routes/gameRoomRoute");
const topPlayersRoute=require("./routes/topPlayersRoute");
// Register routes
app.use("/auth", authRoute);
app.use("/rooms", gameRoomRoute);
app.use("/leaderboard",topPlayersRoute);


// Routes will be defined here
app.get("/health", (req, res) => {
    return res.send("Health route");
});

// Create HTTP server and Socket.IO instance
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST", "PATCH", "PUT", "DELETE"]
    }
});

// Socket.IO authentication middleware
io.use((socket, next) => {
    const token = socket.handshake.query.token;  
    if (!token) {
        return next(new Error("Authentication error"));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return next(new Error("Authentication error"));
        }
        socket.userdata = decoded; 
        next();
    });
});

// Handle Socket.IO connection
io.on("connection", (socket) => {
    console.log(`User connected: ${socket.userdata.username}`);
    socket.user = socket.id;  // Send a message to the connected user
    socket.emit("message", { text: "Welcome to the Socket.IO server!" });

    
    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.user.username}`);
    });
});


// Start the server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
module.exports = { io };
