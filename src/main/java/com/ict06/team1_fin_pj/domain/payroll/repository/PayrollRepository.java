package com.ict06.team1_fin_pj.domain.payroll.repository;

import com.ict06.team1_fin_pj.domain.payroll.entity.PayrollEntity;
import org.springframework.data.jpa.repository.JpaRepository;

// 급여대장 JPA Repository
public interface PayrollRepository extends JpaRepository<PayrollEntity, Integer>, PayrollRepositoryCustom{
}
