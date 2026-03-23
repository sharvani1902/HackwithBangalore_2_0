const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Internal Bridge: Allows Python backend to broadcast events
app.post('/broadcast', (req, res) => {
  const { event, data } = req.body;
  if (!event) return res.status(400).json({ error: 'Event name required' });
  
  console.log(`[SocketNexus] Broadcasting: ${event}`, data);
  io.emit(event, data);
  res.json({ status: 'success', event });
});

io.on('connection', (socket) => {
  console.log(`[SocketNexus] Persistent client connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`[SocketNexus] Client disconnected: ${socket.id}`);
  });
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`\x1b[36m%s\x1b[0m`, `[SocketNexus] Elite Service Active on Port ${PORT}`);
});
