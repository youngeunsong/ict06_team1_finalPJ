package com.ict06.team1_fin_pj.domain.employee.service;

import com.ict06.team1_fin_pj.common.dto.employee.DepartmentCreateRequestDto;
import com.ict06.team1_fin_pj.common.dto.employee.DepartmentListDto;
import com.ict06.team1_fin_pj.common.dto.employee.DepartmentUpdateRequestDto;
import com.ict06.team1_fin_pj.common.dto.employee.HrSelectOptionDto;
import com.ict06.team1_fin_pj.domain.employee.entity.DepartmentEntity;
import com.ict06.team1_fin_pj.domain.employee.repository.DepartmentRepository;
import com.ict06.team1_fin_pj.domain.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/*
 * 관리자 부서 관리 Service 구현체
 *
 * 실제 부서 관리 비즈니스 로직을 담당한다.
 *
 * 담당 기능:
 * - 부서 목록 조회
 * - 본부 목록 조회
 * - 본부 등록
 * - 팀 등록
 * - 부서 수정
 * - 부서 삭제
 * - 삭제 제한 처리
 * - 중복 검사
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdDepartmentServiceImpl implements AdDepartmentService {

    /*
     * 부서 Repository
     */
    private final DepartmentRepository departmentRepository;

    /*
     * 사원 Repository
     *
     * 부서 삭제 제한,
     * 부서별 인원 수 조회 등에 사용한다.
     */
    private final EmployeeRepository employeeRepository;

    /*
     * 부서 전체 목록 조회
     *
     * 관리자 부서 관리 화면에서 사용한다.
     *
     * 기존 방식:
     * - deptId 순서대로 전체 부서를 그대로 출력했다.
     *
     * 변경 방식:
     * - 본부를 먼저 출력한다.
     * - 해당 본부 아래 팀들을 바로 이어서 출력한다.
     *
     * 출력 예:
     * 경영본부
     * ㄴ 경영지원팀
     * ㄴ 인사팀
     *
     * 개발본부
     * ㄴ 개발1팀(BE)
     * ㄴ 개발2팀(FE)
     * ㄴ 디자인팀
     *
     * 사원 수 표시 기준:
     * 1. 본부
     * - 하위 팀 전체 인원 수 합산
     *
     * 2. 팀
     * - 해당 팀 직접 소속 인원 수
     */
    @Override
    public List<DepartmentListDto> findDepartments() {

        /*
         * 전체 부서 조회
         *
         * 일단 DB에서 모든 부서를 가져온 뒤,
         * Java 코드에서 본부 → 팀 순서로 재정렬한다.
         */
        List<DepartmentEntity> allDepartments =
                departmentRepository.findAllByOrderByDeptIdAsc();

        /*
         * 최종적으로 화면에 넘길 DTO 목록이다.
         *
         * 여기에 본부를 먼저 넣고,
         * 그 다음 해당 본부의 팀들을 넣는다.
         */
        List<DepartmentListDto> result = new java.util.ArrayList<>();

        /*
         * 1단계.
         * parentDept가 null인 부서만 본부로 판단한다.
         */
        List<DepartmentEntity> headquarters = allDepartments.stream()
                .filter(dept -> dept.getParentDept() == null)
                .toList();

        /*
         * 2단계.
         * 본부를 하나씩 돌면서
         * 본부 DTO를 먼저 result에 추가하고,
         * 그 본부 아래 팀 DTO를 이어서 추가한다.
         */
        for (DepartmentEntity headquartersDept : headquarters) {

            /*
             * 본부 인원 수
             *
             * 본부 자체에 직접 소속된 인원이 아니라,
             * 본부 아래 팀들의 인원 수 합계이다.
             */
            long headquartersEmployeeCount =
                    employeeRepository.countActiveEmployeesByParentDepartmentId(
                            headquartersDept.getDeptId()
                    );

            /*
             * 본부 DTO 추가
             */
            result.add(
                    DepartmentListDto.fromEntity(
                            headquartersDept,
                            headquartersEmployeeCount
                    )
            );

            /*
             * 현재 본부 아래에 있는 팀 목록만 필터링한다.
             */
            List<DepartmentEntity> teams = allDepartments.stream()
                    .filter(dept ->
                            dept.getParentDept() != null
                                    && dept.getParentDept()
                                    .getDeptId()
                                    .equals(headquartersDept.getDeptId())
                    )
                    .toList();

            /*
             * 팀들을 본부 바로 아래에 순서대로 추가한다.
             */
            for (DepartmentEntity team : teams) {

                /*
                 * 팀 인원 수
                 *
                 * 해당 팀에 직접 소속된 재직/휴직 사원 수이다.
                 * isDeleted = 'N' 인 사원만 센다.
                 */
                long teamEmployeeCount =
                        employeeRepository.countActiveEmployeesByDepartmentId(
                                team.getDeptId()
                        );

                result.add(
                        DepartmentListDto.fromEntity(
                                team,
                                teamEmployeeCount
                        )
                );
            }
        }

        return result;
    }

    /*
     * 본부 목록 조회
     *
     * 팀 등록/수정 시
     * 상위 본부 선택 select box에 사용한다.
     */
    @Override
    public List<HrSelectOptionDto> findHeadquarters() {

        return departmentRepository
                .findByParentDeptIsNullOrderByDeptIdAsc()
                .stream()
                .map(dept -> new HrSelectOptionDto(
                        dept.getDeptId(),
                        dept.getDeptName()
                ))
                .toList();
    }

    /*
     * 부서 등록
     *
     * 등록 기준:
     *
     * 1. parentDeptId == null
     * → 본부 등록
     *
     * 2. parentDeptId 존재
     * → 해당 본부 아래 팀 등록
     */
    @Override
    @Transactional
    public void createDepartment(
            DepartmentCreateRequestDto requestDto
    ) {
        /*
         * 부서명 공백 제거 및 유효성 검사
         */
        String deptName =
                trimDeptName(requestDto.getDeptName());

        /*
         * parentDeptId가 없으면 본부 등록
         */
        if (requestDto.getParentDeptId() == null) {

            /*
             * 동일 본부명 중복 검사
             */
            validateHeadquartersDuplicate(deptName);

            DepartmentEntity department =
                    DepartmentEntity.builder()
                            .deptName(deptName)
                            .parentDept(null)
                            .build();

            departmentRepository.save(department);

            return;
        }

        /*
         * 상위 본부 조회
         */
        DepartmentEntity parentDept =
                departmentRepository.findById(
                        requestDto.getParentDeptId()
                ).orElseThrow(() ->
                        new IllegalArgumentException(
                                "상위 본부를 찾을 수 없습니다."
                        )
                );

        /*
         * 팀 아래에 또 다른 팀 생성 방지
         *
         * 즉:
         * 본부 아래에만 팀 생성 가능
         */
        if (parentDept.getParentDept() != null) {
            throw new IllegalArgumentException(
                    "팀 아래에는 하위 부서를 생성할 수 없습니다."
            );
        }

        /*
         * 동일 본부 아래 팀명 중복 검사
         */
        validateTeamDuplicate(
                deptName,
                parentDept.getDeptId()
        );

        DepartmentEntity department =
                DepartmentEntity.builder()
                        .deptName(deptName)
                        .parentDept(parentDept)
                        .build();

        departmentRepository.save(department);
    }

    /*
     * 부서 수정
     *
     * 수정 가능 항목:
     * - 부서명 변경
     * - 상위 본부 변경
     */
    @Override
    @Transactional
    public void updateDepartment(
            Integer deptId,
            DepartmentUpdateRequestDto requestDto
    ) {

        DepartmentEntity department =
                departmentRepository.findById(deptId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "수정할 부서를 찾을 수 없습니다."
                                )
                        );

        /*
         * 공백 제거 및 유효성 검사
         */
        String deptName =
                trimDeptName(requestDto.getDeptName());

        /*
         * parentDeptId == null
         * → 본부로 변경
         */
        if (requestDto.getParentDeptId() == null) {

            /*
             * 본부명 중복 검사
             */
            validateHeadquartersDuplicateForUpdate(
                    deptId,
                    deptName
            );

            department.updateDepartment(
                    deptName,
                    null
            );

            return;
        }

        /*
         * 자기 자신을 상위 부서로 지정하는 것 방지
         *
         * 예:
         * 개발본부 → 상위 부서 = 개발본부
         */
        if (deptId.equals(requestDto.getParentDeptId())) {
            throw new IllegalArgumentException(
                    "자기 자신을 상위 부서로 지정할 수 없습니다."
            );
        }

        /*
         * 변경할 상위 본부 조회
         */
        DepartmentEntity parentDept =
                departmentRepository.findById(
                        requestDto.getParentDeptId()
                ).orElseThrow(() ->
                        new IllegalArgumentException(
                                "상위 본부를 찾을 수 없습니다."
                        )
                );

        /*
         * 팀 아래로 이동 방지
         *
         * 상위 부서는 반드시 본부여야 한다.
         */
        if (parentDept.getParentDept() != null) {
            throw new IllegalArgumentException(
                    "팀 아래로 이동할 수 없습니다."
            );
        }

        /*
         * 하위 팀이 있는 본부는
         * 팀으로 변경하지 못하게 막는다.
         *
         * 이유:
         * 트리 구조가 꼬일 수 있음
         */
        boolean hasChildren =
                departmentRepository.existsByParentDept_DeptId(
                        deptId
                );

        if (hasChildren) {
            throw new IllegalArgumentException(
                    "하위 팀이 있는 본부는 팀으로 변경할 수 없습니다."
            );
        }

        /*
         * 수정 시 팀명 중복 검사
         */
        validateTeamDuplicateForUpdate(
                deptId,
                deptName,
                parentDept.getDeptId()
        );

        /*
         * 수정 반영
         */
        department.updateDepartment(
                deptName,
                parentDept
        );
    }

    /*
     * 부서 삭제
     *
     * 삭제 제한:
     *
     * 1. 하위 팀 존재
     * 2. 소속 사원 존재
     */
    @Override
    @Transactional
    public void deleteDepartment(Integer deptId) {

        DepartmentEntity department =
                departmentRepository.findById(deptId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "삭제할 부서를 찾을 수 없습니다."
                                )
                        );

        /*
         * 하위 팀 존재 여부 확인
         */
        boolean hasChildren =
                departmentRepository.existsByParentDept_DeptId(
                        deptId
                );

        if (hasChildren) {
            throw new IllegalArgumentException(
                    "하위 팀이 있는 본부는 삭제할 수 없습니다."
            );
        }

        /*
         * 소속 사원 존재 여부 확인
         */
        boolean usedByEmployee =
                employeeRepository.existsByDepartment_DeptId(
                        deptId
                );

        if (usedByEmployee) {
            throw new IllegalArgumentException(
                    "소속 사원이 있는 부서는 삭제할 수 없습니다."
            );
        }

        /*
         * 삭제 실행
         */
        departmentRepository.delete(department);
    }

    /*
     * 부서명 공백 제거 및 유효성 검사
     *
     * 예외:
     * - null
     * - 빈 문자열
     * - 공백만 입력
     */
    private String trimDeptName(String deptName) {

        if (deptName == null
                || deptName.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "부서명을 입력해주세요."
            );
        }

        return deptName.trim();
    }

    /*
     * 본부 등록 시 중복 검사
     */
    private void validateHeadquartersDuplicate(
            String deptName
    ) {

        boolean exists =
                departmentRepository
                        .existsByDeptNameAndParentDeptIsNull(
                                deptName
                        );

        if (exists) {
            throw new IllegalArgumentException(
                    "이미 같은 이름의 본부가 존재합니다."
            );
        }
    }

    /*
     * 팀 등록 시 중복 검사
     *
     * 같은 본부 아래에 동일 팀명 존재 여부 검사
     */
    private void validateTeamDuplicate(
            String deptName,
            Integer parentDeptId
    ) {

        boolean exists =
                departmentRepository
                        .existsByDeptNameAndParentDept_DeptId(
                                deptName,
                                parentDeptId
                        );

        if (exists) {
            throw new IllegalArgumentException(
                    "해당 본부 아래에 이미 같은 이름의 팀이 존재합니다."
            );
        }
    }

    /*
     * 본부 수정 시 중복 검사
     *
     * 자기 자신 제외 후 검사한다.
     */
    private void validateHeadquartersDuplicateForUpdate(
            Integer deptId,
            String deptName
    ) {

        List<DepartmentEntity> departments =
                departmentRepository
                        .findByParentDeptIsNullOrderByDeptIdAsc();

        boolean exists = departments.stream()
                .anyMatch(dept ->
                        !dept.getDeptId().equals(deptId)
                                && dept.getDeptName().equals(deptName)
                );

        if (exists) {
            throw new IllegalArgumentException(
                    "이미 같은 이름의 본부가 존재합니다."
            );
        }
    }

    /*
     * 팀 수정 시 중복 검사
     *
     * 같은 본부 아래에서
     * 자기 자신 제외 후 검사한다.
     */
    private void validateTeamDuplicateForUpdate(
            Integer deptId,
            String deptName,
            Integer parentDeptId
    ) {

        List<DepartmentEntity> teams =
                departmentRepository
                        .findByParentDept_DeptIdOrderByDeptIdAsc(
                                parentDeptId
                        );

        boolean exists = teams.stream()
                .anyMatch(team ->
                        !team.getDeptId().equals(deptId)
                                && team.getDeptName().equals(deptName)
                );

        if (exists) {
            throw new IllegalArgumentException(
                    "해당 본부 아래에 이미 같은 이름의 팀이 존재합니다."
            );
        }
    }
}