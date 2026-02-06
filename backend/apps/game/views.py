from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import GameResults
from .serializers import GameResultsSerializer

from apps.game.models import GameResults
from .serializers import GameResultsSerializer

from .services import save_game_result

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def persist_game_result(request):
    try:
        game_result = save_game_result(
            player_white_id=request.data["player_white"],
            player_black_id=request.data.get("player_black"),
            winner_id=request.data.get("winner"),
            loser_id=request.data.get("loser"),
            result=request.data["result"],
            vs_ai=request.data.get("vs_ai", False),
        )
        serializer = GameResultsSerializer(game_result)
        return Response(serializer.data, status=201)
    except ValueError as e:
        return Response({"error": str(e)}, status=400)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_game_results(request):
    """
    Obtener todos los resultados de partidas.
    Se puede filtrar por query params: player_white, player_black, winner
    """
    results = GameResults.objects.all()

    player_white = request.GET.get("player_white")
    player_black = request.GET.get("player_black")
    winner = request.GET.get("winner")

    if player_white:
        results = results.filter(player_white__id=player_white)
    if player_black:
        results = results.filter(player_black__id=player_black)
    if winner:
        results = results.filter(winner__id=winner)

    serializer = GameResultsSerializer(results, many=True)
    return Response(serializer.data)
