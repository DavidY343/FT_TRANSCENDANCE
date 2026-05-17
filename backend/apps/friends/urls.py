from django.urls import path
from .views import (
    FriendshipListView, 
    RequestFriendshipView, 
    AcceptFriendshipView, 
    RemoveFriendshipView
)

urlpatterns = [
    path('list/', FriendshipListView.as_view(), name='friend-list'),
    path('request/', RequestFriendshipView.as_view(), name='friend-request'),
    path('accept/<uuid:pk>/', AcceptFriendshipView.as_view(), name='friend-accept'),
    path('remove/<uuid:pk>/', RemoveFriendshipView.as_view(), name='friend-remove'),
]