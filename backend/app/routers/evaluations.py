from typing import List
from fastapi import APIRouter, Body, Request, Depends, HTTPException, status
from fastapi.encoders import jsonable_encoder
from bson import ObjectId
from app.models.result import ResultCreate, ResultInDB
from app.core.deps import get_current_username
from datetime import datetime

router = APIRouter()

@router.put("/{id}", response_description="Update evaluation result")
async def update_evaluation(id: str, request: Request, result_data: ResultCreate = Body(...), username: str = Depends(get_current_username)):
    # 1. 권한 확인 (관리자만 가능)
    user = await request.app.mongodb["users"].find_one({"username": username})
    if not user or user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admin can update evaluation results")

    # 2. 업데이트 실행
    # assessor_id 등 핵심 필드는 변경하지 않고 점수만 변경하는 것이 안전하지만, 
    # ResultCreate 전체를 받아 덮어쓰는 방식으로 구현 (간편함)
    
    update_data = jsonable_encoder(result_data)
    # assessor_id나 candidate_id는 원본 유지 검증이 필요할 수 있음
    
    update_res = await request.app.mongodb["results"].update_one(
        {"_id": ObjectId(id)},
        {"$set": {
            "scores": update_data["scores"],
            "total_normalized_score": update_data["total_normalized_score"],
            "updated_at": datetime.utcnow().isoformat(),
            "updated_by": username
        }}
    )
    
    if update_res.modified_count == 0:
        raise HTTPException(status_code=404, detail="Result not found or no changes made")
        
    return {"message": "Evaluation updated successfully"}

@router.post("/", response_description="Submit evaluation", status_code=status.HTTP_201_CREATED)
async def submit_evaluation(request: Request, result_data: ResultCreate = Body(...), username: str = Depends(get_current_username)):
    # 1. 사용자 검증 (현재 로그인한 유저가 제출한 것인지)
    user = await request.app.mongodb["users"].find_one({"username": username})
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
    user_id = str(user["_id"])

    # 2. Transaction 시작 (MongoDB Atlas Replica Set 필요)
    # 로컬 Standalone 환경에서는 트랜잭션이 지원되지 않을 수 있음.
    # 여기서는 트랜잭션 세션 없이 순차 실행하되, 실제 운영 시 session 사용 권장.
    
    result_dict = jsonable_encoder(result_data)
    result_dict["created_at"] = datetime.utcnow().isoformat()
    result_dict["assessor_id"] = user_id # 로그인한 사용자로 강제 설정
    
    # 결과 저장
    new_result = await request.app.mongodb["results"].insert_one(result_dict)
    result_id = str(new_result.inserted_id)
    
    # 대상자 Assignments 상태 업데이트
    # elemMatch를 사용하여 해당 assessor의 assignment만 업데이트
    update_res = await request.app.mongodb["candidates"].update_one(
        {
            "_id": ObjectId(result_data.candidate_id),
            "assignments.assessor_id": user_id
        },
        {
            "$set": {
                "assignments.$.status": "completed",
                "assignments.$.result_id": result_id
            }
        }
    )
    
    if update_res.modified_count == 0:
        # 롤백: 결과 문서 삭제 (간이 보상 트랜잭션)
        await request.app.mongodb["results"].delete_one({"_id": new_result.inserted_id})
        # 배정되지 않았거나 이미 완료된 경우 등
        raise HTTPException(status_code=400, detail="Failed to update assignment status. You might not be assigned to this candidate or it's already completed.")

    return {"id": result_id, "message": "Evaluation submitted successfully"}
