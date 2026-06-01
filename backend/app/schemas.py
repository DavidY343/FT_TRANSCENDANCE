from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=80)
    password: str = Field(min_length=8, max_length=128)
    display_name: str = Field(min_length=2, max_length=120)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    email: EmailStr
    username: str
    display_name: str
    avatar_url: str | None = None
    elo: int

    model_config = {"from_attributes": True}


class UserUpdateRequest(BaseModel):
    display_name: str = Field(min_length=2, max_length=120)


class FriendOut(BaseModel):
    id: int
    username: str
    display_name: str
    avatar_url: str | None
    online: bool


class UserSearchOut(BaseModel):
    id: int
    username: str
    display_name: str
    avatar_url: str | None
    online: bool


class RefreshRequest(BaseModel):
    refresh_token: str


class CreateAIGameRequest(BaseModel):
    difficulty: str = Field(default="medium", pattern="^(easy|medium|hard)$")
