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

- password/<str:username>: Change password. Allow Methods : PUT, PATCH. Expected payload :
{
	'password':'current password',
	'new_password':'new password',
	'new_password2':'must match new_password',
	}

-	'password_reset/' : Send a reset e mail by word if e mail is known. Post method. Payload: email.
	'password_reset/done/'. Base view from django if the e mail is done. I think we won't use it
	'reset/<uidb64>/<token>/'. Link sent by e-mail to reset password
	'reset/done/'. When reset is done
	WARNING : The e-mail server is not setup so the e mails are simply logs in the console of the django auth docker for the moment

- 'dump_data/': Dump users data by e-mail. Permission : must be authenticated. Method : Get

- 'internal/auth' : Used only by other microservices to fetch their token. Frontend should not use this endpoint. Allowed Method: Post. Expected payload: serviceName, password

Need to do : 
- e-amil validation in order to enable 2fa
- 2fa 
