package com.ict06.team1_fin_pj.common.dto;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

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
