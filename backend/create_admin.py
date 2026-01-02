import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from app.core.security import get_password_hash
from app.models.user import UserInDB, Role

async def create_admin():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]
    users_collection = db["users"]

    username = "admin"
    password = "password123"
    
    existing_user = await users_collection.find_one({"username": username})
    if existing_user:
        print(f"User '{username}' already exists.")
        client.close()
        return

    hashed_password = get_password_hash(password)
    
    admin_user = UserInDB(
        username=username,
        hashed_password=hashed_password,
        role=Role.ADMIN,
        full_name="Administrator",
        is_active=True
    )

    await users_collection.insert_one(admin_user.model_dump(by_alias=True, exclude={"id"}))
    print(f"Successfully created user: {username} / {password}")
    client.close()

if __name__ == "__main__":
    asyncio.run(create_admin())
