package com.ict06.team1_fin_pj.domain.onboarding.repository;

import com.ict06.team1_fin_pj.domain.onboarding.entity.RoadmapEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoadmapRepository extends JpaRepository<RoadmapEntity, Integer> {

    Optional<RoadmapEntity> findFirstByEmployee_EmpNoOrderByRoadmapIdDesc(String empNo);
}
