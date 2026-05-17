from django.urls import path
from .views import MeView, UserSearchView # Importa las que necesites

urlpatterns = [
    path("me/", MeView.as_view(), name="user-me"),
    path("search/", UserSearchView.as_view(), name="user-search"),
]