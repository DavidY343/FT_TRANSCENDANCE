from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

# Obtiene TU modelo User personalizado
User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ("username", "email", "password", "password2", "first_name", "last_name")
        extra_kwargs = {
            'username': {'required': True},
            'email': {'required': True},
            'first_name': {'required': False},
            'last_name': {'required': False}
        }

    def validate(self, attrs):
        # 1. Validar que passwords coinciden
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {"password": "Password fields didn't match."}
            )
        
        # 2. Validar que username no existe
        if User.objects.filter(username=attrs['username']).exists():
            raise serializers.ValidationError(
                {"username": "A user with that username already exists."}
            )
        
        # 3. Validar que email no existe
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError(
                {"email": "A user with that email already exists."}
            )
        
        return attrs

    def create(self, validated_data):
        # Eliminar password2 del diccionario
        validated_data.pop('password2')
        
        # Crear usuario usando TU CustomUserManager
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
        )
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True)