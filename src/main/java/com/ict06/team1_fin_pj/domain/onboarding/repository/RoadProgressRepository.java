/**
 * @FileName : RoadProgressRepository.java
 * @Description : 로드맵 학습 진행률 Repository
 * 사원/아이템별 진행 상태 조회 및 로드맵 삭제 시 연관 데이터 정리
 * @Author : 김다솜
 * @Date : 2026. 04. 30
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.30    김다솜        최초 생성 및 로드맵 ID 기반 벌크 삭제 로직 구현
 */

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
