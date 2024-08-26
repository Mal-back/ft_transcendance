from django.urls import path
from . import views


urlpatterns = [
        path('', views.PublicUserList.as_view(), name='user-list'),
        path('<int:pk>', views.PublicUserRetrieveDetail.as_view(), name='user-detail'),
        path('create', views.PublicUserCreate.as_view(), name='user-create'),
        path('update/<int:pk>', views.PublicUserUpdate.as_view(), name='user-update'),
        path('delete/<int:pk>', views.PublicUserDelete.as_view(), name='user-delete'),
        path('increment/<int:pk>/<str:lookupfield>/', views.PublicUserIncrement.as_view(), name='user-increment')

]

