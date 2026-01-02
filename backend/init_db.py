import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

async def init_db():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]
    
    items_collection = db["items"]
    
    # Check if items already exist
    if await items_collection.count_documents({}) > 0:
        print("Items collection is not empty. Skipping seeding.")
        client.close()
        return

    items_data = [
        {
            "code": "Q1",
            "category": "역량평가",
            "title": "직무 관련 전문 지식",
            "input_type": "scale_5",
            "config": {
                "max_score": 5,
                "labels": ["매우 미흡", "미흡", "보통", "우수", "매우 우수"]
            },
            "is_active": True
        },
        {
            "code": "Q2",
            "category": "태도평가",
            "title": "업무 수행 태도 및 성실성",
            "input_type": "scale_5",
            "config": {
                "max_score": 5,
                "labels": ["매우 불성실", "불성실", "보통", "성실", "매우 성실"]
            },
            "is_active": True
        },
        {
            "code": "S1",
            "category": "성과평가",
            "title": "연간 실적 달성도 (정량)",
            "input_type": "score_100",
            "config": {
                "max_score": 100,
                "description": "KPI 달성률에 따른 점수 입력 (0~100)"
            },
            "is_active": True
        },
        {
            "code": "S2",
            "category": "다면평가",
            "title": "동료 다면 평가 환산 점수",
            "input_type": "score_100",
            "config": {
                "max_score": 100
            },
            "is_active": True
        }
    ]

    await items_collection.insert_many(items_data)
    print("Successfully seeded 4 initial items.")
    client.close()

if __name__ == "__main__":
    asyncio.run(init_db())
