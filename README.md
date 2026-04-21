# ict06_team1_finalPJ

ICT06 의 1팀 최종 프로젝트 깃허브 저장소.

## 프로젝트 주제

AI 융합 리액트 기반 사내 그룹웨어 & 교육평가시스템 플랫폼

## 프로젝트 실행 환경 설정

### 1. 프로젝트 경로

1. `D:\DEV06\` 에서 git bash 실행 -> git clone하여 프로젝트 설치 (D 드라이브 없는 경우 `C:\DEV06\`에서 클론)

    ```bash
    git clone https://github.com/youngeunsong/ict06_team1_finalPJ.git
    ```

1. `ict06_team1_finalPJ` 폴더 안에서 git bash 실행
1. 다음 코맨드를 git bash에서 차례대로 실행하여 최신 원격 dev 브랜치와 동일한 상태로 갱신

    ```bash
    git checkout -b dev
    git pull origin dev 
    ```

### 2. [백엔드] 인텔리제이 환경설정 & 실행

1. **프로젝트 폴더 열기**: `Open` -> `D:\DEV06\ict06_team1_finalPJ` 선택  

1. **인코딩 설정** : Settings에서 `Encod` 검색. 아래 이미지처럼 모두 UTF-8로 통일
![인코딩](/readme_images/intellij-encoding.png)

1. **깃허브로 공유하면 안 되는 파일 다운로드** : `구글 공유 드라이브(ICT06_최종프로젝트)/환경설정_백업` 경로에 깃허브로 공유해서는 안 되는 파일을 백업해놨으니, 여기에서 별도로 다운로드 받으셔서 프로젝트 내에 위치시켜 주세요.

    * 각 폴더 별 파일은 아래의 경로에 위치시킵니다:
        * properties 폴더 내용물: `src/main/resources/` 폴더 안 (원격 DB 연결용)  

    **⚠️ 개인정보, 보안 등의 이슈와 관련된 파일은 절대 github에 공유하지 않아야 합니다.**
    이런 파일들은 반드시 구글 드라이브를 이용해 공유해주시고, .gitignore에 파일명을 등록하여 깃허브에 올라가지 않게 방지해주세요.

    ```plain
    예시: DB 계정명과 비밀번호, API 서비스키 
    ```  

1. **로컬 DB 사용 시 주의사항**
    * 로컬DB 연결하기: 프로젝트 처음 받으면 기본적으로 서버컴에 연결된 상태입니다. 혹시 로컬 DB를 이용해 테스트하실려면 `application-local.properties`의 내용 일부를 다음과 같이 수정해주세요:

        ```bash
        spring.datasource.url=jdbc:postgresql://localhost:5432/postgres
        ```

    * 계정생성 기능 없는 상태로 해싱 적용한 로그인 기능 먼저 구현함. 따라서 DB에는 해싱값이 들어있고, 브라우저에서 사용자가 입력하는 값은 평문이어야 함
    * 이를 위해 프로젝트 실행 시 가장 먼저 `TempPassword.java` 파일 실행하여 해싱값을 생성 -> IntelliJ 콘솔에서 DB password 값 확인하여 test 계정 데이터를 update 처리하면 해싱된 값으로 저장됨.

1. `src/main/java/com/ict06/team1_fin_pj/Team1FinPjApplication.java`를 실행. 정상 실행되는 지 확인.  

### 3. [프론트엔드] VisualStudio Code 환경설정 & 실행

1. **프로젝트 폴더 열기**:`File` -> `Open Folder` -> `D:\DEV06\ict06_team1_finalPJ` 선택

1. **프론트엔드 작업용 폴더로 이동하기**: `Terminal` -> `New Terminal` -> `+` 옆의 `V` -> `command prompt` 선택-> cmd에서 `cd react-frontend` 입력

1. **처음 깃허브에서 clone해오거나 pull 해온 직후 입력**: **반드시** `npm install`**을 먼저 cmd에 입력**해주세요. 다른 팀원이 추가한 라이브러리를 설치하는 과정입니다.

1. **프로젝트 실행**: `npm start`를 cmd에 입력.
    1. `Module not found` 에러 발생 시 : 해당 모듈을 cmd에서 설치하면 오류가 사라집니다.

        ```bash
        # 예시) Module not found : react-router-dom 에러 발생 시  
        npm i react-router-dom
        ```

1. **테스트 계정으로 로그인**: 이제 프로젝트를 실행하면 테스트 계정의 사번/비밀번호로 로그인이 가능
   * **테스트 계정**: 사번 20209999 / 비밀번호: 1234
    ![alt text](/readme_images/login.png)

### ⚠️실행 시 주의점

v.260420

* 계정생성 기능 없는 상태로 해싱 적용한 로그인 기능 먼저 구현함. 따라서 DB에는 해싱값이 들어있고, 브라우저에서 사용자가 입력하는 값은 평문이어야 함
* 이를 위해 프로젝트 실행 시 가장 먼저 'TempPassword.java' 파일 실행하여 해싱값을 생성 -> IntelliJ 콘솔에서 DB password 값 확인하여 test 계정 데이터를 update 처리하면 해싱된 값으로 저장됨.
* 이제 프로젝트를 실행하면 사번/비밀번호로 로그인이 가능
  * **테스트 계정**: 사번 20209999 / 비밀번호: 1234

## 프로젝트 아키텍쳐

### 전체 구조 개괄

<details>
<summary>전체 구조 개괄 접기/펼치기</summary>


```xml
ict06_team1_finalPJ                         # 스프링부트 메인 프로젝트
├── react-frontend/                         # 일반 직원/팀장용 React 프론트엔드
│   ├── src/
│   │   ├── pages/                          # 사용자 화면 페이지
│   │   │   ├── attendance/                # 대분류: 근태관리 / 출근·퇴근·조퇴·휴가·외근·초과근무
│   │   │   ├── approval/                  # 대분류: 전자결재 / 상신·임시저장·문서함·결재대기/예정
│   │   │   ├── calendar/                  # 대분류: 캘린더 / 일정 등록·조회·수정·삭제
│   │   │   ├── employee/                  # 대분류: 인사 관리 / 내 정보·조직도 조회
│   │   │   ├── payroll/                   # 대분류: 급여 관리 / 개인 급여 조회·명세서 확인
│   │   │   ├── onboarding/                # 대분류: 인사평가(교육평가 AI 포함) / 온보딩 로드맵·체크리스트·교육일정
│   │   │   ├── evaluation/                # 대분류: 인사평가(교육평가 AI 포함) / AI 퀴즈·자기평가·결과 조회
│   │   │   ├── aiSecretary/               # 대분류: AI 비서 / 초안 작성·문서 교정·요약
│   │   │   ├── chatbot/                   # 대분류: 챗봇 / 사내 규정 Q&A·서비스 안내
│   │   │   └── auth/                      # 대분류: 인증/인가 / 로그인·마이페이지
│   │   ├── components/                    # 공통 컴포넌트
│   │   ├── api/                           # 백엔드 API 호출 함수 모음
│   │   └── store/                         # React 전역 상태관리(로그인 정보, 권한, 알림 등)
│   └── .gitignore                         # React 용 .gitignore 설정
│ 
├── src/main/
│   ├── java/com/ict06/team1_fin_pj/
│   │   ├── common/                        # 공통 영역
│   │   │   ├── config/                    # 스프링 설정, 보안 설정, 웹 설정
│   │   │   ├── dto/                       # DTO
│   │   │   ├── exception/                 # 예외 처리
│   │   │   ├── response/                  # 공통 응답 형식
│   │   │   ├── util/                      # 유틸 클래스
│   │   │   └── security/                  # JWT, 권한 체크 공통 처리
│   │   │
│   │   ├── domain/                        # 기능(도메인) 중심 모듈
│   │   │   ├── attendance/                # 대분류: 근태관리
│   │   │   │   └── ※ 내부에 MVC 구조 포함
│   │   │   │      - 기본근무: 출근 등록, 퇴근 등록, 조퇴 관리, 근태 대시보드
│   │   │   │      - 휴가관리: 연차 현황, 휴가계 조회, 연차 생성
│   │   │   │      - 외근/출장: 외근 등록
│   │   │   │      - 초과근무: 연장 신청
│   │   │   │      - 관리자 기능: 근태 유형 설정, 전사/부서 근태 현황·통계, 출퇴근 기록 수정, 엑셀 출력
│   │   │   │
│   │   │   ├── approval/                  # 대분류: 전자결재
│   │   │   │   └── ※ 내부에 MVC 구조 포함
│   │   │   │      - 새 결재 진행: 결재 정보 선택, 결재 내용 작성, OCR(후순위)
│   │   │   │      - 개인 문서함 / 임시 저장함
│   │   │   │      - 팀장 기능: 결재 대기 문서함, 결재 예정 문서함, 승인/반려 처리
│   │   │   │      - 관리자 기능: 결재 서식 관리, 결재선 관리
│   │   │   │
│   │   │   ├── calendar/                  # 대분류: 캘린더
│   │   │   │   └── ※ 내부에 MVC 구조 포함
│   │   │   │      - 일정 등록, 조회, 상세, 수정, 삭제, 검색
│   │   │   │      - 일정 구분(개인/부서/공통), 카테고리 표시
│   │   │   │      - 일정 이동(드래그 앤 드롭)
│   │   │   │      - 관리자 기능: 일정 권한 처리, 공휴일 관리
│   │   │   │
│   │   │   ├── employee/                  # 대분류: 인사 관리
│   │   │   │   └── ※ 내부에 MVC 구조 포함
│   │   │   │      - 사원관리: 사원 등록, 목록 조회, 상세 조회, 수정, 삭제
│   │   │   │      - 권한관리: 접근 권한 처리
│   │   │   │      - 조직관리: 조직도 전체 조회, 부서별 조회, 구성원 상세
│   │   │   │      - 관리자 기능: 부서 관리, 직급 관리
│   │   │   │
│   │   │   ├── payroll/                   # 대분류: 급여 관리
│   │   │   │   └── ※ 내부에 MVC 구조 포함
│   │   │   │      - 급여 대장 관리: 대장 생성, 저장, 마감, 삭제
│   │   │   │      - 기본급 관리: 등록, 수정, 삭제, 목록 조회
│   │   │   │      - 급여 요약: 급여 목록, 검색 필터, 상세 보기, 변동 추이
│   │   │   │      - 급여 성과 분석: 교육 성취도-보상 분석
│   │   │   │      - 사용자 기능: 개인 급여 조회, 증빙서류 셀프 발급
│   │   │   │
│   │   │   ├── onboarding/                # 대분류: 인사평가(교육평가 AI 포함) - 온보딩 영역
│   │   │   │   └── ※ 내부에 MVC 구조 포함
│   │   │   │      - 온보딩: 콘텐츠 관리, 교육 로드맵 설계
│   │   │   │      - 사용자 기능: 직무별 로드맵 조회, 진행률 표시, 체크리스트 확인
│   │   │   │      - 교육 일정 생성 및 관리, 일정 알림
│   │   │   │
│   │   │   ├── evaluation/                # 대분류: 인사평가(교육평가 AI 포함) - 평가 영역
│   │   │   │   └── ※ 내부에 MVC 구조 포함
│   │   │   │      - AI 온보딩 평가: 퀴즈, 답변 저장, 유사도 점수 계산
│   │   │   │      - 이해도 분석: 자기 평가, AI 평가 결과 조회, 비교 분석 및 피드백
│   │   │   │      - AI 학습 보강: 컨텍스트 기반 답변 생성, 콘텐츠 요약 및 재설명
│   │   │   │      - 평가 조회: 대시보드, 개인 평가 결과, 진행할 평가 목록
│   │   │   │      - 관리자 기능: 평가 현황, 평가 점수 통계, 평가 항목 설정, 이탈 징후 분석
│   │   │   │
│   │   │   ├── aiSecretary/               # 대분류: AI 비서
│   │   │   │   └── ※ 내부에 MVC 구조 포함
│   │   │   │      - 문서 작성: 보고서 초안, 결재 사유 생성, 문서 교정, 템플릿 생성
│   │   │   │      - 요약 + 액션: 회의록 요약, 데일리 업무 추천
│   │   │   │      - 관리자 기능: 참조 문서 권한 검증, 생성 결과 권한 제한, 비인가 참조 차단
│   │   │   │
│   │   │   ├── chatbot/                   # 대분류: 챗봇
│   │   │   │   └── ※ 내부에 MVC 구조 포함
│   │   │   │      - 지식 베이스: 서비스 이용 안내, 사내 규정 Q&A(RAG), 유사 질문 추천
│   │   │   │      - 관리자 기능: 권한 기반 문서 검색, 출처 노출 제어, 비인가 문서 응답 차단, 링크 접근 제어
│   │   │   │
│   │   │   ├── auth/                      # 대분류: 인증/인가
│   │   │   │   └── ※ 내부에 MVC 구조 포함
│   │   │   │      - 계정: 로그인
│   │   │   │      - 마이페이지: 내 정보 조회/수정
│   │   │   │      - 관리자 기능: 권한 분리 및 접근 제어
│   │   │   │
│   │   │   ├── notification/              # 대분류: 알림
│   │   │   │   └── ※ 내부에 MVC 구조 포함
│   │   │   │      - 실시간 알림 처리 (출근 미체크, 퇴근 권장 등)
│   │   │   │
│   │   │   └── aiOps/                     # 대분류: AI 데이터 운영
│   │   │       └── ※ 내부에 MVC 구조 포함
│   │   │          - AI 데이터 수집: 수집 현황 대시보드, 통합 로그 조회, CSV/엑셀 다운로드
│   │   │          - AI 활용 로그: 챗봇 로그, AI 비서 사용 로그, 사용량 통계
│   │   │          - 데이터 관리: 벡터 데이터 관리, 문서 권한 메타데이터 저장
│   │   │          - 분석·추천: 질문/문서 로그 분석, FAQ 자동화
│   │   │          - RAG 검색 제어: 사용자 권한 기반 필터링
│   │   │
│   │   └── external/                      # 외부 API/AI 연동 전용
│   │       ├── ai/                        # Ollama, LangChain, 임베딩, 벡터DB
│   │       ├── ocr/                       # CLOVA OCR
│   │       ├── maps/                      # Kakao/Google Maps
│   │       ├── weather/                   # OpenWeather 등
│   │       ├── mail/                      # Gmail SMTP 등
│   │       ├── crawling/                  # 뉴스/외부 데이터 크롤링
│   │       └── storage/                   # 파일 업로드, 이미지/PDF 처리
│   │
│   └── resources/                         # 리소스
│       ├── mappers/ 
│       │   ├── attendance/                # 대분류: 근태관리 / 출근·퇴근·조퇴·휴가·외근·초과근무
│       │   ├── approval/                  # 대분류: 전자결재 / 상신·임시저장·문서함·결재대기/예정
│       │   ├── calendar/                  # 대분류: 캘린더 / 일정 등록·조회·수정·삭제
│       │   ├── employee/                  # 대분류: 인사 관리 / 내 정보·조직도 조회
│       │   ├── payroll/                   # 대분류: 급여 관리 / 개인 급여 조회·명세서 확인
│       │   ├── onboarding/                # 대분류: 인사평가(교육평가 AI 포함) / 온보딩 로드맵·체크리스트·교육일정
│       │   ├── evaluation/                # 대분류: 인사평가(교육평가 AI 포함) / AI 퀴즈·자기평가·결과 조회
│       │   ├── aiSecretary/               # 대분류: AI 비서 / 초안 작성·문서 교정·요약
│       │   ├── chatbot/                   # 대분류: 챗봇 / 사내 규정 Q&A·서비스 안내
│       │   └── auth/                      # 대분류: 인증/인가 / 로그인·마이페이지
│       │
│       ├── static/                        # 관리자 타임리프용 css/js/image
│       │   ├── css/
│       │   │   ├── adminlte.css
│       │   │   └── adminlte.min.css
│       │   ├── js/
│       │   │   ├── adminlte.js
│       │   │   └── adminlte.min.js
│       │   └── images/                    # 타임리프 페이지에서 필요한 이미지 파일들  
│       │
│       ├── templates/                     # Thymeleaf HTML
│       │   └── admin/                     # 관리자용 화면
│       │       ├── attendance/            # 대분류: 근태관리 / 전사 근태 현황·통계·근태유형 설정
│       │       ├── approval/              # 대분류: 전자결재 / 결재 서식·결재선 관리
│       │       ├── calendar/              # 대분류: 캘린더 / 관리자 일정·권한 관리
│       │       ├── employee/              # 대분류: 인사 관리 / 사원·부서·직급 관리
│       │       ├── payroll/               # 대분류: 급여 관리 / 급여대장·기본급·수당·공제
│       │       ├── onboarding/            # 대분류: 인사평가(교육평가 AI 포함) / 온보딩 콘텐츠·로드맵 관리
│       │       ├── evaluation/            # 대분류: 인사평가(교육평가 AI 포함) / 평가 현황·통계·이탈 징후 분석
│       │       ├── aiOps/                 # 대분류: AI 데이터 운영 / AI 로그·벡터 데이터·운영 대시보드
│       │       ├── auth/                  # 대분류: 인증/인가 / 관리자 로그인·권한 화면
│       │       └── common/                # 공통 레이아웃, 헤더, 사이드바
│       │
│       └── application.properties         # DB 계정 등 환경설정 (깃허브 업로드 X)
│
├── .gitignore                             # Springboot 용 gitignore 설정
└── pom.xml
```

</details>

### domain의 각 패키지 내 구조

domaindml 각 패키지 내부는 MVC 패턴으로 구현. 

```xml
예시)
Attendance 
├── controller
│   ├── AttendanceController   # 팀원용
│   └── adAttendanceController # 관리자용
│
├── service
│   ├── AttendanceService       # 팀원용 인터페이스
│   ├── AttendanceServiceImpl   # 팀원용 클래스
│   ├── adAttendanceService     # 관리자용 인터페이스
│   └── adAttendanceServiceImpl # 관리자용 클래스
│
└── repository
    ├── AttendanceRepo   # 팀원용
    └── adAttendanceRepo # 관리자용
```

⚠️ mappers는 resources 폴더 하위에 위치, dto는 common폴더에 위치시킴. 

```xml
# mappers 예시)
resources
└── mappers
    ├── AttendanceMapper   # 팀원용
    └── adAttendanceMapper # 관리자용

# dto 위치)    
└── common/                        # 공통 영역
    └── dto/                       # DTO    

```
