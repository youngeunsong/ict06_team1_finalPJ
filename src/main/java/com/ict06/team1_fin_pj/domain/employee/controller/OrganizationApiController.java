package com.ict06.team1_fin_pj.domain.employee.controller;

import com.ict06.team1_fin_pj.common.dto.employee.DepartmentTreeDto;
import com.ict06.team1_fin_pj.common.dto.employee.OrgEmployeeDto;
import com.ict06.team1_fin_pj.domain.employee.service.OrganizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/*
 * 조직도 API 컨트롤러
 *
 * 이 컨트롤러는 화면을 반환하지 않는다.
 * JSON 데이터만 반환한다.
 *
 * 관리자 Thymeleaf 화면:
 * - fetch()로 이 API를 호출해서 사용
 *
 * 사용자 React 화면:
 * - 나중에 axios/fetch로 같은 API를 호출해서 사용
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/organization")
public class OrganizationApiController {

    private final OrganizationService organizationService;

    /*
     * 조직도 부서 트리 조회 API
     *
     * 호출 주소:
     * GET /api/organization/departments/tree
     *
     * 사용 위치:
     * - 관리자 조직도 탭 왼쪽 영역
     * - 사용자 React 조직도 페이지
     */
    @GetMapping("/departments/tree")
    public List<DepartmentTreeDto> getDepartmentTree() {
        return organizationService.getDepartmentTree();
    }

    /*
     * 특정 부서의 사원 목록 조회 API
     *
     * 호출 주소:
     * GET /api/organization/employees?deptId=1
     *
     * 사용 위치:
     * - 조직도에서 특정 부서를 클릭했을 때
     * - 오른쪽 사원 목록 영역
     */
    @GetMapping("/employees")
    public List<OrgEmployeeDto> getEmployeesByDepartment(@RequestParam Integer deptId) {
        return organizationService.getEmployeesByDepartment(deptId);
    }
}