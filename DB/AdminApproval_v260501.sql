-- * @author : 송영은
-- * description : 관리자용 전자결재에 필요한 sql 
-- * ========================================
-- * DATE         AUTHOR      NOTE
-- * 2026-05-01   송영은       최초 생성

-- app_form 데이터 삭제
delete from app_form 
 where form_id <= 14;  

-- (주의) 아래에 작성된 쿼리들은 실행 전에 충분히 고민할 것. 연관 테이블 삭제 위험
-- 비상 시에 테이블 아예 삭제
drop table app_form cascade;  

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