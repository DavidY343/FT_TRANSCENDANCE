
## Endpoints Base

```
POST /api/auth/register/
POST /api/auth/login/
POST /api/auth/logout/
```

## 1. Register - Registrar Usuario

### Request (JSON Body)

```json
{
  "username": "string (requerido, unico)",
  "email": "string (requerido, unico)",
  "password": "string (requerido, minimo 8 caracteres)",
  "password2": "string (requerido, debe coincidir con password)",
  "first_name": "string (opcional)",
  "last_name": "string (opcional)"
}
```

### Validaciones

- `password` y `password2` deben coincidir
- `username` debe ser unico en el sistema
- `email` debe ser unico en el sistema
- `password` pasa validaciones de seguridad de Django
- Todos los campos requeridos deben estar presentes

### Response (Exito - 201 Created)

```json
{
  "username": "usuario123",
  "email": "usuario@ejemplo.com",
  "first_name": "Juan",
  "last_name": "Perez"
}
```

### Response (Error - 400 Bad Request)

```json
{
  "password": ["Password fields didn't match."]
}
```

```json
{
  "username": ["A user with that username already exists."]
}
```

```json
{
  "email": ["A user with that email already exists."]
}
```

## 2. Login - Iniciar Sesion

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
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "usuario123",
    "email": "usuario@ejemplo.com",
    "first_name": "Juan",
    "last_name": "Perez"
  }
}
```

### Tokens JWT

- `access`: Token de acceso (corto plazo)
- `refresh`: Token de refresco (largo plazo)
- `user`: Informacion basica del usuario (incluye UUID como string)

### Response (Error - 401 Unauthorized)

```json
{
  "detail": "Invalid credentials"
}
```

## 3. Logout - Cerrar Sesion

### Request (JSON Body)

```json
{
  "refresh": "string (requerido)"
}
```

### Headers Requeridos

```
Authorization: Bearer {access_token}
Content-Type: application/json
```

### Response (Exito - 200 OK)

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

# Documentacion de Usuarios y Amistades

## Autenticacion requerida

Todos los endpoints requieren:

```
Authorization: Bearer {access_token}
```

## Usuarios

### Endpoints Base

```
GET /api/users/me/
GET /api/users/search/?search=
```

### 1. Me - Perfil del usuario autenticado

**GET** `/api/users/me/`

#### Response (200 OK)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "usuario123",
  "email": "usuario@ejemplo.com",
  "first_name": "Juan",
  "last_name": "Perez",
  "avatar_url": "https://...",
  "statistics": {
    "total_games": 12,
    "wins": 7,
    "losses": 3,
    "draws": 2,
    "elo_rating": 1200
  }
}
```

### 2. User Search - Buscar usuarios por username

**GET** `/api/users/search/?search={texto}`

#### Query Params

- `search`: texto a buscar en `username` (case-insensitive)

#### Response (200 OK)

Lista de usuarios (maximo 10 resultados), excluye al usuario actual.

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "usuario123",
    "email": "usuario@ejemplo.com",
    "first_name": "Juan",
    "last_name": "Perez",
    "avatar_url": "https://...",
    "statistics": {
      "total_games": 12,
      "wins": 7,
      "losses": 3,
      "draws": 2,
      "elo_rating": 1200
    }
  }
]
```

## Amistades

### Endpoints Base

```
GET    /api/friendships/list/?status=ACCEPTED
POST   /api/friendships/request/
POST   /api/friendships/accept/<uuid:pk>/
DELETE /api/friendships/remove/<uuid:pk>/
```

### Modelo Friendship

- `id`: UUID
- `requester`: usuario que envia la solicitud
- `addressee`: usuario que recibe la solicitud
- `status`: `PENDING`, `ACCEPTED`, `DECLINED`
- `created_at`: fecha de creacion

#### Reglas

- No puedes enviarte solicitud a ti mismo.
- `requester` + `addressee` es unico.

### 1. Friendship List - Listar amistades

**GET** `/api/friendships/list/?status=ACCEPTED`

#### Query Params

- `status`: `PENDING`, `ACCEPTED`, `DECLINED` (por defecto `ACCEPTED`)

#### Response (200 OK)

```json
[
  {
    "id": "c8a5b7c6-1a3b-4a8a-9d9e-1e8b2e123456",
    "requester": "550e8400-e29b-41d4-a716-446655440000",
    "addressee": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "status": "ACCEPTED",
    "created_at": "2024-01-01T12:00:00Z",
    "friend_info": {
      "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "username": "amigo",
      "email": "amigo@ejemplo.com",
      "first_name": "Ana",
      "last_name": "Lopez",
      "avatar_url": "https://...",
      "statistics": {
        "total_games": 20,
        "wins": 10,
        "losses": 8,
        "draws": 2,
        "elo_rating": 1300
      }
    }
  }
]
```

### 2. Request Friendship - Enviar solicitud

**POST** `/api/friendships/request/`

#### Request (JSON Body)

```json
{
  "addressee": "f47ac10b-58cc-4372-a567-0e02b2c3d479"
}
```

#### Response (201 Created)

```json
{
  "id": "c8a5b7c6-1a3b-4a8a-9d9e-1e8b2e123456",
  "requester": "550e8400-e29b-41d4-a716-446655440000",
  "addressee": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "status": "PENDING",
  "created_at": "2024-01-01T12:00:00Z",
  "friend_info": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "username": "amigo",
    "email": "amigo@ejemplo.com",
    "first_name": "Ana",
    "last_name": "Lopez",
    "avatar_url": "https://...",
    "statistics": {
      "total_games": 20,
      "wins": 10,
      "losses": 8,
      "draws": 2,
      "elo_rating": 1300
    }
  }
}
```

#### Errores posibles

- 400 si el body es invalido.
- 400 si intentas enviarte solicitud a ti mismo.
- 400 si ya existe una solicitud igual.

### 3. Accept Friendship - Aceptar solicitud

**POST** `/api/friendships/accept/<uuid:pk>/`

#### Response (200 OK)

```json
{
  "message": "Amistad aceptada"
}
```

#### Response (404 Not Found)

```json
{
  "error": "Peticion no encontrada"
}
```

### 4. Remove Friendship - Eliminar amistad

**DELETE** `/api/friendships/remove/<uuid:pk>/`

#### Response (204 No Content)

#### Response (404 Not Found)

```json
{
  "error": "No existe esa relacion"
}
```

## Serializers (Perfil y Estadisticas)

### ProfileSerializer

Campos:

- `id`, `username`, `email`, `first_name`, `last_name`, `avatar_url`, `statistics`

### GameStatisticsSerializer

Campos:

- `total_games`, `wins`, `losses`, `draws`, `elo_rating`

