const WebSocket = require('ws');
const readline = require('readline');

const wsUrl = 'wss://localhost:8080/api/game/c4-local/join/';
const ws = new WebSocket(wsUrl, {
	rejectUnauthorized: false
});

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


function put_1() {
	rl.question('Enter column number to move: ', (column) => {
	  // Validate the input; you might want to add more checks based on your game's rules
	  const columnNum = parseInt(column, 10);
	ws.send(JSON.stringify({
		type: "put",
		player: "player_1",
		column: columnNum
	}));
	promptInput();
	});
  }

  function put_2() {
	rl.question('Enter column number to move: ', (column) => {
	  // Validate the input; you might want to add more checks based on your game's rules
	  const columnNum = parseInt(column, 10);
	ws.send(JSON.stringify({
		type: "put",
		player: "player_2",
		column: columnNum
	}));
	promptInput();
	});
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
  - put_1          : Put disk for player 1
  - put_2          : Put disk for player 2
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
	case 'put_1':
		put_1();
		break;
	case 'put_2':
		put_2();
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