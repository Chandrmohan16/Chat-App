import express from "express";
import "dotenv/config"
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";

//Create Express app HTTPS server
const app = express();
const server = http.createServer(app)

//Socket.io setup
export const io = new Server(server, {
    cors: { origin: "*"}
});

// store online users
export const userSocketMap = {}; // userId: socketId

// Socket.io connection handling
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log('User Connected', userId);

    if (userId) userSocketMap[userId] = socket.id;

    // Email online users to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", ()=>{
        console.log("User Disconnected:", userId);
        delete userSocketMap[userId];
        // may bee this is problem check ones
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

//Middlewares setup
app.use(express.json({limit: '4mb'}));
app.use(cors());

// Define routes
app.use("/api/status", (req, res) => res.send("Server is live"));
app.use("/api/auth", userRouter)
app.use("/api/messages", messageRouter)

// connect to the database
await connectDB();

if(process.env.NODE_ENV !== "production"){
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, ()=> console.log("Server is running on PORT: " + PORT));
}

// export server for server
export default server;