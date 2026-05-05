package com.ict06.team1_fin_pj.domain.aiSecretary.service;

import com.ict06.team1_fin_pj.domain.aiSecretary.entity.AiChatMessageEntity;

public interface AiLogService {

    void saveChatbotLog(
            AiChatMessageEntity userMessage,
            AiChatMessageEntity aiMessage,
            boolean providerSuccess,
            boolean fallback,
            long durationMs,
            String errorMessage
    );
}