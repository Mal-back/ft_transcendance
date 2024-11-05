All urls start with 'api/matchmaking/'

FrontEnd Urls :
- 'invites': Send pending Invites. Permission : Authenticated, Method : Get
- 'match/create/' : Create a match. Expected Body : 'player2', 'game_type' Game type CHoices : 'pong', 'connect_four' . Permission : Authenticated, Method : Post
- 'match/<int:pk>/accept/': Accept an invite. Permission : Must be invited, Method : Patch
- 'match/<int:pk>/decline/': Decline an invite. Permission : Must be invited, Method : Patch
- 'match/<int:pk>/delete/': Delete an invite. Permission : Must be match Creator, Method : delete
- 'match/get_accepted/': Send the match you've accepted, it's here you'll find the uuid of the game room once things are connected with the game. Permission : Must Be authenticated
- 'matchmaking/join/' : Join matchmaking. Permission : Must be logged. Method: Post. Body: game_type: only 'pong' or 'connect_four'
- 'matchmaking/get_match/' : Send Back game info or 204. Permission: Must be logged and in queue. Method: Post. Body: EMpty 
- 'matchmaking/leave/' : Leave MatchMaking Queue. Permission : Must be logged and in queue.


DEBUG ONLY:
Will be removed at the end , no permission.
- 'match/<int:pk>/debug_force_finished/': Only so Xav can test without connection with game. Set the game state as finished (Simulate what the game micro service would do).
- 'matchmaking/<str:username>/win/': Get, increment user win by one 
- 'matchmaking/<str:username>/lost/': Get, increment user loose by one





Backend Urls :
- 'create/' : Create a user. Expected Body : 'username'. Permission : Only Auth Method : Post
- '<str:username>/update/' : Update a user. Expected Body : 'username'. Permission : Only Auth Method : Post
- '<str:username>/delete/' : Update a user. Permission : Only Auth. Method : Delete
- 'match/<int:pk>/finished/': Received match Result. Permission : only a game. Method : Post
