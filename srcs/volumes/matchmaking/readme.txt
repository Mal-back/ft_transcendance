All urls start with 'api/matchmaking/'

FrontEnd Urls :
- 'invites': Send pending Invites, on going matches, pending tournament invites. Permission : Authenticated, Method : Get
- 'match/create/' : Create a match. Expected Body : 'player2', 'game_type' Game type CHoices : 'pong', 'connect_four' . Permission : Authenticated, Method : Post
- 'match/<int:pk>/accept/': Accept an invite. Permission : Must be invited, Method : Patch
- 'match/<int:pk>/decline/': Decline an invite. Permission : Must be invited, Method : Patch
- 'match/<int:pk>/delete/': Delete an invite. Permission : Must be match Creator, Method : delete
- 'match/get_accepted/': DEPRECATED Send the match you've accepted, it's here you'll find the uuid of the game room once things are connected with the game. Permission : Must Be authenticated
- 'matchmaking/join/' : Join matchmaking. Permission : Must be logged. Method: Post. Body: game_type: only 'pong' or 'connect_four'
- 'matchmaking/get_match/' : Send Back game info or 204. Permission: Must be logged and in queue. Method: Post. Body: EMpty 
- 'matchmaking/leave/' : Leave MatchMaking Queue. Permission : Must be logged and in queue.
- 'tournament/create/': Create a tournament. Method: Post. Permisson: Must be authenticated and 'game free'(e.g no matchmaking nor simple match accepted)
		Body: game_type, invited_players as a list. 
- 'tournament/add_players/': Add a list of players. Permission: User must be tournament owner, only users not invited yet.
	Tournament status must be 'pending'. Method: PATCH Body: invited_players as a list. 
- 'tournament/remove_players/': Remove a list of players. Permission: User must be tournament owner, only users already invited or that accept invite.
   Tournament status must be 'pending'. Method: PATCH Body: invited_players as a list. 
- 'tournament/delete/': Delete tournament. Permission: User must be tournament owner.Tournament status must be 'pending'. Method: DELETE
-	'tournament/launch/': Launch Tournament. Permission: User must be tournament owner, tournament should have at least 3 confirmed players.Tournament status must be 'pending'. method: PATCH
- 'tournament/<int:pk>/accept/': Accept invite. Permission: User must be invited.Tournament status must be 'pending'. method: PATCH
- 'tournament/<int:pk>/decline/': Decline invite. Permission: User must be invited.Tournament status must be 'pending'. method: PATCH
- 'tournament/<int:pk>/leave/': Leave tournament. Permission: User must have previously accept the invite.Tournament status must be 'pending'. method: PATCH


DEBUG ONLY:
Will be removed at the end , no permission.
- 'match/<int:pk>/debug_force_finished/': Only so Xav can test without connection with game. Set the game state as finished (Simulate what the game micro service would do).
- 'tournament/<int:pk>/debug_force_finished/': Only so Xav can test without connection with game. Set the game state as finished (Simulate what the game micro service would do).
- 'matchmaking/<str:username>/win/': Get, increment user win by one 
- 'matchmaking/<str:username>/lost/': Get, increment user loose by one





Backend Urls :
- 'create/' : Create a user. Expected Body : 'username'. Permission : Only Auth Method : Post
- '<str:username>/update/' : Update a user. Expected Body : 'username'. Permission : Only Auth Method : Post
- '<str:username>/delete/' : Update a user. Permission : Only Auth. Method : Delete
- 'match/<int:pk>/finished/': Received match Result. Permission : only a game. Method : Post
