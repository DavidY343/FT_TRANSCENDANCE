from tokenize import TokenError
from django.shortcuts import render

# Create your views here.
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView


from .serializers import RegisterSerializer, LoginSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = authenticate(
            username=serializer.validated_data["username"],
            password=serializer.validated_data["password"],
        )

        if not user:
            return Response(
                {"detail": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            }
        )
    

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # 1. Validar que viene refresh token en el body
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response(
                    {"error": "Refresh token required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # 2. Verificar que el refresh token es válido
            token = RefreshToken(refresh_token)
            
            # 3. OPCIONAL PERTO RECOMENDADO: Verificar ownership
            # El usuario autenticado (request.user) debe ser el dueño del token
            if token.payload.get('user_id') != request.user.id:
                return Response(
                    {"error": "Token does not belong to user"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # 4. Blacklistear el refresh token
            token.blacklist()
            
            # 5. NO blacklistear el access token - expira solo en 5-15 min
            # El frontend debe eliminar ambos tokens localmente
            
            return Response(
                {"message": "Successfully logged out"},
                status=status.HTTP_200_OK
            )
            
        except TokenError as e:
            # Token inválido, expirado, ya blacklisteado, etc.
            return Response(
                {"error": f"Invalid refresh token: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
