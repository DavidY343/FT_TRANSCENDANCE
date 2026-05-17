from tokenize import TokenError
from django.shortcuts import render
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from .serializers import RegisterSerializer, LoginSerializer

# Obtiene TU modelo User personalizado (con UUID)
User = get_user_model()

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

        # Tu USERNAME_FIELD = "username", así que autentica con username
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
                "user": {  # Añade info del usuario en la respuesta
                    "id": str(user.id),  # UUID convertido a string
                    "username": user.username,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                }
            }
        )
    

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response(
                    {"error": "Refresh token required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            token = RefreshToken(refresh_token)
            
            # IMPORTANTE: Tu user.id es UUID, convertir ambos a string para comparar
            if str(token.payload.get('user_id')) != str(request.user.id):
                return Response(
                    {"error": "Token does not belong to user"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            token.blacklist()
            
            return Response(
                {"message": "Successfully logged out"},
                status=status.HTTP_200_OK
            )
            
        except TokenError as e:
            return Response(
                {"error": f"Invalid refresh token: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )