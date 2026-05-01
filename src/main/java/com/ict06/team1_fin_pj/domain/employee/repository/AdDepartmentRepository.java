package com.ict06.team1_fin_pj.domain.employee.repository;

import com.ict06.team1_fin_pj.domain.employee.entity.DepartmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdDepartmentRepository extends JpaRepository<DepartmentEntity, Integer> {
}