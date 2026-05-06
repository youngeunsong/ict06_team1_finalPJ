package com.ict06.team1_fin_pj.domain.employee.service;

import com.ict06.team1_fin_pj.common.dto.employee.DepartmentTreeDto;
import com.ict06.team1_fin_pj.common.dto.employee.OrgEmployeeDto;
import com.ict06.team1_fin_pj.domain.employee.entity.DepartmentEntity;
import com.ict06.team1_fin_pj.domain.employee.entity.EmpEntity;
import com.ict06.team1_fin_pj.domain.employee.repository.DepartmentRepository;
import com.ict06.team1_fin_pj.domain.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/*
 * 조직도 서비스 구현체
 *
 * 핵심 역할:
 * 1. DEPARTMENT 데이터를 조직도 트리 형태로 변환
 * 2. 특정 부서의 사원 목록 조회
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrganizationServiceImpl implements OrganizationService {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;

    /*
     * 전체 부서 조직도 조회
     *
     * 처리 방식:
     * 1. 모든 부서를 한 번에 조회한다.
     * 2. 부서 ID 기준으로 DTO Map을 만든다.
     * 3. parentDept가 null이면 최상위 부서로 분류한다.
     * 4. parentDept가 있으면 부모 부서의 children에 추가한다.
     */
    @Override
    public List<DepartmentTreeDto> getDepartmentTree() {

        // 1. 전체 부서 조회
        List<DepartmentEntity> departments = departmentRepository.findAll();

        // 2. 부서 ID를 기준으로 DTO를 저장할 Map
        Map<Integer, DepartmentTreeDto> dtoMap = new HashMap<>();

        // 3. 모든 부서를 먼저 DTO로 변환
        for (DepartmentEntity department : departments) {
            DepartmentTreeDto dto = DepartmentTreeDto.builder()
                    .deptId(department.getDeptId())
                    .deptName(department.getDeptName())
                    .children(new ArrayList<>())
                    .build();

            dtoMap.put(department.getDeptId(), dto);
        }

        // 4. 최상위 부서를 담을 리스트
        List<DepartmentTreeDto> rootDepartments = new ArrayList<>();

        // 5. 부모-자식 관계 연결
        for (DepartmentEntity department : departments) {

            DepartmentTreeDto currentDto = dtoMap.get(department.getDeptId());

            /*
             * parentDept가 null이면 최상위 부서이다.
             *
             * 예:
             * 개발본부, 경영본부
             */
            if (department.getParentDept() == null) {
                rootDepartments.add(currentDto);
            } else {
                /*
                 * parentDept가 있으면 하위 부서이다.
                 *
                 * 예:
                 * 백엔드팀.parentDept = 개발본부
                 */
                Integer parentDeptId = department.getParentDept().getDeptId();
                DepartmentTreeDto parentDto = dtoMap.get(parentDeptId);

                if (parentDto != null) {
                    parentDto.addChild(currentDto);
                }
            }
        }

        return rootDepartments;
    }

    /*
     * 특정 부서의 사원 목록 조회
     *
     * 조직도에서 부서를 클릭했을 때 오른쪽 영역에 표시할 데이터이다.
     *
     * 그룹핑은 여기서 하지 않는다.
     * 백엔드는 단순한 리스트만 내려주고,
     * 화면의 JavaScript에서 직급별 그룹핑을 처리한다.
     */
    @Override
    public List<OrgEmployeeDto> getEmployeesByDepartment(Integer deptId) {

        List<EmpEntity> employees =
                employeeRepository.findOrgEmployeesByDepartmentId(deptId);

        return employees.stream()
                .map(emp -> OrgEmployeeDto.builder()
                        .empNo(emp.getEmpNo())
                        .name(emp.getName())
                        .deptId(emp.getDepartment().getDeptId())
                        .deptName(emp.getDepartment().getDeptName())
                        .positionId(emp.getPosition().getPositionId())
                        .positionName(emp.getPosition().getPositionName())
                        .status(emp.getStatus())
                        .email(emp.getEmail())
                        .phone(emp.getPhone())
                        .profileImg(emp.getProfileImg())
                        .build())
                .toList();
    }
}