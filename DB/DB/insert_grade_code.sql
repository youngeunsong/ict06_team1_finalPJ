-- ============================================
-- GRADE_CODE 초기 데이터 (급여 구간 기준)
-- ============================================

INSERT INTO grade_code (grade_id, grade_name, description, is_active)
VALUES
    ('G1', '하위 구간', '기본 급여 등급 구간', true),
    ('G2', '중간 구간', '중간 급여 등급 구간', true),
    ('G3', '상위 구간', '상위 급여 등급 구간', true),
    ('G4', '최고 구간', '최상위 급여 등급 구간', true)
    ON CONFLICT (grade_id) DO NOTHING;