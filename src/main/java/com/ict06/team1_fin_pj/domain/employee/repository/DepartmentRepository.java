package com.ict06.team1_fin_pj.domain.employee.repository;

import com.ict06.team1_fin_pj.domain.employee.entity.DepartmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

/*
 * 부서 Repository
 *
 * 조직도 트리 생성을 위해 DEPARTMENT 테이블을 조회한다.
 */
public interface DepartmentRepository extends JpaRepository<DepartmentEntity, Integer> {
}