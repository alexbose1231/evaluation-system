import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from app.routers import users, auth, items, candidates, evaluations, monitoring

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    app.mongodb_client = AsyncIOMotorClient(settings.MONGODB_URL)
    app.mongodb = app.mongodb_client[settings.DATABASE_NAME]
    print("Successfully connected to MongoDB")
    yield
    # Shutdown
    app.mongodb_client.close()
    print("Successfully disconnected from MongoDB")

app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

# CORS 설정
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=settings.API_V1_STR, tags=["auth"])
app.include_router(users.router, prefix=f"{settings.API_V1_STR}/users", tags=["users"])
app.include_router(items.router, prefix=f"{settings.API_V1_STR}/items", tags=["items"])
app.include_router(candidates.router, prefix=f"{settings.API_V1_STR}/candidates", tags=["candidates"])
app.include_router(evaluations.router, prefix=f"{settings.API_V1_STR}/evaluations", tags=["evaluations"])
app.include_router(monitoring.router, prefix=f"{settings.API_V1_STR}/monitoring", tags=["monitoring"])

# Frontend Static Files Serving
# 현재 파일(main.py)의 위치: backend/main.py
# 프로젝트 루트: D:\Workspace\평가시스템
# dist 폴더 위치: D:\Workspace\평가시스템\client\dist

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST_DIR = os.path.join(BASE_DIR, "client", "dist")

if os.path.exists(DIST_DIR):
    # Assets 폴더 마운트 (JS, CSS 등)
    app.mount("/assets", StaticFiles(directory=os.path.join(DIST_DIR, "assets")), name="assets")

    # SPA 라우팅을 위한 Catch-all 라우트 (API 제외)
    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        # API 경로는 위에서 이미 처리됨. 여기는 나머지 경로.
        # 파일이 실제로 존재하면 그 파일을 반환 (favicon.ico 등)
        file_path = os.path.join(DIST_DIR, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        
        # 그 외 모든 경로는 index.html 반환 (React Router가 처리)
        return FileResponse(os.path.join(DIST_DIR, "index.html"))
else:
    print(f"Warning: Frontend build not found at {DIST_DIR}. Run 'npm run build' in client directory.")
    @app.get("/")
    def read_root():
        return {"message": "Frontend build not found. Please run 'npm run build' in client directory."}
