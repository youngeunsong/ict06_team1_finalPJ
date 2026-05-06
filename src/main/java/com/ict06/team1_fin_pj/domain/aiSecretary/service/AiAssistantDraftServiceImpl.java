package com.ict06.team1_fin_pj.domain.aiSecretary.service;

import com.ict06.team1_fin_pj.common.dto.aiSecretary.AssistantDraftRequestDto;
import com.ict06.team1_fin_pj.common.dto.aiSecretary.AssistantDraftResponseDto;
import com.ict06.team1_fin_pj.common.dto.aiSecretary.AssistantReviseRequestDto;
import com.ict06.team1_fin_pj.common.dto.aiSecretary.AssistantReviseResponseDto;
import com.ict06.team1_fin_pj.domain.aiSecretary.entity.AiChatMessageEntity;
import com.ict06.team1_fin_pj.domain.aiSecretary.entity.AiChatSessionEntity;
import com.ict06.team1_fin_pj.domain.aiSecretary.entity.MessageRole;
import com.ict06.team1_fin_pj.domain.aiSecretary.entity.SessionType;
import com.ict06.team1_fin_pj.domain.aiSecretary.llm.AiModelClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiAssistantDraftServiceImpl implements AiAssistantDraftService {

    private final AiSecretaryService aiSecretaryService;
    private final AiModelClient aiModelClient;
    private final AiLogService aiLogService;

    // 초안 생성
    @Override
    @Transactional
    public AssistantDraftResponseDto createDraft(AssistantDraftRequestDto requestDto) {

        long startTime = System.currentTimeMillis();

        boolean providerSuccess = false;
        boolean fallback = false;
        String errorMessage = null;

        /*
         * AI 비서 문서 작성은 장기 보관 대상이므로 ASSISTANT 세션으로 생성한다.
         */
        AiChatSessionEntity session = aiSecretaryService.createSession(
                requestDto.getEmpNo(),
                SessionType.ASSISTANT,
                requestDto.getTitle()
        );

        /*
         * USER 메시지에는 사용자가 입력한 폼 내용을 요약 저장한다.
         */
        AiChatMessageEntity userMessage = AiChatMessageEntity.builder()
                .role(MessageRole.USER)
                .content(buildUserInputSummary(requestDto))
                .build();

        AiChatMessageEntity savedUserMessage =
                aiSecretaryService.saveMessage(session.getSessionId(), userMessage);

        String prompt = buildDraftPrompt(requestDto);

        String content;
        String modelName = "gemini";

        try {
            content = aiModelClient.generateAnswer(prompt);
            providerSuccess = true;
            fallback = false;
            modelName = "gemini";
        } catch (Exception e) {
            log.warn("[ASSISTANT_DRAFT] Gemini 초안 생성 실패. fallback으로 대체합니다. reason={}", e.getMessage());

            content = buildFallbackDraft(requestDto);
            providerSuccess = false;
            fallback = true;
            errorMessage = e.getMessage();
            modelName = "gemini-fallback";
        }

        AiChatMessageEntity aiMessage = AiChatMessageEntity.builder()
                .role(MessageRole.ASSISTANT)
                .content(content)
                .modelName(modelName)
                .build();

        AiChatMessageEntity savedAiMessage =
                aiSecretaryService.saveMessage(session.getSessionId(), aiMessage);

        long durationMs = System.currentTimeMillis() - startTime;

        /*
         * 기존 AiLogService는 Chatbot 전용 signature라면,
         * 우선은 이 부분을 생략하고 나중에 ASSISTANT 로그용 메서드를 추가해도 된다.
         *
         * 현재 빠른 연결이 목표이므로 아래는 선택사항.
         */
        try {
            aiLogService.saveAssistantLog(
                    savedUserMessage,
                    savedAiMessage,
                    "ASSISTANT_DRAFT",
                    providerSuccess,
                    fallback,
                    durationMs,
                    errorMessage
            );
        } catch (Exception logException) {
            log.warn("[AI_LOG] AI 비서 초안 로그 저장 실패. reason={}", logException.getMessage());
        }

        return AssistantDraftResponseDto.builder()
                .sessionId(session.getSessionId())
                .userMessageId(savedUserMessage.getMessageId())
                .aiMessageId(savedAiMessage.getMessageId())
                .type(requestDto.getType())
                .title(requestDto.getTitle())
                .content(content)
                .modelName(modelName)
                .fallback(fallback)
                .build();
    }

    // 초안 수정
    @Override
    @Transactional
    public AssistantReviseResponseDto reviseDraft(AssistantReviseRequestDto requestDto) {

        long startTime = System.currentTimeMillis();

        boolean providerSuccess = false;
        boolean fallback = false;
        String errorMessage = null;

        /*
         * [1] USER 메시지 저장
         * 사용자가 입력한 수정 요청을 대화 이력으로 남긴다.
         */
        AiChatMessageEntity userMessage = AiChatMessageEntity.builder()
                .role(MessageRole.USER)
                .content(buildReviseUserMessage(requestDto))
                .build();

        AiChatMessageEntity savedUserMessage =
                aiSecretaryService.saveMessage(requestDto.getSessionId(), userMessage);

        /*
         * [2] 현재 문서 + 수정 지시로 프롬프트 구성
         */
        String prompt = buildRevisePrompt(requestDto);

        String revisedContent;
        String modelName = "gemini";

        /*
         * [3] Gemini 호출
         * 실패하면 fallback 문서로 대체한다.
         */
        try {
            revisedContent = aiModelClient.generateAnswer(prompt);
            providerSuccess = true;
            fallback = false;
            modelName = "gemini";
        } catch (Exception e) {
            log.warn("[ASSISTANT_REVISE] Gemini 문서 수정 실패. fallback으로 대체합니다. reason={}", e.getMessage());

            revisedContent = buildReviseFallback(requestDto);
            providerSuccess = false;
            fallback = true;
            errorMessage = e.getMessage();
            modelName = "gemini-fallback";
        }

        /*
         * [4] ASSISTANT 메시지 저장
         * 수정된 문서 전문을 ASSISTANT 메시지로 저장한다.
         */
        AiChatMessageEntity aiMessage = AiChatMessageEntity.builder()
                .role(MessageRole.ASSISTANT)
                .content(revisedContent)
                .modelName(modelName)
                .build();

        AiChatMessageEntity savedAiMessage =
                aiSecretaryService.saveMessage(requestDto.getSessionId(), aiMessage);

        /*
         * [5] AI_LOG 저장
         * 현재 AiLogService가 챗봇용 메서드만 있다면 우선 동일 구조를 재사용할 수 있다.
         * 단, 가능하면 아래 7번의 saveAssistantLog() 추가를 추천한다.
         */
        long durationMs = System.currentTimeMillis() - startTime;

        try {
            aiLogService.saveAssistantLog(
                    savedUserMessage,
                    savedAiMessage,
                    "ASSISTANT_REVISE",
                    providerSuccess,
                    fallback,
                    durationMs,
                    errorMessage
            );
        } catch (Exception logException) {
            log.warn("[AI_LOG] AI 문서 수정 로그 저장 실패. reason={}", logException.getMessage());
        }

        /*
         * [6] 프론트로 수정 결과 반환
         */
        return AssistantReviseResponseDto.builder()
                .sessionId(requestDto.getSessionId())
                .userMessageId(savedUserMessage.getMessageId())
                .aiMessageId(savedAiMessage.getMessageId())
                .type(requestDto.getType())
                .title(requestDto.getTitle())
                .content(revisedContent)
                .modelName(modelName)
                .fallback(fallback)
                .build();
    }

    private String buildUserInputSummary(AssistantDraftRequestDto requestDto) {
        return """
                문서 유형: %s
                제목: %s
                작성 목적: %s
                대상 독자: %s
                정리 대상: %s
                핵심 내용: %s
                원하는 분량/방식: %s
                """.formatted(
                safe(requestDto.getType()),
                safe(requestDto.getTitle()),
                safe(requestDto.getPurpose()),
                safe(requestDto.getAudience()),
                joinTargets(requestDto.getTargets()),
                safe(requestDto.getDetail()),
                safe(requestDto.getAmount())
        );
    }

    private String buildDraftPrompt(AssistantDraftRequestDto requestDto) {
        String typeLabel = switch (safe(requestDto.getType())) {
            case "minutes" -> "회의록";
            case "approval" -> "결재 사유서";
            default -> "보고서";
        };

        String typeInstruction = switch (safe(requestDto.getType())) {
            case "minutes" -> """
                    회의 목적, 주요 논의 내용, 결정 사항, 액션 아이템 순서로 정리하세요.
                    발언록이 부족한 경우 내용을 지어내지 말고 입력된 핵심 내용 중심으로 정리하세요.
                    """;
            case "approval" -> """
                    결재 배경, 필요성, 기대 효과, 요청 사항 순서로 정리하세요.
                    과장된 표현은 피하고 승인자가 이해하기 쉽게 작성하세요.
                    """;
            default -> """
                    개요, 작성 목적, 주요 내용, 시사점, 후속 계획 순서로 정리하세요.
                    실무 보고서 형식으로 명확하고 간결하게 작성하세요.
                    """;
        };

        return """
                당신은 사내 그룹웨어의 AI 문서 작성 비서입니다.

                다음 입력값을 바탕으로 %s 초안을 작성하세요.

                작성 규칙:
                1. 한국어로 작성하세요.
                2. 업무 문서에 적합한 공손하고 명확한 문체를 사용하세요.
                3. 입력값에 없는 구체적인 수치, 일정, 정책명은 지어내지 마세요.
                4. 제목과 소제목을 포함해 읽기 쉽게 구성하세요.
                5. 불필요한 설명 없이 문서 초안만 출력하세요.
                6. 마크다운 기호(#, ##, ###, *, -)는 사용하지 말고 일반 문서 형식으로 작성하세요.

                유형별 지시:
                %s

                입력값:
                - 제목: %s
                - 작성 목적: %s
                - 대상 독자: %s
                - 정리 대상: %s
                - 핵심 내용: %s
                - 원하는 분량/방식: %s
                """.formatted(
                typeLabel,
                typeInstruction,
                safe(requestDto.getTitle()),
                safe(requestDto.getPurpose()),
                safe(requestDto.getAudience()),
                joinTargets(requestDto.getTargets()),
                safe(requestDto.getDetail()),
                safe(requestDto.getAmount())
        );
    }

    private String buildFallbackDraft(AssistantDraftRequestDto requestDto) {
        String typeLabel = switch (safe(requestDto.getType())) {
            case "minutes" -> "회의록";
            case "approval" -> "결재 사유";
            default -> "보고서";
        };

        return """
                %s 초안 생성이 일시적으로 원활하지 않습니다.

                아래 입력 내용을 기준으로 초안을 다시 생성해 주세요.

                제목: %s
                작성 목적: %s
                대상 독자: %s
                핵심 내용:
                %s
                """.formatted(
                typeLabel,
                safe(requestDto.getTitle()),
                safe(requestDto.getPurpose()),
                safe(requestDto.getAudience()),
                safe(requestDto.getDetail())
        );
    }

    private String safe(String value) {
        return value == null ? "" : value.trim();
    }

    private String joinTargets(List<String> targets) {
        if (targets == null || targets.isEmpty()) {
            return "";
        }

        return String.join(", ", targets);
    }

    //
    private String buildReviseUserMessage(AssistantReviseRequestDto requestDto) {
        return """
            문서 수정 요청
            문서 유형: %s
            제목: %s
            수정 요청: %s
            """.formatted(
                safe(requestDto.getType()),
                safe(requestDto.getTitle()),
                safe(requestDto.getInstruction())
        );
    }

    //
    private String buildRevisePrompt(AssistantReviseRequestDto requestDto) {
        String typeLabel = switch (safe(requestDto.getType())) {
            case "minutes" -> "회의록";
            case "approval" -> "결재 사유서";
            default -> "보고서";
        };

        return """
            당신은 사내 그룹웨어의 AI 문서 작성 비서입니다.

            아래의 기존 %s 초안을 사용자의 수정 요청에 맞게 다시 작성하세요.

            작성 규칙:
            1. 한국어로 작성하세요.
            2. 기존 문서의 의미와 핵심 내용은 유지하세요.
            3. 사용자의 수정 요청을 우선 반영하세요.
            4. 입력값에 없는 구체적인 수치, 일정, 정책명은 지어내지 마세요.
            5. 불필요한 설명 없이 수정된 문서 본문만 출력하세요.
            6. 마크다운 기호(#, ##, ###, *, -)는 사용하지 말고 일반 문서 형식으로 작성하세요.

            문서 제목:
            %s

            기존 문서:
            %s

            사용자 수정 요청:
            %s
            """.formatted(
                typeLabel,
                safe(requestDto.getTitle()),
                safe(requestDto.getCurrentContent()),
                safe(requestDto.getInstruction())
        );
    }

    //
    private String buildReviseFallback(AssistantReviseRequestDto requestDto) {
        return """
            문서 수정 요청이 일시적으로 원활하지 않습니다.

            아래는 기존 문서 내용입니다.
            잠시 후 다시 수정 요청을 시도해 주세요.

            %s
            """.formatted(
                safe(requestDto.getCurrentContent())
        );
    }
}