package com.ict06.team1.finalpj.Authorization;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmpRepository extends JpaRepository<EmpEntity, String> {
     Optional<EmpEntity> findByEmpNo(String empNo);
}
