const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 8080 });

server.on('connection', (socket) => {
  console.log('Client connected');
  socket.on('message', (message) => {
    console.log(`Received: ${message}`);
    socket.send(`Server received: ${message}`);
  });

  socket.on('close', () => {
    console.log('Client disconnected');
  });

  socket.send('Welcome to an Advanced Chess Game!');
});

console.log('WebSocket server is listening on ws://localhost:8080');
