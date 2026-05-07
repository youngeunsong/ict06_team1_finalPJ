package com.ict06.team1_fin_pj.domain.employee.repository;

import com.ict06.team1_fin_pj.domain.employee.entity.DepartmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/*
 * 부서 Repository
 *
 * DEPARTMENT 테이블에 접근하는 Repository이다.
 *
 * 사용 위치:
 * - 관리자 사원 등록/수정 화면의 부서 선택
 * - 조직도 부서 트리 조회
 * - 관리자 부서 관리 CRUD
 */
public interface DepartmentRepository extends JpaRepository<DepartmentEntity, Integer> {

    /*
     * 전체 부서 목록 조회
     *
     * 부서 관리 화면에서 본부와 팀을 모두 조회할 때 사용한다.
     *
     * 정렬 기준:
     * - deptId 오름차순
     *
     * 예:
     * 1 경영본부
     * 2 인사팀
     * 3 총무팀
     * 4 개발본부
     */
    List<DepartmentEntity> findAllByOrderByDeptIdAsc();

    /*
     * 본부 목록 조회
     *
     * parentDept가 null인 부서만 조회한다.
     *
     * 사용 위치:
     * - 팀 등록 시 상위 본부 선택 select box
     * - 팀 수정 시 상위 본부 변경 select box
     */
    List<DepartmentEntity> findByParentDeptIsNullOrderByDeptIdAsc();

    /*
     * 특정 본부 아래의 팀 목록 조회
     *
     * 조직도나 부서 관리에서 특정 본부의 하위 팀을 조회할 때 사용한다.
     */
    List<DepartmentEntity> findByParentDept_DeptIdOrderByDeptIdAsc(Integer parentDeptId);

    /*
     * 특정 부서를 상위 부서로 사용하는 하위 부서가 있는지 확인
     *
     * 본부 삭제 시 사용한다.
     *
     * 예:
     * 개발본부 아래에 개발1팀, 디자인팀이 있으면 true
     *
     * true라면:
     * - 하위 팀이 존재하는 본부이므로 삭제하면 안 됨
     */
    boolean existsByParentDept_DeptId(Integer parentDeptId);

    /*
     * 같은 상위 부서 안에 동일한 부서명이 있는지 확인
     *
     * 팀 등록 중복 검사에 사용할 수 있다.
     *
     * 예:
     * 개발본부 아래에 이미 개발1팀이 있는데
     * 다시 개발1팀을 등록하려고 하면 true
     */
    boolean existsByDeptNameAndParentDept_DeptId(String deptName, Integer parentDeptId);

    /*
     * 본부 이름 중복 확인
     *
     * parentDept가 null인 상태에서 같은 이름의 본부가 있는지 확인한다.
     *
     * 예:
     * 이미 개발본부가 있는데 다시 개발본부 등록 시 true
     */
    boolean existsByDeptNameAndParentDeptIsNull(String deptName);
}