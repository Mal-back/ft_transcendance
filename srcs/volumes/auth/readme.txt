Auth api Documentation

All the url are preceeded by api/auth/

Models:
User : 
- id(pk , serial)
- username(150 char max, unique , not null)
- password(128char, not null)
- email(not null, unique) 
- two_fa_enable(boolean)

Done : 
- '' : Create an account allowed method: POST. Expect as payload : username, password, email, two_fa_enable 

- '<int:pk>' : Send back account information. Allowed Method: GET. Permissions : Only the owner of the account can access their details. 

- 'login' : Send back a JWT if credentials are correct. Allowed method: POST. Expected payload: username, password

- 'refresh': Send back new token pair. Allowed Method: POST Expected payload: refresh token

- 'logout' : Supress token pair. Allowed Method: POST. Expected payload: refresh token

- 'delete/<int:pk>' : Supress user entry. Allowed Method: DELETE. Permissions : Only the owner of the account can access their details.

- 'update/<int:pk>' : Update user info. Allowed Method: PUT, PATCH. Expected payload : all user fields on PUT, or only the fields user wants to modify on PATCH.
	 Permissions : Only the owner of the account can access their details.

Need to do : 

- Password Reset : 'reset/request', 'reset/OTL', 
- 2fa 
