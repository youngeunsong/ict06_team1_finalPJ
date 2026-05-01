package com.ict06.team1_fin_pj.domain.employee.repository;

import com.ict06.team1_fin_pj.domain.employee.entity.EmpHistoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdEmpHistoryRepository extends JpaRepository<EmpHistoryEntity, Integer> {
}