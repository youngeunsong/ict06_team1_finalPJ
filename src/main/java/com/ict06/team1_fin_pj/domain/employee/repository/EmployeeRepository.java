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
 *
 * 사용 위치:
 * - 관리자 사원 관리
 * - 조직도 조회
 * - 부서 삭제 제한
 * - 부서별 인원 수 조회
 */
public interface EmployeeRepository extends JpaRepository<EmpEntity, String> {

    /*
     * 사번(emp_no)으로 사원 조회
     *
     * 로그인 사용자 조회,
     * 사원 상세 조회,
     * 수정 처리 등에 사용한다.
     */
    Optional<EmpEntity> findByEmpNo(String empNo);

    /*
     * 특정 부서의 사원 목록 조회
     *
     * 조직도에서 팀을 클릭했을 때 사용한다.
     *
     * fetch join 사용 이유:
     * - department, position 정보를 바로 사용하기 위함
     * - LazyInitializationException 방지
     * - N+1 문제 감소
     *
     * 조회 조건:
     * - 해당 부서 소속
     * - 삭제 처리되지 않은 사원
     * - 퇴사 상태가 아닌 사원
     *
     * 중요:
     * - 퇴사자는 인사 이력으로는 남겨두지만,
     *   현재 조직도에는 표시하지 않는다.
     *
     * 정렬:
     * - 직급 순
     * - 이름 순
     */
    @Query("""
            SELECT e
            FROM EmpEntity e
            JOIN FETCH e.department d
            JOIN FETCH e.position p
            WHERE d.deptId = :deptId
              AND e.isDeleted = 'N'
              AND e.status <> '퇴사'
            ORDER BY p.positionId ASC, e.name ASC
            """)
    List<EmpEntity> findOrgEmployeesByDepartmentId(
            @Param("deptId") Integer deptId
    );

    /*
     * 특정 본부 아래의 모든 팀 사원 목록 조회
     *
     * 조직도에서 본부를 클릭했을 때 사용한다.
     *
     * 예:
     * 개발본부 클릭
     * → 개발1팀, 개발2팀, 디자인팀 소속 사원 전체 조회
     *
     * 운영 기준:
     * - 사원은 팀에 소속된다고 가정한다.
     * - 본부 자체 소속 사원은 조회하지 않는다.
     *
     * 조회 조건:
     * - 삭제 처리되지 않은 사원
     * - 퇴사 상태가 아닌 사원
     */
    @Query("""
            SELECT e
            FROM EmpEntity e
            JOIN FETCH e.department d
            JOIN FETCH e.position p
            WHERE d.parentDept.deptId = :parentDeptId
              AND e.isDeleted = 'N'
              AND e.status <> '퇴사'
            ORDER BY p.positionId ASC, e.name ASC
            """)
    List<EmpEntity> findOrgEmployeesByParentDepartmentId(
            @Param("parentDeptId") Integer parentDeptId
    );

    /*
     * 특정 부서에 소속된 사원이 존재하는지 확인
     *
     * 부서 삭제 제한에 사용한다.
     *
     * 여기서는 퇴사자도 포함해서 확인한다.
     *
     * 이유:
     * - 퇴사자도 과거에 해당 부서에 소속되었던 인사 이력이다.
     * - 따라서 퇴사자만 있다고 해서 부서를 바로 삭제하면
     *   기존 인사 기록과 연결이 끊길 수 있다.
     *
     * true:
     * - 해당 부서를 사용 중인 사원이 있음
     * - 삭제 불가
     */
    boolean existsByDepartment_DeptId(Integer deptId);

    /*
     * 특정 팀에 직접 소속된 현재 인원 수 조회
     *
     * 부서 관리 화면의 사원 수 표시용이다.
     *
     * 사용 예:
     * 개발1팀 → 5명
     * 디자인팀 → 2명
     *
     * 조건:
     * - 삭제 처리되지 않은 사원
     * - 퇴사 상태가 아닌 사원
     *
     * 주의:
     * - 사원 목록에서 퇴사자는 조회 조건에 따라 볼 수 있지만,
     *   조직도와 현재 인원 수에는 포함하지 않는다.
     */
    @Query("""
            SELECT COUNT(e)
            FROM EmpEntity e
            JOIN e.department d
            WHERE d.deptId = :deptId
              AND e.isDeleted = 'N'
              AND e.status <> '퇴사'
            """)
    long countActiveEmployeesByDepartmentId(
            @Param("deptId") Integer deptId
    );

    /*
     * 특정 본부 아래 전체 팀의 현재 인원 수 조회
     *
     * 본부 인원 수 표시용이다.
     *
     * 예:
     * 개발본부
     * ├─ 개발1팀 (3명)
     * ├─ 개발2팀 (5명)
     * └─ 디자인팀 (2명)
     *
     * → 결과: 10명
     *
     * 조건:
     * - 삭제 처리되지 않은 사원
     * - 퇴사 상태가 아닌 사원
     */
    @Query("""
            SELECT COUNT(e)
            FROM EmpEntity e
            JOIN e.department d
            WHERE d.parentDept.deptId = :parentDeptId
              AND e.isDeleted = 'N'
              AND e.status <> '퇴사'
            """)
    long countActiveEmployeesByParentDepartmentId(
            @Param("parentDeptId") Integer parentDeptId
    );

    /*
     * 전체 조직도 사원 목록 조회
     *
     * 조직도에서 "전체 조직 보기"를 클릭했을 때 사용한다.
     *
     * 조건:
     * - 삭제 처리되지 않은 사원
     * - 퇴사 상태가 아닌 사원
     *
     * 정렬:
     * - 부서 ID 순
     * - 직급 순
     * - 이름 순
     */
    @Query("""
        SELECT e
        FROM EmpEntity e
        JOIN FETCH e.department d
        JOIN FETCH e.position p
        WHERE e.isDeleted = 'N'
          AND e.status <> '퇴사'
        ORDER BY d.deptId ASC, p.positionId ASC, e.name ASC
        """)
    List<EmpEntity> findAllOrgEmployees();
}