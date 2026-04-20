package com.ict06.team1_fin_pj.domain.auth.repository;
import com.ict06.team1_fin_pj.common.dto.EmpEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmpRepository extends JpaRepository<EmpEntity, String> {
    Optional<EmpEntity> findByEmpNo(String empNo);
}
