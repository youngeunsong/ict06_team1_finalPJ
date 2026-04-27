package com.ict06.team1_fin_pj.common.dto;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

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
    private Integer messageId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private AiChatSessionEntity session;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MessageRole role;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "seq_no", nullable = false)
    private Integer seqNo;

    @Column(name = "model_name", length = 100)
    private String modelName;

    @Builder.Default
    @Column(name = "prompt_tokens")
    private Integer promptTokens = 0;

    @Builder.Default
    @Column(name = "completion_tokens")
    private Integer completionTokens = 0;

    // 부모 메시지 (self FK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_message_id")
    private AiChatMessageEntity parentMessage;
}
