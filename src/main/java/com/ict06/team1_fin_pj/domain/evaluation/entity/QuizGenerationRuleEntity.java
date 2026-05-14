/**
 * @FileName : QuizGenerationRuleEntity.java
 * @Description : AI 퀴즈 출제 기준 Entity
 * @Author : 김다솜
 * @Date : 2026. 05. 11
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.05.11    김다솜        최초 생성 및 카테고리별 퀴즈 출제 기준 관리 필드 추가
 */

package com.ict06.team1_fin_pj.domain.evaluation.entity;

import com.ict06.team1_fin_pj.common.dto.BaseTimeEntity;
import com.ict06.team1_fin_pj.domain.onboarding.entity.Difficulty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "QUIZ_GENERATION_RULE")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizGenerationRuleEntity extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rule_id")
    private Integer ruleId;

    @Column(name = "category_name", length = 50, nullable = false)
    private String categoryName;

    @Column(name = "question_count", nullable = false)
    private Integer questionCount;

    @Column(name = "pass_score", nullable = false)
    private Integer passScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "difficulty", length = 20, nullable = false)
    private Difficulty difficulty;

    @Enumerated(EnumType.STRING)
    @Column(name = "question_type", length = 20, nullable = false)
    private QuestionType questionType;

    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;

    public void updateRule(
            String categoryName,
            Integer questionCount,
            Integer passScore,
            Difficulty difficulty,
            QuestionType questionType,
            Boolean isActive
    ) {
        this.categoryName = categoryName;
        this.questionCount = questionCount;
        this.passScore = passScore;
        this.difficulty = difficulty;
        this.questionType = questionType;
        this.isActive = Boolean.TRUE.equals(isActive);
    }
}
