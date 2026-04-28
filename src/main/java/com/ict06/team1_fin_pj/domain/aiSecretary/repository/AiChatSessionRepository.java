package com.ict06.team1_fin_pj.domain.aiSecretary.repository;

import com.ict06.team1_fin_pj.domain.aiSecretary.entity.AiChatSessionEntity;
import com.ict06.team1_fin_pj.domain.aiSecretary.entity.SessionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

// 내 AI 비서 세션 목록 / 내 챗봇 세션 목록/ 최근 대화 조회
@Repository
public interface AiChatSessionRepository extends JpaRepository<AiChatSessionEntity, Integer> {
    List<AiChatSessionEntity> findByEmployeeEmpNoAndSessionTypeOrderByLastMessageAtDesc(
            String empNo,
            SessionType sessionType
    );
}
