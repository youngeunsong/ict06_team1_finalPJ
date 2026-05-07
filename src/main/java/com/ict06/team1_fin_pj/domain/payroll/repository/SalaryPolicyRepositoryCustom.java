package com.ict06.team1_fin_pj.domain.payroll.repository;

import com.ict06.team1_fin_pj.common.dto.payroll.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

// QueryDSL 기반 커스텀 Repository 인터페이스
// - 단순 JpaRepository로 해결 안 되는 복잡한 조회/검증/업데이트 로직을 정의
public interface SalaryPolicyRepositoryCustom {

    // ================================
    // 1. 기본급 정책 목록 조회 (메인 페이지)
    // ================================
    // - 검색 조건 (부서, 직급, 급여등급, 키워드)
    // - 페이징 처리 (offset, limit)
    // - join (department, position, grade_code)
    // → 화면에 보여줄 리스트 + 페이지 정보 반환
    SalaryPolicyPageResponseDTO selectSalaryPolicyList(SalaryPolicySearchDTO searchDTO);

    // ================================
    // 2. 본부 select box용 조회
    // ================================
    // - DEPARTMENT 중 parent_dept_id가 null인 행만 조회
    List<PayrollSelectOptionDTO> selectHeadDepartmentList();

    // ================================
    // 3. 부서 select box용 조회
    // ================================
    // - department 테이블 조회
    // - id / name 형태로 반환
    // → 드롭다운 UI 구성용 데이터
    List<PayrollSelectOptionDTO> selectDepartmentList();

    // ================================
    // 4. 직급 select box용 조회
    // ================================
    // - position 테이블 조회
    // - 직급 선택 UI에 사용
    List<PayrollSelectOptionDTO> selectPositionList();

    // ================================
    // 5. 급여등급 select box용 조회
    // ================================
    // - grade_code 테이블 조회
    // - G1 ~ G5 목록 반환
    // - 활성화된 등급만 조회
    List<PayrollSelectOptionDTO> selectGradeCodeList();

    // ================================
    // 6. 기본급 정책 중복 체크
    // ================================
    // - deptId + positionId + gradeId 기준으로
    // - 이미 활성 정책이 존재하는지 확인
    // → EXISTS 쿼리로 성능 최적화
    boolean existsActiveSalaryPolicy(String deptId, String positionId, String gradeId);

    // ================================
    // 7. 서열 검증용 조회
    // ================================
    // - 같은 부서 기준으로 기본급 정책 목록 조회
    // - G1 < G2 < G3 < G4 < G5 서열 검증에 사용
    // → Java 서비스에서 비교 수행
    List<SalaryPolicyResponseDTO> selectActivePoliciesByDept(String deptId);

    // ================================
    // 8. 수정 모달용 단건 조회
    // ================================
    // - 특정 policyId 기준으로 상세 조회
    // - Entity가 아니라 DTO로 바로 반환 (성능 + 구조 분리)
    // - Optional로 반환 → 데이터 없을 경우 안전 처리
    Optional<SalaryPolicyResponseDTO> selectSalaryPolicyDetail(Long policyId);

    // ================================
    // 9. 기본급 정책 수정 (핵심)
    // ================================
    // - QueryDSL UPDATE 사용
    // - 기존 Entity를 직접 수정하지 않고
    //   JPQL/QueryDSL로 DB UPDATE 수행
    // - 현재 구조에서는 "기본급만 수정"
    // → JPA dirty checking 대신 명시적 UPDATE
    void updateSalaryPolicy(Integer policyId, BigDecimal basicSalary);

    // ================================
    // 10. 정책 비활성화 (Soft Delete용)
    // ================================
    // - isActive = false 처리
    // - 실제 삭제가 아닌 논리 삭제 방식
    // - 과거 급여 데이터 보호 목적
    // ※ 현재 네 코드에서는 물리 삭제(delete)도 같이 존재
    void deactivateSalaryPolicy(Integer policyId);

}
