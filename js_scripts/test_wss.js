


function testStart() {

	const WebSocket = require('ws');
	const socket = new WebSocket('ws://localhost:8080/api/game/pong-local/join/', {
		rejectUnauthorized: false
	});
	socket.onopen = function(event) {
		console.log("Socket connected")
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "init_game",
		})) }, 300)
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "get_config",
		})) }, 300)
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "pause",
			action : "stop",
		})) }, 500)
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "move",
			player : "player_1",
			direction: "UP"
		})) }, 900)
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "false",
			surrender : "player_1"
		})) }, 1300)
		setTimeout(() => { 	socket.send(JSON.stringify({
			surrender : "player_1"
		})) }, 1500)
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "start_game",
		})) }, 2100)

	}
	socket.onmessage = function(event){
		const msg = event.data;
		console.log(`${msg}`)
	}
	socket.onerror = function(event) {
	  console.log('Error occurred while connecting to the WebSocket server');
	};
	socket.onclose = function(event) {
	  console.log('Disconnected from the WebSocket server');
	};
}


testStart();