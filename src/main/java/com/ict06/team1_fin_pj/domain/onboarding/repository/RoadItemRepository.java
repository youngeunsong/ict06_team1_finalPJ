/**
 * @FileName : RoadItemRepository.java
 * @Description : AI 온보딩 로드맵 아이템 Repository / ROAD_ITEM 테이블 조회 역할
 * @Author : 김다솜
 * @Date : 2026. 04. 29
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.29    김다솜        최초 생성/로드맵 아이템 조회 Repository 구현
 */

package com.ict06.team1_fin_pj.domain.onboarding.repository;

import com.ict06.team1_fin_pj.domain.onboarding.entity.RoadItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoadItemRepository extends JpaRepository<RoadItemEntity, Integer> {
}
