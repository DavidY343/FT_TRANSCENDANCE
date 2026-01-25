from django.urls import path
from .views import LogoutView, RegisterView, LoginView, RefreshView

urlpatterns = [
    path("register/", RegisterView.as_view()),
    path("login/", LoginView.as_view()),
    path("logout/", LogoutView.as_view()),
    path("token/refresh/", RefreshView.as_view(), name="token_refresh"),
]
