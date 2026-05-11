/**
 * @FileName : QuizGenerationRuleRepository.java
 * @Description : AI 퀴즈 출제 기준 Repository
 * @Author : 김다솜
 * @Date : 2026. 05. 10
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.05.10    김다솜        최초 생성 및 퀴즈 출제 기준 CRUD 조회 기능 추가
 * @ 2026.05.11    김다솜        활성화된 카테고리별 최신 출제 기준 조회 기능 추가
 */

package com.ict06.team1_fin_pj.domain.evaluation.repository;

import com.ict06.team1_fin_pj.domain.evaluation.entity.QuizGenerationRuleEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface QuizGenerationRuleRepository extends JpaRepository<QuizGenerationRuleEntity, Integer> {

    List<QuizGenerationRuleEntity> findAllByOrderByCategoryNameAscRuleIdAsc();

    Optional<QuizGenerationRuleEntity> findFirstByCategoryNameAndIsActiveTrueOrderByRuleIdDesc(String categoryName);
}
