import re
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator


class RegisterRequest(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=80)
    password: str = Field(min_length=8, max_length=128)
    display_name: str = Field(min_length=2, max_length=120)

    @field_validator("password")
    @classmethod
    def validate_password_policy(cls, value: str) -> str:
        # Typical web password policy: min length + lower + upper + digit + symbol.
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[a-z]", value):
            raise ValueError("Password must include at least one lowercase letter")
        if not re.search(r"[A-Z]", value):
            raise ValueError("Password must include at least one uppercase letter")
        if not re.search(r"\d", value):
            raise ValueError("Password must include at least one number")
        if not re.search(r"[^A-Za-z0-9]", value):
            raise ValueError("Password must include at least one special character")
        return value


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


class FriendRequestOut(BaseModel):
    id: int
    requester_id: int
    addressee_id: int
    status: str
    created_at: datetime
    requester: UserSearchOut | None = None
    addressee: UserSearchOut | None = None


class RefreshRequest(BaseModel):
    refresh_token: str


class CreateAIGameRequest(BaseModel):
    difficulty: str = Field(default="medium", pattern="^(easy|medium|hard)$")
    time_minutes: int = Field(default=10)

    @field_validator("time_minutes")
    @classmethod
    def validate_ai_time_control(cls, value: int) -> int:
        if value not in {5, 10, 30}:
            raise ValueError("time_minutes must be one of: 5, 10, 30")
        return value


class MatchmakingJoinRequest(BaseModel):
    time_minutes: int = Field(default=10)

    @field_validator("time_minutes")
    @classmethod
    def validate_matchmaking_time_control(cls, value: int) -> int:
        if value not in {5, 10, 30}:
            raise ValueError("time_minutes must be one of: 5, 10, 30")
        return value
