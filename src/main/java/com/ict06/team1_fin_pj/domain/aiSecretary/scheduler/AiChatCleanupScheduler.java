package com.ict06.team1_fin_pj.domain.aiSecretary.scheduler;

import com.ict06.team1_fin_pj.domain.aiSecretary.entity.AiChatSessionEntity;
import com.ict06.team1_fin_pj.domain.aiSecretary.entity.SessionType;
import com.ict06.team1_fin_pj.domain.aiSecretary.repository.AiChatSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class AiChatCleanupScheduler {

    private static final long CHATBOT_RETENTION_HOURS = 48L;

    private final AiChatSessionRepository aiChatSessionRepository;

    // 매일 새벽 3시에 48시간 지난 CHATBOT 세션 삭제
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void cleanupExpiredChatbotSessions() {

        LocalDateTime cutoff = LocalDateTime.now().minusHours(CHATBOT_RETENTION_HOURS);

        List<AiChatSessionEntity> expiredSessions =
                aiChatSessionRepository.findBySessionTypeAndLastMessageAtBefore(
                        SessionType.CHATBOT,
                        cutoff
                );

        if (expiredSessions.isEmpty()) {
            log.info("[AI CHATBOT CLEANUP] 삭제 대상 없음. cutoff={}", cutoff);
            return;
        }

        // deleteAllInBatch 사용 금지.
        aiChatSessionRepository.deleteAll(expiredSessions);

        log.info(
                "[AI CHATBOT CLEANUP] 만료 CHATBOT 세션 삭제 완료. count={}, cutoff={}",
                expiredSessions.size(),
                cutoff
        );
    }
}