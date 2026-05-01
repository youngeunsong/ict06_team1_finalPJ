package com.ict06.team1_fin_pj.domain.employee.service;

import com.ict06.team1_fin_pj.common.dto.employee.*;

import java.util.List;

/*
 * 인사관리 서비스 인터페이스
 *
 * Controller는 이 인터페이스를 통해 인사관리 기능을 호출한다.
 * 실제 동작 코드는 AdEmployeeServiceImpl 클래스에 작성되어 있다.
 */
public interface AdEmployeeService {

    // 사원 목록 조회
    // 검색 조건 DTO를 받아 조건에 맞는 사원 목록을 반환한다.
    List<EmployeeListDto> findEmployees(EmployeeSearchConditionDto conditionDto);

    // 부서 select 박스에 사용할 부서 목록 조회
    List<HrSelectOptionDto> findDepartments();

    // 직급 select 박스에 사용할 직급 목록 조회
    List<HrSelectOptionDto> findPositions();

    // 권한 select 박스에 사용할 권한 목록 조회
    List<HrSelectOptionDto> findRoles();

    // 사원 등록 처리
    void createEmployee(EmployeeCreateRequestDto requestDto);

    // 사원 상세 정보 조회
    EmployeeDetailDto findEmployeeDetail(String empNo);

    // 이름을 기준으로 로그인 아이디 자동 생성
    String generateEmpId(String name);

    // 입사일을 기준으로 사번 자동 생성
    String generateEmpNo(String hireDate);

    // 사원 수정 화면에 보여줄 기존 사원 정보 조회
    EmployeeUpdateRequestDto findEmployeeForUpdate(String empNo);

    // 사원 수정 처리
    void updateEmployee(String empNo, EmployeeUpdateRequestDto requestDto);
}