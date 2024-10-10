const WebSocket = require('ws');
const socket = new WebSocket('ws://localhost:8080/api/game/ws/4445');

socket.onopen = function(event) {
	socket.send(JSON.stringify({
		type : "init_game",
		message : "Salut tout le monde",
		name : "Jack",
	}));

	setTimeout(() => { 	socket.send(JSON.stringify({
		type : "start_game",
		message : "Salut tout le monde",
		name : "Jack",
	})) }, 2000)
}

socket.onmessage = function(event){
	const msg = event.data;
	console.log(`${msg}`)
	socket.send(JSON.stringify({
		type : "move",
		player : "player_1",
		direction : "UP",
	}));	

}

socket.onerror = function(event) {
  console.log('Error occurred while connecting to the WebSocket server');
};

socket.onclose = function(event) {
  console.log('Disconnected from the WebSocket server');
};