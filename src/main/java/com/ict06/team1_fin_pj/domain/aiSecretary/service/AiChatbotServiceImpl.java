package com.ict06.team1_fin_pj.domain.aiSecretary.service;

import com.ict06.team1_fin_pj.common.dto.aiSecretary.AiChatMessageResponseDto;
import com.ict06.team1_fin_pj.common.dto.aiSecretary.ChatbotAskResponseDto;
import com.ict06.team1_fin_pj.domain.aiSecretary.entity.AiChatMessageEntity;
import com.ict06.team1_fin_pj.domain.aiSecretary.entity.MessageRole;
import com.ict06.team1_fin_pj.domain.aiSecretary.llm.AiModelClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiChatbotServiceImpl implements AiChatbotService {

    private final AiSecretaryService aiSecretaryService;
    private final AiModelClient aiModelClient;

    @Override
    @Transactional
    public ChatbotAskResponseDto ask(Integer sessionId, String content) {

        // 1. USER 메시지 저장
        AiChatMessageEntity userMessage = AiChatMessageEntity.builder()
                .role(MessageRole.USER)
                .content(content)
                .build();

        AiChatMessageEntity savedUserMessage =
                aiSecretaryService.saveMessage(sessionId, userMessage);

        // 2. 프롬프트 생성
        String prompt = buildPrompt(content);

        // 3. Gemini 호출 + 실패 시 fallback 응답
        String answer;
        String modelName = "gemini";

        try {
            answer = aiModelClient.generateAnswer(prompt);
        } catch (Exception e) {
            log.warn("[GEMINI] 응답 생성 실패. fallback 응답으로 대체합니다. reason={}", e.getMessage());

            answer = buildFallbackAnswer(content);
            modelName = "gemini-fallback";
        }

        // 4. ASSISTANT 메시지 저장
        AiChatMessageEntity aiMessage = AiChatMessageEntity.builder()
                .role(MessageRole.ASSISTANT)
                .content(answer)
                .modelName(modelName)
                .build();

        AiChatMessageEntity savedAiMessage =
                aiSecretaryService.saveMessage(sessionId, aiMessage);

        // 5. 프론트 응답 반환
        return ChatbotAskResponseDto.builder()
                .userMessage(AiChatMessageResponseDto.from(savedUserMessage))
                .aiMessage(AiChatMessageResponseDto.from(savedAiMessage))
                .build();
    }

    private String buildPrompt(String userQuestion) {
        return """
                당신은 사내 그룹웨어와 교육평가 시스템의 AI 챗봇입니다.

                답변 규칙:
                1. 사용자의 질문에 한국어로 답변하세요.
                2. 사내 시스템 안내처럼 친절하고 간결하게 답변하세요.
                3. 확실하지 않은 내용은 단정하지 말고 확인이 필요하다고 말하세요.
                4. 아직 RAG 문서 검색이 연결되지 않았으므로 실제 내부 규정 번호나 문서는 지어내지 마세요.
                5. 답변은 3~6문장 정도로 작성하세요.

                사용자 질문:
                %s
                """.formatted(userQuestion);
    }

    private String buildFallbackAnswer(String userQuestion) {
        return """
                현재 AI 응답 생성 요청이 일시적으로 제한되어 임시 안내 응답을 제공합니다.

                입력하신 질문은 다음과 같습니다.
                "%s"

                현재 단계에서는 사내 지식 검색 챗봇의 세션 저장, 사용자 메시지 저장, AI 응답 메시지 저장 흐름이 정상 연결된 상태입니다.
                실제 Gemini 응답은 API 사용량 제한이 해제된 뒤 다시 확인할 수 있습니다.
                """.formatted(userQuestion);
    }
}