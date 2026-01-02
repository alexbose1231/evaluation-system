2-0. 평가 및 배정 API 연동
- [x] 평가 대상자 목록 조회 API (GET /api/v1/candidates/me) (backend/app/routers/candidates.py)
- [x] 프론트엔드 API 연동 (CandidatesList.jsx)

2-1. 평가 모드 설정 UI
- [x] 관리자 배정 화면 구현 (AdminAssignment.jsx)
    - 대상자 및 평가위원 선택, 일괄 배정 기능

📌 Phase 3. 지능형 평가 엔진 및 UX 고도화 (Evaluation Engine & UX)
평가자가 실제 점수를 입력하는 화면 (가장 중요한 UX)

3-1. 가변형 점수 컴포넌트 (Polymorphic UI)
- [x] ScoreInput 컴포넌트 개발 (EvaluationForm.jsx 통합 구현)
    - 5점 척도(Radio) 및 100점 척도(Input) 지원

3-2. 프론트엔드 유효성 검사 및 편의성
- [x] 입력 제한 로직 (기본 구현)
[ ] 임시 저장 (Draft Save)

3-3. 트랜잭션 기반 제출 (Atomic Submission)
- [x] 제출 API (submit_evaluation) 구현 (backend/app/routers/evaluations.py)
    - Results 저장 및 Candidate 상태 업데이트

📌 Phase 4. 관리자 기능 확장 및 UI 개선 (Admin & UI Refactoring)
- [x] UI 구조 개선 (사이드바 Drawer 적용)
- [x] 데이터 관리 CRUD 구현 (위원, 대상자, 항목)
    - [x] 평가위원 관리 (AdminUsers.jsx)
    - [x] 평가대상자 관리 (AdminCandidates.jsx)
    - [x] 평가기준 관리 (AdminItems.jsx)

📌 Phase 5. 개선 사항 반영 (Refinement based on Feedback)
사용자 피드백 기반 기능 개선 및 용어 정리

5-1. 데이터 구조 및 평가 상세 개선
- [x] 결과(Result) 구조 변경: Comment -> 강점/단점 분리
    - Backend: Result 모델 수정 (comment -> strengths, weaknesses)
    - Frontend: EvaluationForm 수정 (텍스트 필드 2개로 분리)
- [x] 5점 척도 세분화 (0.5점 단위)
    - Frontend: Radio 버튼 대신 MUI Rating 컴포넌트 도입 (precision=0.5)
    - Backend: 소수점 점수 저장 확인

5-2. UI/UX 및 권한 최적화
- [x] 관리자 메뉴 권한 제어
    - 로그인 시 Role 정보 저장
    - MainLayout에서 비관리자에게 Admin 메뉴 숨김
- [x] 초기 화면 변경 (Dashboard -> 평가 목록)
    - 로그인 직후 /candidates 로 이동
    - 기존 Dashboard 페이지 제거 또는 리다이렉트 처리
- [x] 용어 변경 (사번 -> 수험번호)
    - Frontend: '사번' 라벨을 '수험번호'로 일괄 변경
    - Backend: 모델 필드명 변경 고려 (employee_id -> examinee_id) 또는 라벨만 변경

📌 Phase 5.5. 평가 배정 고도화 및 데이터 구조 개선 (Advanced Assignment)
평가 대상자 관리 강화 및 정밀한 배정 시스템 구축

5.5-1. 데이터 스키마 확장
- [x] Candidate 스키마 업데이트 (backend/app/models/candidate.py)
    - group (조): String, Index 생성 (조회 성능 향상)
    - sequence (순번): Integer, 같은 조 내에서의 순서
- [x] SCHEMA.md 업데이트

5.5-2. 관리자 배정 UI (AdminAssignment) 개선
- [x] 조(Group) 기반 필터링 및 일괄 선택 기능
    - "조별 보기" 탭 또는 필터 추가
    - "OO조 전체 선택" 버튼 구현
- [x] 항목(Items)별 부분 배정 UI
    - 기존: 평가위원 선택 시 모든 항목 자동 할당
    - 개선: 평가위원 선택 후, '평가할 항목'을 체크박스로 선택하여 할당 (Item Selection)

5.5-3. 대상자 관리 UI (AdminCandidates) 개선
- [x] 신규 등록/수정 시 조, 순번 입력 필드 추가

📌 Phase 6. 모니터링 및 리포팅 고도화 (Advanced Reporting)
단순 통계가 아닌 운영 중심의 시각화 및 데이터 분석 도구 제공

6-1. 실시간 매트릭스 현황판 (Monitoring Matrix)
- [x] 배정 현황 매트릭스 UI 구현
    - 행: 평가 대상자 (조/순번 정렬), 열: 평가위원
    - 셀(Cell): 상태에 따른 색상 코딩 (⚪미시작, 🔵작성중, 🟢완료)
    - 클릭 시 상세 진행 상황 팝업 표시
- [x] 실시간 상태 동기화 (Polling or WebSocket)
    - 일정 주기(예: 10초)로 상태 자동 갱신

6-2. 고도화된 결과 집계표 (Advanced Result Table)
- [x] MUI DataGrid 도입 (Spreadsheet View)
    - 컬럼 고정 (Pinned Columns): 순위, 수험번호, 성명 고정
    - 다중 정렬 및 필터링 기능 지원
- [x] 백엔드 집계 API (Aggregation)
    - 대상자별 위원 점수 합산, 평균, 총점 계산 로직 구현
    - 순위(Rank) 자동 산출

6-3. 이상치 탐지 및 조정 (Anomaly Detection)
- [x] 점수 편차 감지 알고리즘
    - 동일 대상자/항목에 대해 위원 간 점수 차이가 설정값(예: 1.5점) 이상인 경우 자동 플래그(Flag) 처리
- [x] 조정 모드 (Adjustment & Direct Edit)
    - 이상치 하이라이팅: 집계표 내에서 편차가 큰 셀을 붉은색 등으로 강조
    - 관리자 직권 수정: DataGrid 내에서 점수 직접 수정(Inline Edit) 기능
    - 수정 로그(Audit) 기록: 누가, 언제, 어떤 점수로 바꿨는지 저장

📌 Phase 7. 배포 및 운영 환경 구축 (Deployment)
로컬 개발 환경이 아닌 통합 서버 환경 구축

7-1. 통합 빌드 (Integrated Build)
- [ ] Frontend 빌드
    - React 앱을 정적 파일(HTML/CSS/JS)로 변환 (npm run build)
- [ ] Backend 정적 파일 서빙 설정
    - FastAPI에서 Frontend 빌드 결과물(dist 폴더)을 루트 경로('/')에 마운트
    - SPA(Single Page Application) 라우팅 처리 (새로고침 시 404 방지)

7-2. 실행 및 테스트
- [ ] 통합 실행 스크립트 작성 (run_prod.bat)
- [ ] 배포 환경 테스트 (로그인, 평가, 관리자 기능 정상 작동 확인)

