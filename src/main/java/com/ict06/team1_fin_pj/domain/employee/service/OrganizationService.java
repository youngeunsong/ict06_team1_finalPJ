package com.ict06.team1_fin_pj.domain.employee.service;

import com.ict06.team1_fin_pj.common.dto.employee.DepartmentTreeDto;
import com.ict06.team1_fin_pj.common.dto.employee.OrgEmployeeDto;

import java.util.List;

/*
 * 조직도 서비스 인터페이스
 *
 * 관리자 Thymeleaf 화면과
 * 사용자 React 화면이 공통으로 사용할 조직도 데이터를 만든다.
 */
public interface OrganizationService {

    /*
     * 전체 부서를 트리 구조로 조회한다.
     */
    List<DepartmentTreeDto> getDepartmentTree();

    /*
     * 특정 부서에 소속된 사원 목록을 조회한다.
     */
    List<OrgEmployeeDto> getEmployeesByDepartment(Integer deptId);
}