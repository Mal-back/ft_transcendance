modifier settings game JWT
creer le profil du docker dans auth
modifier authentication.py et permissions.py
copier dossier ms_client pour pouvoir envoyer les requetes au docker mathmaking à la fin de la partie

curl --insecure  -X POST https://localhost:8080/api/game/c4-remote/create/ -H 'Content-Type: application/json' -d '{"player_1_name": "leo", "player_2_name": "xavier"}'

Important : when a KeyValue Error is receive from your websocket, the game will ignore it and not send anything, please follow the correct JSON formats described bellow to have the best experience possible with our game.

I - Pong:

A - Local game:

1 - Join a room :

	Establish a websocket connection to "wss://application_host/api/game/pong-local/join/" where :
		- application_host is the combination host-port of the application (ex: localhost:8080).
	
	This will create a room in Django Channel to communicate with the game engine.

2 - Initialise the game :

	Send via the websocket in JSON format : 
	
		{type: "init_game"}
		
	This will :
		- Create the game thread via the pong_local_engine worker
		- The thread is ready to start or send configuration to the client

	You can not initialise the game more than one time.
	If an error occurs initializing the game, you will receive an error message and the websocket will be close
		
3 - Get game configuration : 

	Send via the websocket in JSON format :

		{type: "get_config"}

	This will send you configuration to draw the base game :

		{"type" : "config",
		"board_len": value,
		"board_height": value,
		"ball_size": value,
		"pad_len": value,
		"pad_height": value,
		"player_1": {"pos" : [x, y], "username" : value},
		"player_2": {"pos" : [x, y], "username" : value},
		"ball": [x, y]}

		Where :
			- board_len is the x maximum value
			- board_height is the y maximum value
			- ball size is the ball radius
			- pad_len is the pad size on x axe
			- pad_height is the pad size on y axe
			- player's coordinates are the top-left coordinates of the pad
			- ball's coordinates are the center of the ball
			- To access to initial x or y coordinate of an element, use [0] or [1] (ex: to get initial x of player 2, use player_2.pos[0]).

		Info : coordinates [0, 0] is at top-left of the board.
		Warning : If you get configuration while game runing, you can not access to current player's and ball's positions with the configuration. It will always send you initial coordinates.

4 - Start the game :

	Send via the websocket in JSON format :

		{type: "start_game"}
		
	This will start the game and send you each frame periodically :

		{"type" : "frame",
			"ball" : {"position" : [x, y]},
			"player_1" : {"position" : [x, y], "score" : value},
			"player_2" : {"position" : [x, y], "score" : value},
		}

	Player's coordinates are the top-left coordinates of the pad.
	Ball's coordinates are the center of the ball.
	
5 - Move a player :

	Send via the websocket in JSON format the following message :

		{"type" : "move",
		"player" : value,
		"direction" value,
		}

	Where : 
		- player is either "player_1" or "player_2"
		- move is "UP" or "DOWN"

	This will save the player's movement for the next frame. Player's movement is reset after each frame.
	Sending a movement while game is not started or paused does nothing

6 - Pause the game :

	Send via the websocket in JSON format the following message :

		{"type" : "pause",
		"action" : value,
		}

	Where :
		- action is either "stop" or "start"

	When the game instance receive the pause state, it will send you back a message to handle your pause screen (this will be very usefull for remote game):

		{"type" : "pause",
		"action" : value,
		}

	Stopping a stopped game or starting a started game does nothing.
	You must unpause the game if you send a surrend while the game is paused to end the game.
	If you send "start" via the "pause" type after "init_game" and before "start_game", it will start the game the same way "start_game" does.


7 - Surrend :

	Send via the websocket in JSON format the following message :

	{"type" : "surrend",
	"surrender" : value,
	}

	Where :
		value is either "player_1" or "player_2" (the surrender).
	
	If you send a surrender while the game is stopped with pause, you must unpause the game to end the game and receive the final state.

8 - End state of the game :

	When the game finished (a player obtains the maximum score or a player surrenders), the game sends you a last message  before closing the websocket:

		{"type" : "end_state",
			"winner" : value,
			"score_1" : value,
			"score_2" : value,
		}

	Where : 
		- score_1 is the first players's score at the end of the game
		- score_2 is the second players's score at the end of the game
		- winner is either "player_1" or "player_2"

9 - Error messages from server :

	For debuging purpose, the game may send you error messages in some contexts (for example starting the game before its initialization). You can choose to catch these messages to understand what is wrong.
	The format is :

	{"type" : "error",
	"error_msg" : value
	}

	Where value is the full error message.

10 - Websocket disconnection:

	If you close the websocket connection, your local game instance will be destroyed and you will not be able to recover it

B - Remote game:

1 - Join a room :

	Establish a websocket connection to "wss://application_host/api/game/pong-remote/join/" where :
		- application_host is the combination host-port of the application (ex: localhost:8080).
	
	This will create a room in Django Channel to communicate with the game engine. To join the game room, you need to first send a message in JSON format :

		{"type" : "join_game",
			"game_id" : value,
			"auth_key" : value,
		}

	Where : 
		- game_id is the uuid4 given by the django matchamking application
		- auth_key is the JWT of the player sending the message

	Be carefull : - if the first message send after establishing the websocket connection is not of type "join_room", the websocket will be closed directly.
		- if the django application can not authentify the user (ex: wrong game_id, user not belong to the game_id, wrong auth_key...) the websocket will be closed directly.

2 - Initialise the game :

	Send via the websocket in JSON format : 
	
		{type: "init_game"}
		
	This will :
		- Create the game thread via the pong_local_engine worker
		- The thread is ready to start or send configuration to the client

	You can not initialise the game more than one time.
	If an error occurs initializing the game, you will receive an error message and the websocket will be close

3 - Get game configuration : 

	Send via the websocket in JSON format :

		{type: "get_config"}

	This will send you configuration to draw the base game :

		{"type" : "config",
		"board_len": value,
		"board_height": value,
		"ball_size": value,
		"pad_len": value,
		"pad_height": value,
		"player_1": {"pos" : [x, y], "username" : value},
		"player_2": {"pos" : [x, y], "username" : value},
		"ball": [x, y]}

	Where :
		- board_len is the x maximum value
		- board_height is the y maximum value
		- ball size is the ball radius
		- pad_len is the pad size on x axe
		- pad_height is the pad size on y axe
		- player's coordinates are the top-left coordinates of the pad
		- ball's coordinates are the center of the ball
		- To access to initial x or y coordinate of an element, use [0] or [1] (ex: to get initial x of player 2, use player_2.pos[0]).

	Info : coordinates [0, 0] is at top-left of the board.
	Warning : If you get configuration while game runing, you can not access to current player's and ball's positions with the configuration. It will always send you initial coordinates.
	
	IMPORTANT : In remote game, "get_config" will trigger a "pause" and "frame" send from the server, so you can know the current state of the game in case of reconnection into a game.

4 - Start the game :

	Send via the websocket in JSON format :

		{type: "start_game"}
		
	This will start the game and send you each frame periodically :

		{"type" : "frame",
			"ball" : {"position" : [x, y]},
			"player_1" : {"position" : [x, y], "score" : value},
			"player_2" : {"position" : [x, y], "score" : value},
		}

Player's coordinates are the top-left coordinates of the pad.
Ball's coordinates are the center of the ball.

IMPORTANT : Before the first frame, you will receive a "pause start" event, this means both players a ready and the game is about to start.
After a player sent "start" to the game, the other player has a limited time to connect to the game and start it.


5 - Move the player :

	Send via the websocket in JSON format the following message :

		{"type" : "move",
			"direction" value,
		}

	Where : 
		- move is "UP" or "DOWN"

	This will save the player's movement for the next frame. Player's movement is reset after each frame.
	Sending a movement while game is not started or paused does nothing

6 - Pause the game :

	Send via the websocket in JSON format the following message :

		{"type" : "pause",
			"action" : value,
		}

	Where :
		- action is either "stop" or "start"

	When the game instance receive the pause state, it will send you back a message to handle your pause screen:

		{"type" : "pause",
			"action" : value,
		}

	Stopping a stopped game or starting a started game does nothing.
	You must unpause the game if you send a surrend while the game is paused to end the game.
	If you send "start" via the "pause" type after "init_game" and before "start_game", it will start the game the same way "start_game" does.

	When a player send a pause "stop" action, the response is sent for both players. They will both be put in "stop" state for the game engine. Each player have to send a pause "start" action to continue the game.
	After 30 seconds, even if a player is in "stop" state, the game is unpaused automatically.

7 - Surrend :

	Send via the websocket in JSON format the following message :

	{"type" : "surrend",}
	
	If you send a surrender while the game is stopped with pause, you must unpause the game to end the game and receive the final state.

8 - End state of the game :

	When the game finished (a player obtains the maximum score or a player surrenders), the game sends you a last message before closing the websocket :

		{"type" : "end_state",
			"game" : "pong"
			"winner" : username,
			"looser" : username,
			"score_winner" : value,
			"score_looser" : value,
		}

	Where : 
		- game specifies the type of game played
		- winner and looser are identified by their username.
		- score_winner can be lower or equal to score_looser if a player surrended

	At the end of the game, websocket are automatically closed and the result of the match is sent to the matchmaking application.

9 - Error messages from server :

	For debuging purpose, the game may send you error messages in some contexts (for example starting the game before its initialization). You can choose to catch these messages to understand what is wrong.
	The format is :

	{"type" : "error",
	"error_msg" : value
	}

	Where value is the full error message.

10 - Websocket disconnection:

	If you close the websocket connection, it has the same effect as sending a pause "stop" action :
		- After 30 seconds, the game is unpaused automatically
		- You can reconnect to the game at any moment.
		- You have to send again the join_room message to authenticate the user (see I-B-1), it means you need game_id and JWT of the user.

II - C4 :

A - Local Game :

1 - Join a room :

	Establish a websocket connection to "wss://application_host/api/game/c4-local/join/" where :
		- application_host is the combination host-port of the application (ex: localhost:8080).
	
	This will create a room in Django Channel to communicate with the game engine.

2 - Initialise the game :

	Send via the websocket in JSON format : 
	
		{type: "init_game"}
		
	This will :
		- Create the game thread via the c4_local_engine worker
		- The thread is ready to start or send configuration to the client

	You can not initialise the game more than one time.
	If an error occurs initializing the game, you will receive an error message and the websocket will be close


3 - Get game configuration : 

	Send via the websocket in JSON format :

		{type: "get_config"}

	This will send you configuration to draw the base game :

		{"type" : "config",
		"starting_player" : value,
		"player_1_username" : value,
		"player_2_username" : value,
		"piece_1": value,
		"piece_2": value,}

		Where :
			- starting_player is the username of the player who will put the first disk
			- player_1_username and player_2_username are usernames of the players
			- piece_1 and piece_2 are the characters representing player's disk in the board

4 - Start the game :

	Send via the websocket in JSON format :

		{type: "start_game"}
		
	This will start the game and send you each frame periodically :

		{"type" : "frame",
			"board" : {
				"line_1" : ". . . . . . .",
				"line_2" : ". . . . . . .",
				"line_3" : ". . . . . . .",
				"line_4" : ". . . . . . .",
				"line_5" : ". . . . . . .",
				"line_6" : ". . . . . . .",
			}
			"player_1_username" : value,
			"player_2_username" : value,
			"current_player" : value,
		}

	Each point `.` in a line represents a column. This point could also be a player's disk character ("piece_1" or "piece_2" in the JSON config)
	You will receive a frame after each valid disk put in the board with the 'put' call.

5 - Put a disk :

	Send via the websocket in JSON format the following message :

		{"type" : "put",
		"player" : value,
		"column" value,
		}

	Where : 
		- player is either "player_1" or "player_2".
		- column is the column num in which the player want to put a disk in.

6 - Surrend :

	Send via the websocket in JSON format the following message :

	{"type" : "surrend",
	"surrender" : value,
	}

	Where :
		value is either "player_1" or "player_2" (the surrender).

7 - End state of the game :

	When the game finished , the game sends you a last message before closing the websocket:

		{"type" : "end_state",
			"winner" : value,
			"looser" : value,
		}

	Where : 
		- winner is either "player_1" or "player_2"
		- looser is either "player_1" or "player_2"

8 - Error messages from server :

	For debuging purpose, the game may send you error messages in some contexts (for example starting the game before its initialization). You can choose to catch these messages to understand what is wrong.
	The format is :

	{"type" : "error",
	"error_msg" : value
	}

	Where value is the full error message.

9 - Websocket disconnection:

	If you close the websocket connection, your local game instance will be destroyed and you will not be able to recover it


B - Remote Game :

1 - Join a room :

	Establish a websocket connection to "wss://application_host/api/game/c4-remote/join/" where :
		- application_host is the combination host-port of the application (ex: localhost:8080).
	
	This will create a room in Django Channel to communicate with the game engine. To join the game room, you need to first send a message in JSON format :

		{"type" : "join_game",
			"game_id" : value,
			"auth_key" : value,
		}

	Where : 
		- game_id is the uuid4 given by the django matchamking application
		- auth_key is the JWT of the player sending the message

	Be carefull : - if the first message send after establishing the websocket connection is not of type "join_room", the websocket will be closed directly.
		- if the django application can not authentify the user (ex: wrong game_id, user not belong to the game_id, wrong auth_key...) the websocket will be closed directly.

2 - Initialise the game :

	Send via the websocket in JSON format : 
	
		{type: "init_game"}
		
	This will :
		- Create the game thread via the pong_local_engine worker
		- The thread is ready to start or send configuration to the client

	You can not initialise the game more than one time.
	If an error occurs initializing the game, you will receive an error message and the websocket will be close

3 - Get game configuration : 

	Send via the websocket in JSON format :

		{type: "get_config"}

	This will send you configuration to draw the base game :

		{"type" : "config",
		"starting_player" : value,
		"player_1_username" : value,
		"player_2_username" : value,
		"piece_1": value,
		"piece_2": value,}

		Where :
			- starting_player is the username of the player who will put the first disk
			- player_1_username and player_2_username are usernames of the players
			- piece_1 and piece_2 are the characters representing player's disk in the board

	IMPORTANT : In remote game, "get_config" will trigger a "frame" send from the server, so you can know the current state of the game in case of reconnection into a game.

4 - Start the game :

	Send via the websocket in JSON format :

		{type: "start_game"}
		
	This will start the game and send you each frame periodically :

		{"type" : "frame",
			"board" : {
				"line_1" : ". . . . . . .",
				"line_2" : ". . . . . . .",
				"line_3" : ". . . . . . .",
				"line_4" : ". . . . . . .",
				"line_5" : ". . . . . . .",
				"line_6" : ". . . . . . .",
			}
			"player_1_username" : value,
			"player_2_username" : value,
			"current_player" : value,
		}

	Each point `.` in a line represents a column. This point could also be a player's disk character ("piece_1" or "piece_2" in the JSON config)
	You will receive a frame after each valid disk put in the board with the 'put' call.

	After a player sent "start" to the game, the other player has a limited time to connect to the game and start it.

5 - Put a disk :

	Send via the websocket in JSON format the following message :

		{"type" : "put",
		"column" value,
		}

	Where : 
		- column is the column num in which the player want to put a disk in.

	Warning : If the current player does not send a valid "put" before a certain amount of time, he will automatically loose the game.

6 - Surrend :

	Send via the websocket in JSON format the following message :

	{"type" : "surrend",
	}

7 - End state of the game :

	When the game finished , the game sends you a last message before closing the websocket:

		{"type" : "end_state",
			"game" : "c4",
			"winner" : value,
			"looser" : value,
		}

	Where : 
		- game specifies the type of game played
		- winner is either "player_1" or "player_2"
		- looser is either "player_1" or "player_2"

8 - Error messages from server :

	For debuging purpose, the game may send you error messages in some contexts (for example starting the game before its initialization). You can choose to catch these messages to understand what is wrong.
	The format is :

	{"type" : "error",
	"error_msg" : value
	}

	Where value is the full error message.

10 - Websocket disconnection:

	If you close the websocket connection :
		- You can reconnect to the game at any moment.
		- You have to send again the join_room message to authenticate the user (see I-B-1), it means you need game_id and JWT of the user.
		- The timer of the current player does not stop, this means you have to reconnect quickly to not loose the game.