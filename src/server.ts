import http from 'http';
import app from './app';
import { db } from './db';
import { Server } from 'socket.io';

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*', // allow every frontend 
  }
});

app.set('io', io);

// 4. Listen for client connections
io.on('connection', (socket) => {
  console.log(`New real-time client connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});


// Verify DB connection before starting the server
db.query('SELECT NOW()')
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to the database', err);
    process.exit(1);
  });