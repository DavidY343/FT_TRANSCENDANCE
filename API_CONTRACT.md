
```json
{
  "message": "Successfully logged out"
}
```

### Responses de Error

400 Bad Request - Token faltante

```json
{
  "error": "Refresh token required"
}
```

403 Forbidden - Token no pertenece al usuario

```json
{
  "error": "Token does not belong to user"
}
```

400 Bad Request - Token invalido

```json
{
  "error": "Invalid refresh token: {mensaje_del_error}"
}
```

## Headers de Autenticacion

Para endpoints protegidos:

```
Authorization: Bearer {access_token}
```

Ejemplo en JavaScript (Fetch API):

```javascript
fetch('/api/protected-endpoint/', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});
```

# Documentacion de Endpoints de Tokens JWT

## Endpoints Base

```
POST /api/token/             # Obtener par de tokens
POST /api/token/refresh/     # Refrescar token de acceso
```

## 1. Token Obtain Pair - Obtener Tokens (Login alternativo)

### Request (JSON Body)

```json
{
  "username": "string (requerido)",
  "password": "string (requerido)"
}
```

### Response (Exito - 200 OK)

```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

Nota: Este endpoint es similar a `/api/auth/login/` pero:

- Solo retorna tokens (no incluye datos del usuario)
- Usa el serializer por defecto de Simple JWT
- Perfecto para clientes que solo necesitan tokens

### Response (Error - 401 Unauthorized)

```json
{
  "detail": "No active account found with the given credentials"
}
```

## 2. Token Refresh - Refrescar Token de Acceso

### Request (JSON Body)

```json
{
  "refresh": "string (requerido)"
}
```

### Response (Exito - 200 OK)

```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

Importante:

- El nuevo `refresh` token reemplaza al anterior
- Debes actualizar ambos tokens en el frontend

### Responses de Error

400 Bad Request - Token invalido o expirado

```json
{
  "detail": "Token is invalid or expired",
  "code": "token_not_valid"
}
```

400 Bad Request - Token faltante

```json
{
  "refresh": ["This field is required."]
}
```
