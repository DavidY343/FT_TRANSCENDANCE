API Documentation - Authentication Service
=============================================

Base URL
------------

http://localhost:8000/

Authentication Endpoints
-------------------------

### 1. User Registration

#### Endpoint: `POST /api/auth/register/`

#### Description: Create a new user account.

#### Headers:

* `Content-Type`: `application/json`

#### Request Body:

json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "password2": "SecurePass123",
  "first_name": "John",
  "last_name": "Doe"
}

#### Response (Success - 201 Created):

json
{
  "username": "john_doe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe"
}

#### Response (Error - 400 Bad Request):

json
{
  "username": ["A user with that username already exists."],
  "email": ["A user with that email already exists."],
  "password": ["Password fields didn't match."]
}

### 2. User Login

#### Endpoint: `POST /api/auth/login/`

#### Description: Authenticate user and receive JWT tokens.

#### Headers:

* `Content-Type`: `application/json`

#### Request Body:

json
{
  "username": "john_doe",
  "password": "SecurePass123"
}

#### Response (Success - 200 OK):

json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "john_doe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe"
  }
}

#### Response (Error - 401 Unauthorized):

json
{
  "detail": "Invalid credentials"
}

### 3. User Logout

#### Endpoint: `POST /api/auth/logout/`

#### Description: Invalidate refresh token (logout).

#### Headers:

* `Authorization`: `Bearer <access_token>`
* `Content-Type`: `application/json`

#### Request Body:

json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

#### Response (Success - 200 OK):

json
{
  "message": "Successfully logged out"
}

#### Response (Error - 400 Bad Request):

json
{
  "error": "Refresh token required"
}

#### Response (Error - 400 Bad Request - Invalid token):

json
{
  "error": "Invalid refresh token: Token is blacklisted"
}

#### Response (Error - 403 Forbidden):

json
{
  "error": "Token does not belong to user"
}

### 4. Token Refresh

#### Endpoint: `POST /api/auth/token/refresh/`

#### Description: Get new access token using refresh token.

#### Headers:

* `Content-Type`: `application/json`

#### Request Body:

json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

#### Response (Success - 200 OK):

json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}


### 5. Get Game State

#### Endpoint: `GET /api/game/GameState/`

#### Description: Get the state of the game
#### Headers:

* `Content-Type`: `application/json`

#### Example:

GET /api/game/GameState/?game_id=254a2ae6-b15b-48e0-8b24-acccea908542


#### Response (Success - 200 OK):

{
  "event": "STATE_SYNC",
  "payload": {
    "gameId": "254a2ae6-b15b-48e0-8b24-acccea908542",
    "fen": "startpos",
    "turn": "w",
    "status": "ACTIVE",
    "clocks": {
      "wMs": 600000,
      "bMs": 600000
    },
    "players": {
      "whiteId": "3ce94a66-6ebd-4e7e-9911-8c9a256d3d21",
      "blackId": "3436368b-7acf-4be2-9a83-9a290a1c7d07"
    }
  }
}
