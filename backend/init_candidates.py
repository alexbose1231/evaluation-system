import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from app.models.candidate import AssessmentStatus

async def init_candidates():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]
    
    # 1. Admin User ID 찾기
    admin_user = await db["users"].find_one({"username": "admin"})
    if not admin_user:
        print("Admin user not found. Run create_admin.py first.")
        client.close()
        return
    admin_id = str(admin_user["_id"])

    # 2. Items ID 찾기
    items_cursor = db["items"].find({})
    item_ids = []
    async for item in items_cursor:
        item_ids.append(str(item["_id"]))
    
    if not item_ids:
        print("No items found. Run init_db.py first.")
        client.close()
        return

    # 3. Candidates 데이터 생성
    candidates_data = [
        {
            "name": "홍길동",
            "department": "도시계획과",
            "position": "주무관",
            "employee_id": "2024001",
            "assignments": [
                {
                    "assessor_id": admin_id,
                    "item_ids": item_ids, # 모든 항목 평가
                    "status": AssessmentStatus.PENDING
                }
            ]
        },
        {
            "name": "이순신",
            "department": "안전총괄과",
            "position": "팀장",
            "employee_id": "2024002",
            "assignments": [
                {
                    "assessor_id": admin_id,
                    "item_ids": item_ids[:2], # 일부 항목만 평가
                    "status": AssessmentStatus.PENDING
                }
            ]
        }
    ]
    
    # 기존 데이터 확인 후 삽입
    if await db["candidates"].count_documents({}) == 0:
        await db["candidates"].insert_many(candidates_data)
        print(f"Successfully created {len(candidates_data)} candidates assigned to admin.")
    else:
        print("Candidates already exist. Skipping.")

    client.close()

if __name__ == "__main__":
    asyncio.run(init_candidates())
