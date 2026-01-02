from typing import List
from fastapi import APIRouter, Body, HTTPException, status, Request
from fastapi.encoders import jsonable_encoder
from app.models.user import UserCreate, UserInDB
from app.core.security import get_password_hash

router = APIRouter()

@router.post("/", response_description="Add new user", status_code=status.HTTP_201_CREATED)
async def create_user(request: Request, user: UserCreate = Body(...)):
    user_dict = user.model_dump() # Pydantic v2
    
    # Check if user already exists
    if await request.app.mongodb["users"].find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # Hash password and prepare for DB
    password = user_dict.pop("password")
    user_dict["hashed_password"] = get_password_hash(password)
    
    new_user = UserInDB(**user_dict)
    new_user_dict = jsonable_encoder(new_user)
    if "_id" in new_user_dict:
        del new_user_dict["_id"]
    
    created_user = await request.app.mongodb["users"].insert_one(new_user_dict)
    
    return {"id": str(created_user.inserted_id), "username": user.username}

@router.get("/", response_description="List all users", response_model=List[UserInDB])
async def list_users(request: Request):
    users = []
    cursor = request.app.mongodb["users"].find()
    async for doc in cursor:
        doc["_id"] = str(doc["_id"]) # ObjectId -> str 변환
        users.append(doc)
    return users
