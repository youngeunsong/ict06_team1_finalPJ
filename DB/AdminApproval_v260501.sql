-- * @author : 송영은
-- * description : 관리자용 전자결재에 필요한 sql 
-- * ========================================
-- * DATE         AUTHOR      NOTE
-- * 2026-05-01   송영은       최초 생성
-- * 2026-05-14   송영은		 기본 결재 서식 넣기 

-- app_form 데이터 삭제
delete from app_form 
 where form_id <= 14; 


------------------------------------------------------------------------
-- ⭐⭐ 근태 관련 기본 결재 서식 넣기 : 아래 서식은 근태와 연동되어야 하므로 별도로 데이터 생성 필요.
---- 1. 근무 계획 신청 서식
UPDATE app_form
SET
    template = '{
      "title": "근무 계획 신청",
      "fields": [
        {
          "id": "work_plan_date",
          "type": "date",
          "label": "근무 예정일",
          "placeholder": "",
          "description": "근무 계획을 신청할 날짜를 선택하세요.",
          "options": []
        },
        {
          "id": "planned_start_time",
          "type": "time",
          "label": "근무 시작 예정 시간",
          "placeholder": "",
          "description": "예정된 근무 시작 시간을 입력하세요.",
          "options": []
        },
        {
          "id": "planned_end_time",
          "type": "time",
          "label": "근무 종료 예정 시간",
          "placeholder": "",
          "description": "예정된 근무 종료 시간을 입력하세요.",
          "options": []
        },
        {
          "id": "work_plan_type",
          "type": "select",
          "label": "근무 형태",
          "placeholder": "",
          "description": "신청하려는 근무 형태를 선택하세요.",
          "options": ["재택근무", "외근", "연장근무"]
        },
        {
          "id": "work_plan_reason",
          "type": "text",
          "label": "신청 사유",
          "placeholder": "",
          "description": "근무 계획 신청 사유를 입력하세요.",
          "options": []
        }
      ],
      "fileRequired": false
    }',
    is_default = true
WHERE form_name = '근무 계획 신청';

---- 2. 부재 일정
UPDATE app_form
SET
    template = '{
      "title": "부재 일정",
      "fields": [
        {
          "id": "absence_type",
          "type": "select",
          "label": "부재 유형",
          "placeholder": "",
          "description": "신청하려는 부재 유형을 선택하세요.",
          "options": ["연차", "오전반차", "오후반차", "조퇴", "외출", "병가"]
        },
        {
          "id": "absence_start_date",
          "type": "date",
          "label": "부재 시작일",
          "placeholder": "",
          "description": "부재가 시작되는 날짜를 선택하세요.",
          "options": []
        },
        {
          "id": "absence_end_date",
          "type": "date",
          "label": "부재 종료일",
          "placeholder": "",
          "description": "부재가 종료되는 날짜를 선택하세요.",
          "options": []
        },
        {
          "id": "absence_start_time",
          "type": "time",
          "label": "부재 시작 시간",
          "placeholder": "",
          "description": "반차, 조퇴, 외출처럼 시간이 필요한 경우 입력하세요.",
          "options": []
        },
        {
          "id": "absence_end_time",
          "type": "time",
          "label": "부재 종료 시간",
          "placeholder": "",
          "description": "복귀 예정 시간 또는 부재 종료 시간을 입력하세요.",
          "options": []
        },
        {
          "id": "absence_reason",
          "type": "text",
          "label": "부재 사유",
          "placeholder": "",
          "description": "부재 사유를 입력하세요.",
          "options": []
        }
      ],
      "fileRequired": false
    }',
    is_default = true
WHERE form_name = '부재 일정';

-- 3. 근무 결과 신청
UPDATE app_form
SET
    template = '{
      "title": "근무 결과 신청",
      "fields": [
        {
          "id": "work_result_date",
          "type": "date",
          "label": "근무일",
          "placeholder": "",
          "description": "근무 결과를 등록할 날짜를 선택하세요."
        },
        {
          "id": "actual_start_time",
          "type": "time",
          "label": "실제 근무 시작 시간",
          "placeholder": "",
          "description": "실제 근무를 시작한 시간을 입력하세요."
        },
        {
          "id": "actual_end_time",
          "type": "time",
          "label": "실제 근무 종료 시간",
          "placeholder": "",
          "description": "실제 근무를 종료한 시간을 입력하세요."
        },
        {
          "id": "break_minutes",
          "type": "number",
          "label": "휴게 시간(분)",
          "placeholder": "0",
          "description": "휴게 시간을 분 단위로 입력하세요."
        },
        {
          "id": "work_result_content",
          "type": "text",
          "label": "근무 결과 내용",
          "placeholder": "",
          "description": "수행한 업무 내용을 입력하세요."
        },
		{
          "id": "work_plan_type",
          "type": "select",
          "label": "근무 형태",
          "placeholder": "",
          "description": "신청하려는 근무 형태를 선택하세요.",
          "options": ["재택근무", "외근", "연장근무"]
        },
        {
          "id": "work_result_reason",
          "type": "text",
          "label": "신청 사유",
          "placeholder": "",
          "description": "근무 결과 신청 또는 정정 사유를 입력하세요."
        }
      ],
      "fileRequired": false
    }',
    is_default = true
WHERE form_name = '근무 결과 신청';

-- 반영 확인용
SELECT form_id, form_name, is_default, template
FROM app_form
WHERE form_name IN ('근무 계획 신청', '부재 일정', '근무 결과 신청')
ORDER BY form_id;

--- vOld: 셀렉트 박스 적용 전---------
---- 1. 근무 계획 신청 서식
UPDATE app_form
SET
    template = '{
      "title": "근무계획 신청",
      "fields": [
        {
          "id": "work_plan_date",
          "type": "date",
          "label": "근무 예정일",
          "placeholder": "",
          "description": "근무 계획을 신청할 날짜를 선택하세요."
        },
        {
          "id": "planned_start_time",
          "type": "time",
          "label": "근무 시작 예정 시간",
          "placeholder": "",
          "description": "예정된 근무 시작 시간을 입력하세요."
        },
        {
          "id": "planned_end_time",
          "type": "time",
          "label": "근무 종료 예정 시간",
          "placeholder": "",
          "description": "예정된 근무 종료 시간을 입력하세요."
        },
        {
          "id": "work_plan_type",
          "type": "text",
          "label": "근무 형태",
          "placeholder": "예: 정상근무, 재택근무, 외근, 연장근무",
          "description": "신청하려는 근무 형태를 입력하세요."
        },
        {
          "id": "work_plan_reason",
          "type": "text",
          "label": "신청 사유",
          "placeholder": "",
          "description": "근무 계획 신청 사유를 입력하세요."
        }
      ],
      "fileRequired": false
    }',
    is_default = true
WHERE form_name = '근무 계획 신청';

---- 2. 부재 일정
UPDATE app_form
SET
    template = '{
      "title": "부재 일정",
      "fields": [
        {
          "id": "absence_type",
          "type": "text",
          "label": "부재 유형",
          "placeholder": "예: 연차, 오전반차, 오후반차, 조퇴, 외출, 병가",
          "description": "신청하려는 부재 유형을 입력하세요."
        },
        {
          "id": "absence_start_date",
          "type": "date",
          "label": "부재 시작일",
          "placeholder": "",
          "description": "부재가 시작되는 날짜를 선택하세요."
        },
        {
          "id": "absence_end_date",
          "type": "date",
          "label": "부재 종료일",
          "placeholder": "",
          "description": "부재가 종료되는 날짜를 선택하세요."
        },
        {
          "id": "absence_start_time",
          "type": "time",
          "label": "부재 시작 시간",
          "placeholder": "",
          "description": "반차, 조퇴, 외출처럼 시간이 필요한 경우 입력하세요."
        },
        {
          "id": "absence_end_time",
          "type": "time",
          "label": "부재 종료 시간",
          "placeholder": "",
          "description": "복귀 예정 시간 또는 부재 종료 시간을 입력하세요."
        },
        {
          "id": "absence_reason",
          "type": "text",
          "label": "부재 사유",
          "placeholder": "",
          "description": "부재 사유를 입력하세요."
        }
      ],
      "fileRequired": false
    }',
    is_default = true
WHERE form_name = '부재 일정';



-- (주의) 아래에 작성된 쿼리들은 실행 전에 충분히 고민할 것. 연관 테이블 삭제 위험-----------
-- 비상 시에 테이블 아예 삭제
drop table app_form cascade;  
drop table attendance; 

-- 테스트 용으로 만든 근로자 데이터 삭제 
delete from employee 
 where emp_no = '20260001';

select * from pg_settings
where name = 'max_connections';

SELECT * FROM pg_stat_activity;

-- 현재 connection 상태 확인
SELECT count(*) FROM pg_stat_activity;

SELECT state, count(*)
FROM pg_stat_activity
GROUP BY state;

-- 오래된 세션 종료 
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle'
AND now() - state_change > interval '5 minutes';