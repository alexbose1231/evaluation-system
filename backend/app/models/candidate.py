from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field
from bson import ObjectId

class AssessmentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"

class Assignment(BaseModel):
    assessor_id: str = Field(..., description="User ID of the assessor")
    item_ids: List[str] = Field(..., description="List of Item IDs to evaluate")
    status: AssessmentStatus = AssessmentStatus.PENDING
    result_id: Optional[str] = None # Link to Result document once completed

class CandidateBase(BaseModel):
    name: str
    department: str
    position: str
    employee_id: str = Field(..., description="Unique examinee ID (수험번호)")
    group: Optional[str] = Field(None, description="Group name (e.g. 'A조')")
    sequence: Optional[int] = Field(None, description="Order within the group")
    assignments: List[Assignment] = []

class CandidateCreate(CandidateBase):
    pass

class CandidateInDB(CandidateBase):
    id: Optional[str] = Field(None, alias="_id")

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "name": "홍길동",
                "department": "총무과",
                "position": "주무관",
                "employee_id": "2023001",
                "assignments": [
                    {
                        "assessor_id": "user123_id",
                        "item_ids": ["item1_id", "item2_id"],
                        "status": "pending"
                    }
                ]
            }
        }
