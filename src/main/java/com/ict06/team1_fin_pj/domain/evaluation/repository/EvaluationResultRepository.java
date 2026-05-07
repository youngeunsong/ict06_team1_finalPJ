/**
 * @FileName : QuizResultRepository.java
 * @Description : 온보딩 퀴즈 응답 결과 Repository
 *                - QUIZ_RESULT 테이블 접근
 *                - 사원별 퀴즈 응시 결과 및 문항별 응답 이력 조회
 * @Author : 김다솜
 * @Date : 2026. 04. 30
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.30    김다솜        최초 생성 및 사원별 퀴즈 결과 조회 메서드 구현
 */

package com.ict06.team1_fin_pj.domain.evaluation.repository;

import com.ict06.team1_fin_pj.domain.evaluation.entity.QuizResultEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EvaluationResultRepository extends JpaRepository<QuizResultEntity, Integer> {

    //특정 사원의 퀴즈 응시 결과 조회
    List<QuizResultEntity> findByEmployee_EmpNo(String empNo);

    //특정 사원 + 특정 문항의 응시 결과 조회
    List<QuizResultEntity> findByEmployee_EmpNoAndQuestion_QuestionId(String empNo, Integer questionId);
}