from rest_framework import serializers
from .models import GameResults


class GameResultsSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameResults
        fields = [
            "id",
            "player_white",
            "player_black",
            "vs_ai",
            "winner",
            "loser",
            "result",
            "finished_at",
        ]
        read_only_fields = ["id", "finished_at"]

    def validate(self, data):
        winner = data.get("winner")
        loser = data.get("loser")

        if winner and loser and winner == loser:
            raise serializers.ValidationError(
                "Winner and loser cannot be the same user."
            )

        if data.get("result") == "DRAW" and (winner or loser):
            raise serializers.ValidationError(
                "Draw result must not have winner or loser."
            )

        return data
