from django.urls import path
from . import views


urlpatterns = [
        path('', views.PublicUserList.as_view(), name='user-list'),
        path('create/', views.PublicUserCreate.as_view(), name='user-create'),
        path('<str:username>/', views.PublicUserRetrieveDetail.as_view(), name='user-detail'),
        path('<str:username>/update/', views.PublicUserUpdate.as_view(), name='user-update'),
        path('<str:username>/delete/', views.PublicUserDelete.as_view(), name='user-delete'),
        path('<str:username>/increment/<str:lookupfield>/', views.PublicUserIncrement.as_view(), name='user-increment'),
        path('<str:username>/friend/add/<str:friendusername>', views.PublicUserAddFriend.as_view(), name='user-add-friend'),
        path('<str:username>/friend/', views.PublicUserListFriends.as_view(), name='user-list-friend'),
        path('<str:username>/friend/delete/<str:friendusername>', views.PublicUserRemoveFriend.as_view(), name='user-remove-friend'),

]
