from django.urls import path

from . import views

urlpatterns = [
        path('', views.UserCreateView.as_view(), name='user-create'),
        path("<int:pk>", views.UserDetailView.as_view(), name='user-detail'),
]
