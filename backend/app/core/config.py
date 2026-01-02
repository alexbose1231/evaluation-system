import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "공무원 역량 평가 시스템"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "CHANGE_THIS_SECRET_KEY_IN_PRODUCTION" # 실제 운영 시 .env에서 로드
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "evaluation_system"

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
