package com.ict06.team1_fin_pj.domain.employee.repository;

import com.ict06.team1_fin_pj.domain.employee.entity.DepartmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.List;

/*
 * 부서 Repository
 *
 * DEPARTMENT 테이블에 접근하는 Repository이다.
 *
 * 현재 DepartmentEntity는 parentDeptId 숫자 필드가 아니라
 * parentDept라는 DepartmentEntity 객체로 상위 부서를 관리한다.
 */
public interface AdDepartmentRepository extends JpaRepository<DepartmentEntity, Integer> {

    /*
     * 본부 목록 조회
     *
     * parentDept가 null인 부서만 조회한다.
     *
     * 예:
     * 경영본부
     * 개발본부
     */
    List<DepartmentEntity> findByParentDeptIsNull();

    /*
     * 선택한 본부에 속한 팀 목록 조회
     *
     * parentDept.deptId가 parentDeptId와 같은 부서를 조회한다.
     *
     * 예:
     * parentDeptId = 1
     * → 경영지원팀, 인사팀
     */
    List<DepartmentEntity> findByParentDept_DeptId(Integer parentDeptId);
}