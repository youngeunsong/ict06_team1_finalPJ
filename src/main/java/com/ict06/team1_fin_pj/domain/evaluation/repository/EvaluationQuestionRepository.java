/**
 * @FileName : QuizQuestionRepository.java
 * @Description : 온보딩 퀴즈 문항 Repository
 *                - QUIZ_QUESTION 테이블 접근
 *                - 학습 카테고리명 기준 퀴즈 문항 목록 조회
 * @Author : 김다솜
 * @Date : 2026. 04. 30
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.30    김다솜        최초 생성
 * @ 2026.05.01    김다솜        categoryName 기준 조회 메서드 추가
 */

package com.ict06.team1_fin_pj.domain.evaluation.repository;

import com.ict06.team1_fin_pj.domain.evaluation.entity.QuizQuestionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EvaluationQuestionRepository extends JpaRepository<QuizQuestionEntity, Integer> {

    //퀴즈 문항 조회
    List<QuizQuestionEntity> findByCategoryName(String categoryName);
}