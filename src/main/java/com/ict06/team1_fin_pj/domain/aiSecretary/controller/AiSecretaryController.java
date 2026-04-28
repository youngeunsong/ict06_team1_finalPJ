package com.ict06.team1_fin_pj.domain.aiSecretary.controller;

import com.ict06.team1_fin_pj.common.dto.aiSecretary.AiChatMessageCreateRequestDto;
import com.ict06.team1_fin_pj.common.dto.aiSecretary.AiChatMessageResponseDto;
import com.ict06.team1_fin_pj.common.dto.aiSecretary.AiChatSessionCreateRequestDto;
import com.ict06.team1_fin_pj.common.dto.aiSecretary.AiChatSessionResponseDto;
import com.ict06.team1_fin_pj.domain.aiSecretary.entity.AiChatMessageEntity;
import com.ict06.team1_fin_pj.domain.aiSecretary.entity.AiChatSessionEntity;
import com.ict06.team1_fin_pj.domain.aiSecretary.entity.SessionType;
import com.ict06.team1_fin_pj.domain.aiSecretary.response.ApiResponse;
import com.ict06.team1_fin_pj.domain.aiSecretary.service.AiSecretaryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai-secretary")
@RequiredArgsConstructor
public class AiSecretaryController {

    private final AiSecretaryService aiSecretaryService;

    // 테스트 임시용
    @PostMapping("/sessions/test")
    public String testPost() {
        return "POST OK";
    }

    // 채팅 세션(채팅방) 생성
    @PostMapping("/sessions")
    public ApiResponse<AiChatSessionResponseDto> createSession(
            // 프론트에서 보낸 JSON 데이터를 AiChatSessionCreateRequestDto 객체로 변환
            @Valid @RequestBody AiChatSessionCreateRequestDto requestDto
    ) {
        // [1] 세션(대화방) 만들기
        AiChatSessionEntity session = aiSecretaryService.createSession(
                requestDto.getEmpNo(),
                requestDto.getSessionType(),
                requestDto.getTitle()
        );

        // [2] 세션 응답 DTO 생성 => setter로 값는 넣는 것과 동일한 작업
        AiChatSessionResponseDto response = AiChatSessionResponseDto.builder()
                .sessionId(session.getSessionId())
                .empNo(session.getEmployee().getEmpNo())
                .sessionType(session.getSessionType())
                .title(session.getTitle())
                .status(session.getStatus())
                .lastMessageAt(session.getLastMessageAt())
                .createdAt(session.getCreatedAt())
                .updatedAt(session.getUpdatedAt())
                .build();

        // [3] 공통 응답 포맷으로 값 리턴
        return ApiResponse.ok("세션 생성 성공", response);
    }

    // 채팅 세션 목록 조회
    @GetMapping("/sessions")
    public ApiResponse<List<AiChatSessionResponseDto>> getSessionList(
            @RequestParam String empNo,
            @RequestParam SessionType sessionType
    ) {
        // 세션 응답 DTO 포함 List 생성
        List<AiChatSessionResponseDto> response  = aiSecretaryService.getSessionList(empNo, sessionType)
                .stream() // 데이터를 하나씩 꺼내서 .map으로 반복해서 DTO를 만들어라
                .map(session -> AiChatSessionResponseDto.builder()
                        .sessionId(session.getSessionId())
                        .empNo(session.getEmployee().getEmpNo())
                        .sessionType(session.getSessionType())
                        .title(session.getTitle())
                        .status(session.getStatus())
                        .lastMessageAt(session.getLastMessageAt())
                        .createdAt(session.getCreatedAt())
                        .updatedAt(session.getUpdatedAt())
                        .build()
                )
                .toList(); // 많은 DTO 들을 최종적으로 하나의 List에 담음

        return ApiResponse.ok("세션 목록 조회 성공", response);
    }

    // 채팅 세션 내 메시지 목록 조회
    @GetMapping("/sessions/{sessionId}/messages")
    public ApiResponse<List<AiChatMessageResponseDto>> getMessageList(
        @PathVariable Integer sessionId // URL 경로(path)에 있는 상수 값을 변수(Variable)로 가져오기
    ) {
        // 메시지 응답 DTO 포함 List 생성
        List<AiChatMessageResponseDto> response = aiSecretaryService.getMessageList(sessionId)
                .stream()
                .map(message -> AiChatMessageResponseDto.builder()
                        .messageId(message.getMessageId())
                        .sessionId(message.getSession().getSessionId())
                        .role(message.getRole())
                        .content(message.getContent())
                        .seqNo(message.getSeqNo())
                        .modelName(message.getModelName())
                        .promptTokens(message.getPromptTokens())
                        .completionTokens(message.getCompletionTokens())
                        .createdAt(message.getCreatedAt())
                        .build())
                .toList();

        return ApiResponse.ok("메시지 목록 조회 성공", response);
    }

    // 채팅 세션 내 메시지 저장
    @PostMapping("/sessions/{sessionId}/messages")
    public ApiResponse<AiChatMessageResponseDto> saveMessage(
        @PathVariable Integer sessionId,
        @Valid @RequestBody AiChatMessageCreateRequestDto request
    ){
        // [1] PATH에서 받아온 값 DB에 넣기
        AiChatMessageEntity message = AiChatMessageEntity.builder()
                .role(request.getRole())
                .content(request.getContent())
                .modelName(request.getModelName())
                .build();

        // [2] 메시지 저장하기
        AiChatMessageEntity savedMessage = aiSecretaryService.saveMessage(sessionId, message);

        // [3] 메시지 응답 DTO 생성
        AiChatMessageResponseDto response = AiChatMessageResponseDto.builder()
                .messageId(savedMessage.getMessageId())
                .sessionId(savedMessage.getSession().getSessionId())
                .role(savedMessage.getRole())
                .content(savedMessage.getContent())
                .seqNo(savedMessage.getSeqNo())
                .modelName(savedMessage.getModelName())
                .promptTokens(savedMessage.getPromptTokens())
                .completionTokens(savedMessage.getCompletionTokens())
                .createdAt(savedMessage.getCreatedAt())
                .build();

        return ApiResponse.ok("메시지 저장 성공", response);
    }
}
