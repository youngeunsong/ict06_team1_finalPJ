package com.ict06.team1_fin_pj.domain.payroll.service;

import com.ict06.team1_fin_pj.common.dto.payroll.*;

import java.util.List;

public interface AdPayrollService {

    /* 기본급 정책 목록 조회
       - 기본급관리 화면의 메인 테이블에 뿌릴 데이터 조회
       - SALARY_POLICY 기준으로 부서명, 직급명, 급여등급명, 기본급, 상여율, 직급수당 등을 가져옴
       - 필터 조건이 붙으면 부서/직급/등급/검색어 조건을 반영해서 조회
    */
    SalaryPolicyPageResponseDTO getSalaryPolicyList(SalaryPolicySearchDTO searchDTO);

    /* 부서 목록 조회
       - 기본급관리 화면 상단의 "부서" select box에 사용할 데이터 조회
       - DEPARTMENT 테이블에서 부서 ID, 부서명을 가져옴
       - 기본급 정책 등록/수정 시 부서를 직접 입력하지 않고 선택하게 하기 위한 용도
    */
    List<PayrollSelectOptionDTO> getDepartmentList();

    /* 직급 목록 조회
       - 기본급관리 화면 상단의 "직급" select box에 사용할 데이터 조회
       - POSITION 테이블에서 직급 ID, 직급명을 가져옴
       - 기본급 정책 등록/수정 시 직급을 직접 입력하지 않고 선택하게 하기 위한 용도
     */
    List<PayrollSelectOptionDTO> getPositionList();

    /* 급여등급 코드 목록 조회
       - 기본급관리 화면 상단의 "급여등급" select box에 사용할 데이터 조회
       - GRADE_CODE 테이블에서 G1, G2, G3, G4 같은 등급 코드와 등급명을 가져옴
       - 기본급 정책 등록/수정 시 급여등급을 직접 입력하지 않고 선택하게 하기 위한 용도
     */
    List<PayrollSelectOptionDTO> getGradeCodeList();

    /* 부서, 직급, 급여등급 자동 설정 및 중복체크
       - 사용자가 선택한 부서와 직급에 맞는 급여등급을 자동으로 설정
       - 해당 부서, 직급에 이미 등록된 기본급 정책이 있는지 중복을 체크
       - 중복 시 기본급 입력이 불가능하도록 처리하며, 중복 사유 메시지를 반환
       - 이 기능은 기본급 정책 등록 시 자동으로 부서와 직급에 맞는 등급을 설정하고, 중복된 정책이 있는지 확인하여 사용자에게 유효한 등록 여부를 알리기 위해 사용됨
     */
    SalaryPolicyRegisterCheckResponseDTO checkSalaryPolicyRegisterAvailable(String deptId, String positionId);

    /* 기본급 등급 서열 검증
       - 부서와 직급에 맞는 기존 기본급 정책들을 조회하여 G1, G2, G3, G4 순서대로 급여가 설정되었는지 검증
       - 서열 검증은 기존 기본급 정책들의 기본급을 비교하여 G1 < G2 < G3 < G4 순서대로 설정되어야 한다는 로직으로,
       기존 기본급보다 작은 값이 들어오면 서열이 깨지므로 등록을 막는다
       - 이 검증은 새로 입력된 기본급이 기존 정책과 순서가 맞는지 확인하기 위한 용도로 사용된다
     */
    boolean isValidGradeOrder(SalaryPolicyRequestDTO requestDTO);

    /* 기본급 정책 등록
       - 새로운 기본급 정책을 등록하는 기능
       - 등록 전 중복 체크와 서열 검증을 반드시 통과한 후에 정책을 등록한다
       - 부서, 직급, 급여등급(G1, G2 등) 및 기본급 값을 입력받고, 새로운 기본급 정책을 DB에 저장하며, 정책은 활성 상태(isActive=true)로 등록된다
       - 기본급 정책을 등록하기 전에 모든 유효성 검사를 거쳐야 하며, 등록된 정책은 이후 수정할 수 없도록 설정된다
     */
    void registerSalaryPolicy(SalaryPolicyRequestDTO requestDTO);
}
