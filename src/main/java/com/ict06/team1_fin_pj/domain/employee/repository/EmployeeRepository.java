package com.ict06.team1_fin_pj.domain.employee.repository;

import com.ict06.team1_fin_pj.domain.employee.entity.EmpEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/*
 * 사원 Repository
 *
 * EMPLOYEE 테이블 조회를 담당한다.
 */
public interface EmployeeRepository extends JpaRepository<EmpEntity, String> {

    /*
     * 사번(emp_no)으로 사원 조회
     */
    Optional<EmpEntity> findByEmpNo(String empNo);

    /*
     * 특정 부서의 사원 목록 조회
     *
     * 조직도에서 부서를 클릭했을 때 사용한다.
     *
     * fetch join을 사용하는 이유:
     * - 사원 목록에서 부서명, 직급명을 바로 사용해야 한다.
     * - LAZY 로딩 상태에서 JSON 변환 시 오류가 날 수 있다.
     * - 반복 조회로 인한 N+1 문제를 줄일 수 있다.
     *
     * isDeleted = 'N'
     * - 삭제 처리되지 않은 사원만 조회한다.
     */
    @Query("""
            SELECT e
            FROM EmpEntity e
            JOIN FETCH e.department d
            JOIN FETCH e.position p
            WHERE d.deptId = :deptId
              AND e.isDeleted = 'N'
            ORDER BY p.positionId ASC, e.name ASC
            """)
    List<EmpEntity> findOrgEmployeesByDepartmentId(@Param("deptId") Integer deptId);
}