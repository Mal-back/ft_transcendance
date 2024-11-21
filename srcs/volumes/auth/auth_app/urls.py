from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenBlacklistView
from django.contrib.auth import views as auth_views

from . import views


urlpatterns = [
        path('', views.UserCreateView.as_view(), name='auth-create'),
        # path('login', TokenObtainPairView.as_view(), name='auth-login'),
        path('login/', views.CustomTokenObtainPairView.as_view(), name='auth-login'),
        path('otp/', views.OTPValidationView.as_view(), name='auth-otp'),
        path('refresh/', TokenRefreshView.as_view() , name='auth-refresh'),
        path('logout/', TokenBlacklistView.as_view(), name='auth-logout'),
        path('delete/<str:username>/', views.UserDeleteView.as_view(), name='auth-delete'),
        path('update/<str:username>/', views.UserUpdateView.as_view(), name='auth-update'),
        path('password/<str:username>/', views.PasswordUpdateView.as_view(), name='password-update'),
        path('internal/auth/', views.ServiceJWTObtainPair.as_view(), name='service-auth'),
        path('password_reset/', auth_views.PasswordResetView.as_view(), name='password_reset'),
        path('password_reset/done/', auth_views.PasswordResetDoneView.as_view(), name='password_reset_done'),
        path('reset/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
        path('reset/done/', auth_views.PasswordResetCompleteView.as_view(), name='password_reset_complete'),
        path('dump_data/', views.DumpPersonnalData.as_view(), name='dump_data'),
        path("<str:username>/", views.UserDetailView.as_view(), name='auth-detail'),
]
