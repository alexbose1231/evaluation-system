from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field, EmailStr
from bson import ObjectId

class Role(str, Enum):
    ADMIN = "admin"
    ASSESSOR = "assessor"
    VIEWER = "viewer"

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Role = Role.ASSESSOR
    is_active: bool = True

class UserCreate(UserBase):
    password: str = Field(..., min_length=4)

class UserInDB(UserBase):
    id: Optional[str] = Field(None, alias="_id")
    hashed_password: str

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "username": "kim_assessor",
                "email": "kim@example.com",
                "role": "assessor",
                "is_active": True
            }
        }
