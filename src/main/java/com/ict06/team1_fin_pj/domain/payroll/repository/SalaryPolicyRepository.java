package com.ict06.team1_fin_pj.domain.payroll.repository;

import com.ict06.team1_fin_pj.domain.payroll.entity.SalaryPolicyEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SalaryPolicyRepository extends JpaRepository<SalaryPolicyEntity, Integer>, SalaryPolicyRepositoryCustom {
}
