from django.http import JsonResponse
from apps.contracts.api_contracts import api_success, api_error
from apps.contracts.ws_contracts import state_sync_payload
from .models import Game
from .serializers import serialize_game_to_gamestate


def get_game_state(request):
    game_id = request.GET.get("game_id")
    if not game_id:
        return JsonResponse({"success": False, "error": "No game_id provided"}, status=400)

    try:
        game = Game.objects.get(id=game_id)
    except Game.DoesNotExist:
        return JsonResponse({"success": False, "error": "Game not found"}, status=404)

    game_state = serialize_game_to_gamestate(game)
    return JsonResponse(state_sync_payload(game_state))
