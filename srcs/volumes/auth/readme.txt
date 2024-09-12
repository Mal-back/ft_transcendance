Auth api Documentation

All the url are preceeded by api/auth/

Models:
User : 
- username(150 char max, unique , not null)
- password(128char, not null)
- email(not null, unique) 
- two_fa_enable(boolean)

Done : 
- '' : Create an account allowed method: POST. Expect as payload : username, password, password2, email, two_fa_enable 

- '<str:username>' : Send back account information. Allowed Method: GET. Permissions : Only the owner of the account can access their details. 

- 'login' : Send back a JWT if credentials are correct. Allowed method: POST. Expected payload: username, password

- 'refresh': Send back new token pair. Allowed Method: POST Expected payload: refresh token

- 'logout' : Supress token pair. Allowed Method: POST. Expected payload: refresh token

- 'delete/<str:username>' : Supress user entry. Allowed Method: DELETE. Permissions : Only the owner of the account can access their details.

- 'update/<str:username>' : Update user info. Allowed Method: PUT, PATCH. Expected payload : all user fields on PUT, or only the fields user wants to modify on PATCH.
	 Permissions : Only the owner of the account can access their details.

Need to do : 

- Password Reset : 'reset/request', 'reset/OTL', 
- 2fa 
- Micro Service alternative auth
