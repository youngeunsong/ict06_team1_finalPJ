/**
 * @FileName : QuizResultEntity.java
 * @Description : 온보딩 퀴즈 응답 결과 Entity
 *                - QUIZ_RESULT 테이블 매핑
 *                - 사원별 문항 응답, 채점 결과, AI 평가 결과 저장
 *                - 카테고리별 총점 계산 시 QUIZ_QUESTION과 조인하여 사용
 * @Author : 김다솜
 * @Date : 2026. 04. 30
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.30    김다솜        최초 생성 및 AI 확장형 퀴즈 결과 Entity 구현
 */

package com.ict06.team1_fin_pj.domain.evaluation.entity;

import com.ict06.team1_fin_pj.domain.employee.entity.EmpEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "QUIZ_RESULT")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizResultEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "result_id")
    private Integer resultId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "emp_no", nullable = false)
    private EmpEntity employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private QuizQuestionEntity question;

    @Column(name = "selected_no")
    private Integer selectedNo;

    @Column(name = "answer_text", length = 2000)
    private String answerText;

    @Column(name = "is_correct")
    private Boolean isCorrect;

    @Column(name = "score")
    private Integer score;

    @Column(name = "ai_score", precision = 5, scale = 2)
    private BigDecimal aiScore;

    @Column(name = "ai_feedback", length = 2000)
    private String aiFeedback;

    @Column(name = "similarity_score", precision = 5, scale = 2)
    private BigDecimal similarityScore;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;
}