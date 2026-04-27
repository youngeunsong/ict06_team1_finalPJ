package com.ict06.team1_fin_pj.domain.payroll.service;

import com.ict06.team1_fin_pj.common.dto.payroll.GradeCodeDTO;
import com.ict06.team1_fin_pj.common.dto.payroll.SalaryPolicyResponseDTO;

import java.util.List;

public interface AdPayrollService {

    /* 기본급 정책 목록 조회
       - 기본급관리 화면의 메인 테이블에 뿌릴 데이터 조회
       - SALARY_POLICY 기준으로 부서명, 직급명, 급여등급명, 기본급, 상여율, 직급수당 등을 가져옴
       - 필터 조건이 붙으면 부서/직급/등급/검색어 조건을 반영해서 조회
    */
    List<SalaryPolicyResponseDTO> getSalaryPolicyList();

    /* 부서 목록 조회
       - 기본급관리 화면 상단의 "부서" select box에 사용할 데이터 조회
       - DEPARTMENT 테이블에서 부서 ID, 부서명을 가져옴
       - 기본급 정책 등록/수정 시 부서를 직접 입력하지 않고 선택하게 하기 위한 용도
    */
    List<DepartmentDTO> getDepartmentList();

    /* 직급 목록 조회
       - 기본급관리 화면 상단의 "직급" select box에 사용할 데이터 조회
       - POSITION 테이블에서 직급 ID, 직급명을 가져옴
       - 기본급 정책 등록/수정 시 직급을 직접 입력하지 않고 선택하게 하기 위한 용도
     */
    List<PositionDTO> getPositionList();

    /* 급여등급 코드 목록 조회
       - 기본급관리 화면 상단의 "급여등급" select box에 사용할 데이터 조회
       - GRADE_CODE 테이블에서 G1, G2, G3, G4 같은 등급 코드와 등급명을 가져옴
       - 기본급 정책 등록/수정 시 급여등급을 직접 입력하지 않고 선택하게 하기 위한 용도
     */
    List<GradeCodeDTO> getGradeCodeList();
}
