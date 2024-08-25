from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenBlacklistView

from . import views


urlpatterns = [
        path('', views.UserCreateView.as_view(), name='auth-create'),
        path("<int:pk>", views.UserDetailView.as_view(), name='auth-detail'),
        path('login', TokenObtainPairView.as_view(), name='auth-login'),
        path('refresh', TokenRefreshView.as_view() , name='auth-refresh'),
        path('logout', TokenBlacklistView.as_view(), name='auth-logout'),
        path('delete/<int:pk>', views.UserDeleteView.as_view(), name='auth-delete'),
        path('update/<int:pk>', views.UserUpdateView.as_view(), name='auth-update'),
]
