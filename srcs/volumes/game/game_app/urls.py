from django.urls import path
from . import views

urlpatterns = [
	path('', views.GameList.as_view(), name='game-list'),
	path('create/', views.GameCreate.as_view(), name='game-create'),
	path('getconst/', views.SendConstJson, name='const'),
	path('<uuid:id>/', views.GameRetrieveDetail.as_view(), name='game-detail'),
 ]
