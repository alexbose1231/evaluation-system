# 공무원 역량 평가 시스템 데이터 스키마 (Data Schema)

이 문서는 MongoDB에 저장되는 데이터 모델의 구조와 관계를 설명합니다.
시스템은 유연한 평가 방식(5점 척도/100점 척도)을 지원하기 위해 설계되었습니다.

---

## 1. Users (사용자)
시스템에 접근하는 모든 사용자(관리자, 평가위원 등) 정보를 저장합니다.

- **Collection Name:** `users`
- **Model:** `backend/app/models/user.py`

| 필드명 | 타입 | 필수 | 설명 | 비고 |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Yes | 고유 ID | 자동 생성 |
| `username` | String | Yes | 로그인 ID | Unique Index |
| `hashed_password` | String | Yes | 암호화된 비밀번호 | bcrypt |
| `full_name` | String | No | 사용자 실명 | |
| `role` | String | Yes | 권한 (Enum) | `admin`, `assessor`, `viewer` |
| `is_active` | Boolean | Yes | 계정 활성화 여부 | Default: `true` |

---

## 2. Items (평가 항목)
평가할 질문이나 지표를 정의합니다. 정성(5점)과 정량(100점) 방식을 모두 포용합니다.

- **Collection Name:** `items`
- **Model:** `backend/app/models/item.py`

| 필드명 | 타입 | 필수 | 설명 | 비고 |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Yes | 고유 ID | |
| `code` | String | Yes | 항목 코드 (예: Q1, S1) | 식별용 |
| `category` | String | Yes | 평가 카테고리 | 예: 전문성, 성실성 |
| `title` | String | Yes | 평가 항목 명 | |
| `input_type` | String | Yes | 입력 방식 | `scale_5` (5점), `score_100` (100점) |
| `config` | Object | Yes | 설정 객체 | 하단 상세 참조 |
| `is_active` | Boolean | Yes | 사용 여부 | |

### `config` 객체 구조
- **Case A (scale_5):** `{ "max_score": 5, "labels": ["미흡", "보통", "우수"] }`
- **Case B (score_100):** `{ "max_score": 100, "description": "KPI 달성률" }`

---

## 3. Candidates (평가 대상자)
평가를 받는 공무원 정보와, 그들에게 할당된 평가(Assignments) 상태를 관리합니다.

- **Collection Name:** `candidates`
- **Model:** `backend/app/models/candidate.py`

| 필드명 | 타입 | 필수 | 설명 | 비고 |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Yes | 고유 ID | |
| `name` | String | Yes | 대상자 성명 | |
| `employee_id` | String | Yes | 사번 | Unique |
| `department` | String | Yes | 부서명 | |
| `position` | String | Yes | 직급 | |
| `group` | String | No | 조 (Group) | 예: A조 |
| `sequence` | Integer | No | 순번 | 조 내 순서 |
| `assignments` | Array | No | 배정 정보 리스트 | 하단 상세 참조 |

### `assignments` 배열 요소 구조 (Embedding)
특정 대상자를 누가(Assessor), 어떤 항목(Items)으로 평가해야 하는지 정의합니다.

```json
{
  "assessor_id": "user_object_id",  // 평가위원 ID
  "item_ids": ["item_1_id", "item_2_id"], // 평가할 항목 ID 목록
  "status": "pending", // "pending" | "completed"
  "result_id": "result_object_id" // 평가 완료 시 생성된 결과 문서 ID 연결
}
```

---

## 4. Results (평가 결과)
평가위원이 제출한 점수 데이터를 저장합니다. 이력 관리 및 통계를 위해 별도 컬렉션으로 분리했습니다.

- **Collection Name:** `results`
- **Model:** `backend/app/models/result.py`

| 필드명 | 타입 | 필수 | 설명 | 비고 |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Yes | 고유 ID | |
| `candidate_id` | String | Yes | 평가 대상자 ID | |
| `assessor_id` | String | Yes | 평가위원 ID | |
| `total_normalized_score` | Float | Yes | 환산 총점 | 통계용 |
| `created_at` | String | Yes | 제출 일시 | ISO 8601 |
| `scores` | Array | Yes | 세부 점수 리스트 | 하단 상세 참조 |

### `scores` 배열 요소 구조
각 항목별 입력 점수와 환산 점수를 동시에 저장합니다.

```json
{
  "item_id": "item_object_id",
  "raw_score": 4,          // 실제 입력값 (예: 5점 척도 중 4점)
  "normalized_score": 80.0, // 100점 만점으로 환산한 값 (4/5 * 100)
  "comment": "업무 이해도가 높음" // 정성적 의견 (Optional)
}
```

---

## 데이터 흐름 요약

1. **배정 (Assignment):** 관리자가 `Candidates` 문서의 `assignments` 배열에 평가위원과 항목을 추가합니다.
2. **평가 진행:** 평가위원은 자신에게 할당된(`assignments.assessor_id`로 조회) 대상자 목록을 봅니다.
3. **제출 (Submission):**
    - `Results` 컬렉션에 점수 데이터를 Insert 합니다.
    - `Candidates.assignments`의 상태를 `completed`로 업데이트하고 `result_id`를 연결합니다.
    - (이 과정은 트랜잭션으로 처리되어야 함)
