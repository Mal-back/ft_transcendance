function createInstance() {
	const WebSocket = require('ws');
	const socket = new WebSocket('wss://made-f0Ar1s4.clusters.42paris.fr:8080/api/game/pong-local/join/', {
		rejectUnauthorized: false
	});
	socket.onopen = function(event) {
		console.log("Socket connected")
		socket.send(JSON.stringify({
			type : "init_game",
		}))
		socket.send(JSON.stringify({
			type : "get_config",
		}))
		socket.send(JSON.stringify({
			type : "start_game",
		}))
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "pause",
			action: "stop"
		})) }, 4500)
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "pause",
			action: "start"
		})) }, 9500)
	}
	socket.onmessage = function(event){
		const msg = event.data;
		console.log(`${msg}`)
	}
	socket.onerror = function(event) {
	  console.log('Error occurred while connecting to the WebSocket server');
	};
	socket.onclose = function(event) {
	  console.log('Socket 1 Disconnected from the WebSocket server');
	};
}

function testMultipleInstances(n) {
	for (let i = 0 ; i < n ; i++) {
		console.log("Creating instance num " + i)
		createInstance()
	}
}

testMultipleInstances(15)