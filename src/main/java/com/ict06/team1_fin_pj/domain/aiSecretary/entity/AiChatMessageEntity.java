// 대화방 내 메시지 단위 저장
// 1개의 AI_CHAT_SESSION = 여러개의 AI_CHAT_MESSAGE
package com.ict06.team1_fin_pj.domain.aiSecretary.entity;

import com.ict06.team1_fin_pj.common.dto.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "AI_CHAT_MESSAGE",
       uniqueConstraints = {
            @UniqueConstraint(
                name = "uk_session_seq",
                    columnNames = {"session_id", "seq_no"}
            )
       }
)
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiChatMessageEntity extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "message_id")
    private Integer messageId; // 메시지 식별자

    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private AiChatSessionEntity session; // 대화 세션 식별자

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MessageRole role; // 메시지 작성 주체(USER / ASSISTANT / SYSTEM)

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content; // 메시지 내용

    @Setter
    @Column(name = "seq_no", nullable = false)
    private Integer seqNo; // 세션 내 메시지 순번

    @Column(name = "model_name", length = 100)
    private String modelName; // 응답 생성 모델명 <= ASSISTANT 메시지 주 사용

    @Builder.Default
    @Column(name = "prompt_tokens")
    private Integer promptTokens = 0; // 프롬프트 토큰 수

    @Builder.Default
    @Column(name = "completion_tokens")
    private Integer completionTokens = 0; // 응답 토큰 수

    // 부모 메시지 (self FK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_message_id")
    private AiChatMessageEntity parentMessage;
}
