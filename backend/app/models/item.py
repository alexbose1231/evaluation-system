from enum import Enum
from typing import List, Optional, Union
from pydantic import BaseModel, Field

class InputType(str, Enum):
    SCALE_5 = "scale_5"
    SCORE_100 = "score_100"

class ItemConfig(BaseModel):
    max_score: int
    labels: Optional[List[str]] = None # For scale_5 e.g. ["미흡", "보통", "우수"]
    description: Optional[str] = None

class ItemBase(BaseModel):
    code: str = Field(..., description="Unique code for the item e.g. 'A-01'")
    category: str = Field(..., description="Evaluation category")
    title: str
    input_type: InputType
    config: ItemConfig
    is_active: bool = True

class ItemCreate(ItemBase):
    pass

class ItemInDB(ItemBase):
    id: Optional[str] = Field(None, alias="_id")

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "code": "Q1",
                "category": "전문성",
                "title": "직무 관련 지식 보유 수준",
                "input_type": "scale_5",
                "config": {
                    "max_score": 5,
                    "labels": ["매우 미흡", "미흡", "보통", "우수", "매우 우수"]
                }
            }
        }
