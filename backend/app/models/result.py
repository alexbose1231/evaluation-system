from typing import Any, Dict
from pydantic import BaseModel, Field
from typing import Optional

class ScoreDetail(BaseModel):
    item_id: str
    raw_score: float # 5점 만점이면 1~5 (0.5단위), 100점 만점이면 0~100
    normalized_score: float # 100점 만점으로 환산된 점수
    strengths: Optional[str] = None # 강점
    weaknesses: Optional[str] = None # 약점 (단점)

class ResultBase(BaseModel):
    candidate_id: str
    assessor_id: str
    scores: list[ScoreDetail]
    total_normalized_score: float = 0.0 # 평균 환산 점수
    
class ResultCreate(ResultBase):
    pass

class ResultInDB(ResultBase):
    id: Optional[str] = Field(None, alias="_id")
    created_at: str # ISO format datetime

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "candidate_id": "cand_123",
                "assessor_id": "user_456",
                "scores": [
                    {
                        "item_id": "item_1",
                        "raw_score": 4,
                        "normalized_score": 80.0,
                        "comment": "우수함"
                    }
                ],
                "total_normalized_score": 80.0
            }
        }
