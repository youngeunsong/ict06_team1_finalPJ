package com.ict06.team1_fin_pj.domain.aiSecretary.repository;

import com.ict06.team1_fin_pj.domain.aiSecretary.entity.AiChatSessionEntity;
import com.ict06.team1_fin_pj.domain.aiSecretary.entity.SessionType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AiChatSessionRepository extends JpaRepository<AiChatSessionEntity, Integer> {

    // ASSISTANT 목록 조회용
    @EntityGraph(attributePaths = "employee")
    List<AiChatSessionEntity> findByEmployee_EmpNoAndSessionTypeOrderByLastMessageAtDesc(
            String empNo,
            SessionType sessionType
    );

    // CHATBOT 최근 48시간 내 단일 최근 세션 조회용
    @EntityGraph(attributePaths = "employee")
    Optional<AiChatSessionEntity> findTopByEmployee_EmpNoAndSessionTypeAndLastMessageAtAfterOrderByLastMessageAtDesc(
            String empNo,
            SessionType sessionType,
            LocalDateTime cutoff
    );

    // 48시간 지난 CHATBOT 세션 삭제 대상 조회용
    List<AiChatSessionEntity> findBySessionTypeAndLastMessageAtBefore(
            SessionType sessionType,
            LocalDateTime cutoff
    );
}