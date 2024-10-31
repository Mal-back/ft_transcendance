const WebSocket = require('ws');
const readline = require('readline');

const wsUrl = 'ws://localhost:8080/api/game/pong-local/join/';
const ws = new WebSocket(wsUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

ws.on('open', () => {
  console.log('Connected to WebSocket server');
  promptInput();
});

ws.onmessage = function(event){
	const msg = event.data;
	console.log(`${msg}`)
}

ws.on('error', (error) => {
  console.error('WebSocket error:', error);
});

ws.on('close', () => {
  console.log('WebSocket connection closed');
});

function init_game() {
	ws.send(JSON.stringify({
		type : "init_game",
	}))
}

function get_config() {
	ws.send(JSON.stringify({
		type : "get_config",
	}))
}

function start_game() {
	ws.send(JSON.stringify({
		type : "start_game",
	}))
}

function pause() {
	ws.send(JSON.stringify({
		type : "pause",
		action : "stop",
	}))
}

function unpause() {
	ws.send(JSON.stringify({
		type : "pause",
		action : "start",
	}))
}

function surrend_1() {
	ws.send(JSON.stringify({
		type : "surrend",
		surrender : "player_1"
	}))
}

function surrend_2() {
	ws.send(JSON.stringify({
		type : "surrend",
		surrender : "player_2"
	}))
}

function up_1() {
	ws.send(JSON.stringify({
		type : "move",
		player: "player_1",
		direction: "UP",
	}))
}

function down_1() {
	ws.send(JSON.stringify({
		type : "move",
		player: "player_1",
		direction: "DOWN",
	}))
}

function up_2() {
	ws.send(JSON.stringify({
		type : "move",
		player: "player_2",
		direction: "UP",
	}))
}

function down_2() {
	ws.send(JSON.stringify({
		type : "move",
		player: "player_2",
		direction: "DOWN",
	}))
}

function showHelp() {
	console.log(`
  Available commands:
  - init           : Initialize game thread.
  - config         : Get game configuration.
  - start          : Start the game.
  - close          : Close the WebSocket connection.
  - exit           : Exit the script.
  - help           : Show this help message.
  - pause          : Pause the game.
  - unpause        : Unpause the game.
  - surrend_1      : Player 1 surrend.
  - surrend_2      : Player 2 surrend.
  - up_1           : Player 1 move up.
  - down_1         : Player 1 move down.
  - up_2           : Player 2 move up.
  - down_2         : Player 2 move down.
  `);
  }

function promptInput() {
  rl.question('Enter command (send help to list commands): ', (input) => {
    handleInput(input);
    promptInput();
  });
}

function handleInput(input) {
  const [command, ...args] = input.split(' ');

  switch (command) {
	case 'start':
		start_game();
		break;
	case 'init':
		init_game();
		break;
	case 'config':
		get_config();
		break;
	case 'pause':
		pause();
		break;
	case 'unpause':
		unpause();
		break;
	case 'surrend_1':
		surrend_1();
		break;
	case 'surrend_2':
		surrend_2();
		break;
	case 'up_1':
		up_1();
		break;
	case 'down_1':
		down_1();
		break;
	case 'up_2':
		up_2();
		break;
	case 'down_2':
		down_2();
		break;
	case 'help':
		showHelp();
		break;
    case 'close':
    	ws.close();
    	rl.close();
    	break;
    case 'exit':
		ws.close();
    	rl.close();
    	process.exit(0);
    default:
    	console.log('Unknown command(send help to list commands):');
    	break;
  }
}

process.on('SIGINT', () => {
  console.log('Exiting...');
  ws.close();
  rl.close();
  process.exit(0);
});