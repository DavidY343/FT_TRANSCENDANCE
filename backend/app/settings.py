DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "chess_db",
        "USER": "chess_user",
        "PASSWORD": "chess_password",
        "HOST": "localhost",
        "PORT": "5432",
    }
}

AUTH_USER_MODEL = "db.User"
