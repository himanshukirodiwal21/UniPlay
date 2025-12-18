// index.js - Server with Socket.IO
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({ path: './.env' });

// ✅ Create HTTP server
const httpServer = createServer(app);

// ✅ Initialize Socket.IO
const allowedOrigins = [
  "http://localhost:5173",
  "https://uniplay-qim1ks304-himanshukirodiwal21-gmailcoms-projects.vercel.app"
];

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      // allow server-to-server / Postman
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST"]
  }
});


// ✅ Socket.IO Connection Handler
io.on('connection', (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);

  // Join specific match room
  socket.on('join-match', (matchId) => {
    socket.join(matchId);
    console.log(`📺 Client ${socket.id} joined match: ${matchId}`);
  });

  // Handle score update from scorer
  socket.on('update-score', (data) => {
    console.log('📊 Score Update:', data);
    io.to(data.matchId).emit('score-updated', data);
  });

  // Handle new ball event
  socket.on('new-ball', (data) => {
    console.log('🏏 New Ball:', data);
    io.to(data.matchId).emit('ball-updated', data);
  });

  // Handle wicket event
  socket.on('wicket-fallen', (data) => {
    console.log('⚠️ Wicket Fallen:', data);
    io.to(data.matchId).emit('wicket-update', data);
  });

  // Handle over complete
  socket.on('over-complete', (data) => {
    console.log('✅ Over Complete:', data);
    io.to(data.matchId).emit('over-updated', data);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// ✅ Export io for use in controllers (IMPORTANT!)
export { io };

// ✅ Start server with Socket.IO
connectDB()
  .then(() => {
    httpServer.listen(process.env.PORT || 8000, () => {
      console.log(`🚀 Server is running at port ${process.env.PORT || 8000}`);
      console.log(`🔌 Socket.IO is ready for connections`);
    });
  })
  .catch((err) => {
    console.log("❌ MONGO DB connection failed !!", err);
  });