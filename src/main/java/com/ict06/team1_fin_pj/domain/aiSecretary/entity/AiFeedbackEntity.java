package com.ict06.team1_fin_pj.domain.aiSecretary.entity;

import com.ict06.team1_fin_pj.common.dto.BaseTimeEntity;
import com.ict06.team1_fin_pj.domain.employee.entity.EmpEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "AI_FEEDBACK",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_message_emp",
                        columnNames = {"message_id", "emp_id"}
                )
        }
)
public class AiFeedbackEntity extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "feedback_id")
    private Integer feedbackId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_id", nullable = false)
    private AiChatMessageEntity message;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "emp_no")
    private EmpEntity employee;

    @Column(nullable = false)
    private Integer rating; // 1~5

    @Column(columnDefinition = "TEXT")
    private String reason;
}
