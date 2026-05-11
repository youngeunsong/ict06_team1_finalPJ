/**
 * @FileName : RoadItemRepository.java
 * @Description : 온보딩 로드맵 아이템 Repository
 * @Author : 김다솜
 * @Date : 2026. 04. 29
 * @Modification_History
 * @
 * @ 수정일자        수정자       수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.29    김다솜        최초 생성 및 로드맵 아이템 조회 Repository 구현
 * @ 2026.05.10    김다솜        관리자 일정 목록 조회용 직원/로드맵/콘텐츠 EntityGraph 조회 추가
 */
package com.ict06.team1_fin_pj.domain.onboarding.repository;

import com.ict06.team1_fin_pj.domain.onboarding.entity.RoadItemEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoadItemRepository extends JpaRepository<RoadItemEntity, Integer> {

    List<RoadItemEntity> findByRoadmap_RoadmapIdOrderByOrderNo(Integer roadmapId);

    @EntityGraph(attributePaths = {"roadmap", "roadmap.employee", "content"})
    List<RoadItemEntity> findAllByOrderByRoadmap_Employee_EmpNoAscOrderNoAsc();
}
