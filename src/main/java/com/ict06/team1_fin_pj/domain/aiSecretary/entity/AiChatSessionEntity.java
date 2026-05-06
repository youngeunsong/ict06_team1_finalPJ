// 챗봇/AI비서 대화방 단위 관리
// 1개의 AI_CHAT_SESSION = 여러개의 AI_CHAT_MESSAGE
package com.ict06.team1_fin_pj.domain.aiSecretary.entity;

import com.ict06.team1_fin_pj.common.dto.BaseTimeEntity;
import com.ict06.team1_fin_pj.domain.employee.entity.EmpEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "AI_CHAT_SESSION")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiChatSessionEntity extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "session_id")
    private Integer sessionId; // 대화 세선 식별자

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "emp_no", nullable = false)
    private EmpEntity employee; // 해당 사원

    @Enumerated(EnumType.STRING)
    @Column(name = "session_type", nullable = false, length = 20)
    private SessionType sessionType; // AI 서비스 유형 (CHATBOT, ASSISTANT)

    @Column(length = 200)
    private String title; // 대화방 제목

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private SessionStatus status = SessionStatus.ACTIVE; // 세션 상태 (ACTIVE / CLOSED / ARCHIVED)

    @Column(name = "last_message_at")
    private LocalDateTime lastMessageAt; // 마지막 메시지 시각

    // 세션 → 메시지들 (1:N 관계 = 세션 1개 당 여러개의 메시지)
    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<AiChatMessageEntity> messages = new ArrayList<>();

    public void addMessage(AiChatMessageEntity message) {
        this.messages.add(message);
        message.setSession(this);
    }

    public void updateLastMessageAt(LocalDateTime lastMessageAt) {
        this.lastMessageAt = lastMessageAt;
    }

    public void changeStatus(SessionStatus status) {
        this.status = status;
    }
}