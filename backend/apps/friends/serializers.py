from rest_framework import serializers
from .models import Friendship
from apps.users.serializers import ProfileSerializer # El que ya tienes

class FriendshipSerializer(serializers.ModelSerializer):
    # Esto es para que en el GET veas los datos del amigo, no solo el UUID
    friend_info = serializers.SerializerMethodField()

    class Meta:
        model = Friendship
        fields = ['id', 'requester', 'addressee', 'status', 'created_at', 'friend_info']
        read_only_fields = ['requester', 'status']

    def get_friend_info(self, obj):
        user = self.context['request'].user
        # Si yo soy el que pidió, devuelvo los datos del otro
        other_user = obj.addressee if obj.requester == user else obj.requester
        return ProfileSerializer(other_user).data