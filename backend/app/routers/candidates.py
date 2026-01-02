from typing import List
from fastapi import APIRouter, Body, Request, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from bson import ObjectId
from app.models.candidate import CandidateCreate, CandidateInDB, Assignment, AssessmentStatus
from app.core.deps import get_current_username

router = APIRouter()

# 관리자용: 대상자 생성 (테스트용)
@router.post("/", response_description="Add new candidate", response_model=CandidateInDB)
async def create_candidate(request: Request, candidate: CandidateCreate = Body(...)):
    candidate_dict = jsonable_encoder(candidate)
    if "_id" in candidate_dict:
        del candidate_dict["_id"]
    new_candidate = await request.app.mongodb["candidates"].insert_one(candidate_dict)
    created_candidate = await request.app.mongodb["candidates"].find_one({"_id": new_candidate.inserted_id})
    return created_candidate

# 관리자용: 전체 대상자 목록 조회
@router.get("/", response_description="List all candidates", response_model=List[CandidateInDB])
async def list_all_candidates(request: Request):
    candidates = []
    cursor = request.app.mongodb["candidates"].find()
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        candidates.append(doc)
    return candidates

# 관리자용: 평가 위원 배정
@router.put("/{id}/assign", response_description="Assign assessor to candidate")
async def assign_assessor(id: str, request: Request, payload: dict = Body(...)):
    assessor_id = payload.get("assessor_id")
    item_ids = payload.get("item_ids", [])
    
    if not assessor_id or not item_ids:
        raise HTTPException(status_code=400, detail="Missing assessor_id or item_ids")

    # 새로운 배정 객체 생성
    new_assignment = {
        "assessor_id": assessor_id,
        "item_ids": item_ids,
        "status": AssessmentStatus.PENDING,
        "result_id": None
    }
    
    # $push로 배열에 추가
    result = await request.app.mongodb["candidates"].update_one(
        {"_id": ObjectId(id)},
        {"$push": {"assignments": new_assignment}}
    )
    
    if result.modified_count == 1:
        updated_candidate = await request.app.mongodb["candidates"].find_one({"_id": ObjectId(id)})
        updated_candidate["_id"] = str(updated_candidate["_id"]) # ObjectId 변환
        return updated_candidate
    
    raise HTTPException(status_code=404, detail="Candidate not found")

# 평가위원용: 내 할당 목록 조회
@router.get("/me", response_description="List assigned candidates", response_model=List[CandidateInDB])
async def list_my_assignments(request: Request, username: str = Depends(get_current_username)):
    # 1. username으로 user_id(ObjectId) 또는 식별자를 찾아야 함.
    # 현재 시스템은 username을 유니크 키로 쓰지만, assignments에는 assessor_id가 저장됨.
    # assessor_id가 username인지 DB _id인지 정책을 정해야 함.
    # 편의상 assessor_id = username으로 가정하고 진행하거나, User를 조회해서 _id를 가져와야 함.
    
    # 여기서는 User를 먼저 조회하여 _id를 얻는 것이 정석.
    user = await request.app.mongodb["users"].find_one({"username": username})
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
        
    user_id = str(user["_id"])
    
    # assignments 배열 내의 assessor_id가 user_id와 일치하는 문서 조회
    # MongoDB elemMatch 사용 불필요 (단순 조회) -> "assignments.assessor_id": user_id
    
    candidates = []
    # assignments 필드가 존재하고, 그 안에 assessor_id가 일치하는 요소가 있는 문서 검색
    cursor = request.app.mongodb["candidates"].find({"assignments.assessor_id": user_id})
    
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        candidates.append(doc)
        
    return candidates
