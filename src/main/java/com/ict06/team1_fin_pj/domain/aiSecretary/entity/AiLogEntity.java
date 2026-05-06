package com.ict06.team1_fin_pj.domain.aiSecretary.entity;

import com.ict06.team1_fin_pj.common.dto.BaseTimeEntity;
import com.ict06.team1_fin_pj.domain.employee.entity.EmpEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "AI_LOG")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiLogEntity extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "log_id")
    private Integer logId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "emp_no")
    private EmpEntity employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id")
    private AiChatSessionEntity session; // 챗봇 세션 ID

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_id")
    private AiChatMessageEntity message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private AiLogType type; // CHATBOT / ASSISTANT

    @Column(columnDefinition = "TEXT")
    private String query;

    @Column(columnDefinition = "TEXT")
    private String response;

    @Column(name = "duration_ms")
    private Integer durationMs;

    @Builder.Default
    @Column
    private Boolean success = true;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;
}
