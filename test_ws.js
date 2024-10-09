// Create a WebSocket instance and connect to the server
const WebSocket = require('ws');
const socket = new WebSocket('ws://localhost:8080/api/game/ws/145 ');

// Define event handlers for connection states
socket.onopen = function(event) {
  console.log('Connected to the WebSocket server');
  // Send a message to the server when the connection is established
  socket.send(JSON.stringify({type: "init.game", username: "random player"}));
};

socket.onmessage = function(event) {
  console.log(`Received message: ${event.data}`);
  // Process the received message
};

socket.onerror = function(event) {
  console.log('Error occurred while connecting to the WebSocket server');
};

socket.onclose = function(event) {
  console.log('Disconnected from the WebSocket server');
};