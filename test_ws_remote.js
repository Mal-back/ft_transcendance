function testRemote(game_id, player) {
	const WebSocket = require('ws');
	
	const socket = new WebSocket('ws://localhost:8080/api/game/pong-remote/join/');
	socket.onopen = function(event) {
		console.log("Socket connected")
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "join_game",
			game_id: game_id,
			username: player,
			auth_key: "1234"
		})) }, 500)
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "init_game",
		})) }, 700)
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "get_config",
		})) }, 1000)
		setTimeout(() => { 	socket.send(JSON.stringify({
			type : "start_game",
		})) }, 1500)



		// setTimeout(() => { 	socket.send(JSON.stringify({
		// 	type : "pause",
		// 	action : "start",
		// })) }, 10000)
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

testRemote("e367140d-3219-4dcd-970f-50a93be870e6", "xavier");