package com.ict06.team1_fin_pj.domain.employee.repository;

import com.ict06.team1_fin_pj.domain.employee.entity.DepartmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

/*
 * 부서 Repository
 *
 * 조직도 트리 생성을 위해 DEPARTMENT 테이블을 조회한다.
 */
public interface DepartmentRepository extends JpaRepository<DepartmentEntity, Integer> {

    /*
     * 특정 부서를 상위 부서로 가지는 하위 부서가 있는지 확인한다.
     *
     * 예:
     * 개발본부 아래에 개발1팀(BE), 개발2팀(FE), 디자인팀이 있으면 true
     *
     * 사용 위치:
     * - 조직도에서 선택한 부서가 본부인지 팀인지 판단할 때 사용한다.
     */
    boolean existsByParentDept_DeptId(Integer parentDeptId);
}