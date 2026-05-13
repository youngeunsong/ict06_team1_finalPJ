-- app_form 기본 제공 서식 보호 플래그
ALTER TABLE app_form
    ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE;

-- 시연 기본 서식으로 보호할 서식은 아래 예시처럼 필요 시 지정합니다.
-- UPDATE app_form
--    SET is_default = TRUE
--  WHERE form_name IN ('연차 신청서', '지출결의서');
