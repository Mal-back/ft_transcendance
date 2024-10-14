Only one url :
api/avatar_manager/:
With Get : Send back a list of all default profile pictures. No permission
With Post: Create a new profile picture, deleting the previous one. Permission: User hould be authenticated. Expected Body : avatar: image
WIth Delete: For users and auth ms only. Delete the avatar
