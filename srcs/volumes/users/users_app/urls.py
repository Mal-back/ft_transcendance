from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenBlacklistView

from . import views


urlpatterns = [
        path('', views.Index.as_view(), name='auth-create'),
]

