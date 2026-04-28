package com.ict06.team1_fin_pj.domain.employee.repository;

import com.ict06.team1_fin_pj.domain.employee.entity.EmpEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<EmpEntity, String> {

    Optional<EmpEntity> findByEmpNo(String empNo);
}