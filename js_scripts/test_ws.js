function testInit() {

	const WebSocket = require('ws');
	const socket = new WebSocket('ws://localhost:8080/api/game/pong-local/join/');
	socket.onopen = function(event) {
		console.log("Socket connected")
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "get_config",
		})) }, 100)
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "start_game",
		})) }, 300)
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "pause",
			action : "stop",
		})) }, 500)
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "pause",
			action : "start",
		})) }, 700)
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "move",
			player : "player_1",
			direction: "UP"
		})) }, 900)
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "surrend",
			surrender : "player_1"
		})) }, 1100)
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "false",
			surrender : "player_1"
		})) }, 1300)
		setTimeout(() => { 	socket.send(JSON.stringify({
			surrender : "player_1"
		})) }, 1500)
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "init_game",
		})) }, 1700)
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "start_game",
		})) }, 1750)
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "init_game",
		})) }, 1900)
		setTimeout(() => { 	socket.close()}, 3500)

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

function testStart() {

	const WebSocket = require('ws');
	const socket = new WebSocket('wss://localhost:8080/api/game/pong-local/join/');
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

function testGetConfig() {

	const WebSocket = require('ws');
	const socket = new WebSocket('ws://localhost:8080/api/game/pong-local/join/');
	socket.onopen = function(event) {
		console.log("Socket connected")
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "init_game",
		})) }, 300)
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "get_config",
		})) }, 305)
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
		// socket.send(JSON.stringify({
		// 	type : "get_config",
		// }));
	}
	socket.onerror = function(event) {
	  console.log('Error occurred while connecting to the WebSocket server');
	};
	socket.onclose = function(event) {
	  console.log('Disconnected from the WebSocket server');
	};
}

function testPause() {

	const WebSocket = require('ws');
	const socket = new WebSocket('ws://localhost:8080/api/game/pong-local/join/');
	socket.onopen = function(event) {
		console.log("Socket connected")
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "init_game",
		})) }, 300)
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "pause",
			action : "stop"
		})) }, 301)
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "pause",
			action : "stop"
		})) }, 302)
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "init_game",
		})) }, 300)
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "get_config",
		})) }, 305)
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "move",
			player : "player_1",
			direction: "UP"
		})) }, 900)
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "false",
			surrender : "player_1"
		})) }, 1300)
		// setTimeout(() => { 	socket.send(JSON.stringify({
		// 	surrender : "player_1"
		// })) }, 1500)
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "start_game",
		})) }, 2100)
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "pause",
			action: "stop"
		})) }, 2400)
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "pause",
			action: "start"
		})) }, 3000)

	}
	socket.onmessage = function(event){
		const msg = event.data;
		console.log(`${msg}`)
		// setTimeout(() => { 	socket.send(JSON.stringify({
		// 	type : "pause",
		// 	action : "stop"
		// })) }, 50)
		// setTimeout(() => { 	socket.send(JSON.stringify({
		// 	type : "pause",
		// 	action : "start"
		// })) }, 1000)
	}
	socket.onerror = function(event) {
	  console.log('Error occurred while connecting to the WebSocket server');
	};
	socket.onclose = function(event) {
	  console.log('Disconnected from the WebSocket server');
	};
}

function testMove() {

	const WebSocket = require('ws');
	const socket = new WebSocket('ws://localhost:8080/api/game/pong-local/join/');
	socket.onopen = function(event) {
		console.log("Socket connected")
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "init_game",
		})) }, 300)
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "pause",
			action : "stop"
		})) }, 301)
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "pause",
			action : "stop"
		})) }, 302)
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "init_game",
		})) }, 300)
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "get_config",
		})) }, 305)
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
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "move",
			player : "stop",
			direction : "DOWN"
		})) }, 50)
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "move",
			player : "stop",
			direction : "UP"
		})) }, 51)
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "move",
			player : "stop",
			direction : "UP"
		})) }, 50)
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "move",
			player : "stop",
			direction : "DOWN"
		})) }, 51)
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "move",
			player : "stop",
			direction : "DOWN"
		})) }, 50)
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "move",
			player : "stop",
			direction : "UP"
		})) }, 51)
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "move",
			player : "stop",
			direction : "UP"
		})) }, 50)
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "move",
			player : "player_1",
			direction : "DOWN"
		})) }, 51)
	}
	socket.onerror = function(event) {
	  console.log('Error occurred while connecting to the WebSocket server');
	};
	socket.onclose = function(event) {
	  console.log('Disconnected from the WebSocket server');
	};
}

function testSurrend() {

	const WebSocket = require('ws');
	const socket = new WebSocket('ws://localhost:8080/api/game/pong-local/join/');
	socket.onopen = function(event) {
		console.log("Socket connected")
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "init_game",
		})) }, 300)
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "get_config",
		})) }, 305)
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "surrend",
			surrender : "player_2",
		})) }, 400)
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "surrend",
			surrender : "player_2",
		})) }, 460)
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "surrend",
			surrender : "player_1",
		})) }, 480)
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "surrend",
			surrender : "player_1",
		})) }, 490)
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "surrend",
			surrender : "player_1",
		})) }, 500)
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "start_game",
		})) }, 500)
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "surrend",
			surrender : "player_1"
		})) }, 5000)
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

function testChannelFUll() {
	const WebSocket = require('ws');
	const socket = new WebSocket('ws://localhost:8080/api/game/pong-local/join/');
	socket.onopen = function(event) {
		console.log("Socket 1 connected")
		socket.send(JSON.stringify({
			type : "init_game",
		}))
		socket.send(JSON.stringify({
			type : "get_config",
		}))
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
	const socket_2 = new WebSocket('ws://localhost:8080/api/game/pong-local/join/');
	socket_2.onopen = function(event) {
		console.log("Socket 2 connected")
		socket_2.send(JSON.stringify({
			type : "init_game",
		}))
		socket_2.send(JSON.stringify({
			type : "get_config",
		}))
	}
	socket_2.onmessage = function(event){
		const msg = event.data;
		console.log(`${msg}`)
	}
	socket_2.onerror = function(event) {
	  console.log('Error occurred while connecting to the WebSocket server');
	};
	socket_2.onclose = function(event) {
	  console.log('Disconnected from the WebSocket server');
	};
	const socket_3 = new WebSocket('ws://localhost:8080/api/game/pong-local/join/');
	socket_3.onopen = function(event) {
		console.log("Socket 3 connected")
		socket_3.send(JSON.stringify({
			type : "init_game",
		}))
		socket_3.send(JSON.stringify({
			type : "get_config",
		}))
	}
	socket_3.onmessage = function(event){
		const msg = event.data;
		console.log(`${msg}`)
	}
	socket_3.onerror = function(event) {
	  console.log('Error occurred while connecting to the WebSocket server');
	};
	socket_3.onclose = function(event) {
	  console.log('Disconnected from the WebSocket server');
	};
	const socket_4 = new WebSocket('ws://localhost:8080/api/game/pong-local/join/');
	socket_4.onopen = function(event) {
		console.log("Socket 4 connected")
		socket_4.send(JSON.stringify({
			type : "init_game",
		}))
		socket_4.send(JSON.stringify({
			type : "get_config",
		}))
	}
	socket_4.onmessage = function(event){
		const msg = event.data;
		console.log(`${msg}`)
	}
	socket_4.onerror = function(event) {
	  console.log('Error occurred while connecting to the WebSocket server');
	};
	socket_4.onclose = function(event) {
	  console.log('Disconnected from the WebSocket server');
	};
}

function createInstance() {
	const WebSocket = require('ws');
	const socket = new WebSocket('wss://localhost:8080/api/game/pong-local/join/', {
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

function testWss() {
	const WebSocket = require('ws');
	const socket = new WebSocket('ws://localhost:8080/api/game/pong-local/join/');
	socket.onopen = function(event) {
		console.log("Socket 1 connected")
		socket.send(JSON.stringify({
			type : "init_game",
		}))
		socket.send(JSON.stringify({
			type : "get_config",
		}))
		socket.send(JSON.stringify({
			type : "start_game",
		}))
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




// testInit();
// testStart();
// testGetConfig();
// testPause();
// testMove();
// testSurrend();
// testChannelFUll();
// testWss();
testMultipleInstances(15)
// testRemote();