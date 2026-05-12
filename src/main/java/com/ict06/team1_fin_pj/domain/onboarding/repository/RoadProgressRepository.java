package com.ict06.team1_fin_pj.domain.onboarding.repository;

import com.ict06.team1_fin_pj.domain.onboarding.entity.RoadProgressEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RoadProgressRepository extends JpaRepository<RoadProgressEntity, Integer> {

    Optional<RoadProgressEntity> findByEmployee_EmpNoAndItem_ItemId(String empNo, Integer itemId);
    List<RoadProgressEntity> findByEmployee_EmpNo(String empNo);
    void deleteByItem_Roadmap_RoadmapId(Integer roadmapId);
}
