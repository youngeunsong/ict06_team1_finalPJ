package com.ict06.team1_fin_pj.domain.employee.service;

import com.ict06.team1_fin_pj.common.dto.employee.DepartmentCreateRequestDto;
import com.ict06.team1_fin_pj.common.dto.employee.DepartmentListDto;
import com.ict06.team1_fin_pj.common.dto.employee.DepartmentUpdateRequestDto;
import com.ict06.team1_fin_pj.common.dto.employee.HrSelectOptionDto;

import java.util.List;

/*
 * 관리자 부서 관리 Service
 *
 * 부서 관리 화면에서 사용하는 기능을 정의한다.
 *
 * 담당 기능:
 * - 부서 목록 조회
 * - 본부 목록 조회
 * - 본부/팀 등록
 * - 부서 수정
 * - 부서 삭제
 */
public interface AdDepartmentService {

    /*
     * 부서 전체 목록 조회
     *
     * 관리자 부서 관리 화면에서 본부와 팀을 모두 보여줄 때 사용한다.
     */
    List<DepartmentListDto> findDepartments();

    /*
     * 본부 목록 조회
     *
     * 팀 등록/수정 시 상위 본부 select box에 사용한다.
     */
    List<HrSelectOptionDto> findHeadquarters();

    /*
     * 부서 등록
     *
     * parentDeptId가 null이면 본부 등록,
     * parentDeptId가 있으면 팀 등록으로 처리한다.
     */
    void createDepartment(DepartmentCreateRequestDto requestDto);

    /*
     * 부서 수정
     *
     * 부서명 변경 또는 팀의 상위 본부 변경에 사용한다.
     */
    void updateDepartment(Integer deptId, DepartmentUpdateRequestDto requestDto);

    /*
     * 부서 삭제
     *
     * 단, 아래 조건이면 삭제하지 않는다.
     * - 하위 팀이 있는 본부
     * - 사원이 소속되어 있는 부서
     */
    void deleteDepartment(Integer deptId);
}