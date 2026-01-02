from typing import List, Dict, Any
from fastapi import APIRouter, Request, Depends
from app.models.candidate import CandidateInDB
from app.models.user import UserInDB

router = APIRouter()

@router.get("/results", response_description="Get aggregated evaluation results")
async def get_evaluation_results(request: Request):
    # 1. 모든 데이터 로드 (최적화를 위해 Aggregation Pipeline 사용 권장하나, 로직 복잡성을 위해 Python 처리)
    candidates = {}
    async for cand in request.app.mongodb["candidates"].find():
        candidates[str(cand["_id"])] = {
            "id": str(cand["_id"]),
            "name": cand["name"],
            "employee_id": cand["employee_id"],
            "group": cand.get("group", "-"),
            "sequence": cand.get("sequence", 0),
            "total_score": 0,
            "count": 0,
            "details": []
        }
    
    # 2. 결과 집계
    async for res in request.app.mongodb["results"].find():
        cand_id = res["candidate_id"]
        if cand_id in candidates:
            score = res["total_normalized_score"]
            candidates[cand_id]["total_score"] += score
            candidates[cand_id]["count"] += 1
            candidates[cand_id]["details"].append({
                "result_id": str(res["_id"]),
                "assessor_id": res["assessor_id"],
                "score": score,
                "scores": res["scores"] # 상세 항목 점수
            })

    # 3. 평균 계산 및 리스트 변환
    report = []
    for cand in candidates.values():
        avg = cand["total_score"] / cand["count"] if cand["count"] > 0 else 0
        cand["score_avg"] = round(avg, 2)
        
        # 편차 계산 (각 위원 점수 - 평균)
        for detail in cand["details"]:
            detail["deviation"] = round(abs(detail["score"] - avg), 2)
            
        report.append(cand)
    
    # 4. 순위 산정 (평균 점수 내림차순)
    report.sort(key=lambda x: x["score_avg"], reverse=True)
    for i, item in enumerate(report):
        item["rank"] = i + 1
        
    return report
