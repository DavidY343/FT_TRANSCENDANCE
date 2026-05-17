from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.db.models import Q
from .models import Friendship
from .serializers import FriendshipSerializer

# GET /api/friendships/list/?status=ACCEPTED
class FriendshipListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        status_param = request.query_params.get('status', 'ACCEPTED').upper()
        friendships = Friendship.objects.filter(
            (Q(requester=request.user) | Q(addressee=request.user)),
            status=status_param
        )
        serializer = FriendshipSerializer(friendships, many=True, context={'request': request})
        return Response(serializer.data)

# POST /api/friendships/request/
class RequestFriendshipView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # El addressee viene en el body
        serializer = FriendshipSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(requester=request.user, status="PENDING")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# POST /api/friendships/accept/<uuid:pk>/
class AcceptFriendshipView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            friendship = Friendship.objects.get(pk=pk, addressee=request.user)
            friendship.status = "ACCEPTED"
            friendship.save()
            return Response({"message": "Amistad aceptada"})
        except Friendship.DoesNotExist:
            return Response({"error": "Petición no encontrada"}, status=status.HTTP_404_NOT_FOUND)

# DELETE /api/friendships/remove/<uuid:pk>/
class RemoveFriendshipView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        # Cualquiera de los dos puede romper la relación
        friendship = Friendship.objects.filter(
            Q(pk=pk) & (Q(requester=request.user) | Q(addressee=request.user))
        ).first()
        
        if friendship:
            friendship.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({"error": "No existe esa relación"}, status=status.HTTP_404_NOT_FOUND)