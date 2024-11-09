const WebSocket = require('ws');
const readline = require('readline');

const wsUrl = 'wss://localhost:8080/api/game/c4-remote/join/';
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


function surrend() {
	ws.send(JSON.stringify({
		type : "surrend",
	}))
}


function put() {
	rl.question('Enter column number to move: ', (column) => {
	  // Validate the input; you might want to add more checks based on your game's rules
	  const columnNum = parseInt(column, 10);
	ws.send(JSON.stringify({
		type: "put",
		column: columnNum
	}));
	promptInput();
	});
  }

  function join() {
    rl.question('Enter auth key: ', (key) => {
        const authKey = key;

        rl.question('Enter game ID: ', (gameId) => {
            const gameID = gameId;

            ws.send(JSON.stringify({
                type: "join_game",
                auth_key: authKey,
                game_id: gameID
            }));

            promptInput(); // Ensure this function exists and prompts correctly
        });
    });
}


function showHelp() {
	console.log(`
  Available commands:
  - join           : First thing to do before sending anything to the websocket
  - init           : Initialize game thread.
  - config         : Get game configuration.
  - start          : Start the game.
  - close          : Close the WebSocket connection.
  - exit           : Exit the script.
  - help           : Show this help message.
  - pause          : Pause the game.
  - unpause        : Unpause the game.
  - surrend        : Surrend the game
  - put            : Put a disk
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
	case 'join':
		join();
		break;
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
	case 'surrend':
		surrend();
		break;
	case 'put':
		put();
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