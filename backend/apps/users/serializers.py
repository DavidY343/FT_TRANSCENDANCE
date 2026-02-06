# apps/users/serializers.py (o donde tengas el serializer de user)
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import GameStatistics

User = get_user_model()

class GameStatisticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameStatistics
        fields = ("total_games", "wins", "losses", "draws", "elo_rating")

class ProfileSerializer(serializers.ModelSerializer):
    # Anidamos las estadísticas para que el /me devuelva todo el pack
    statistics = GameStatisticsSerializer(read_only=True)

    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name", "avatar_url", "statistics")