from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenBlacklistView
from .views import PublicUserCreateList, PublicUserRetrieveDetail

from . import views


urlpatterns = [
        path('', PublicUserCreateList.as_view(), name='user-list'),
        path('<int:pk>', PublicUserRetrieveDetail.as_view(), name='user-detail')
]

