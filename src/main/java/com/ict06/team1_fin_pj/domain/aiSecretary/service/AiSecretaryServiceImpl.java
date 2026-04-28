package com.ict06.team1_fin_pj.domain.aiSecretary.service;

import com.ict06.team1_fin_pj.domain.aiSecretary.entity.AiChatMessageEntity;
import com.ict06.team1_fin_pj.domain.aiSecretary.entity.AiChatSessionEntity;
import com.ict06.team1_fin_pj.domain.aiSecretary.entity.SessionType;
import com.ict06.team1_fin_pj.domain.aiSecretary.repository.AiChatMessageRepository;
import com.ict06.team1_fin_pj.domain.aiSecretary.repository.AiChatSessionRepository;
import com.ict06.team1_fin_pj.domain.auth.repository.EmpRepository;
import com.ict06.team1_fin_pj.domain.employee.entity.EmpEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

// 채팅 기능 메서드
@Service
@RequiredArgsConstructor // private final를 사용하기 위해 선언
public class AiSecretaryServiceImpl implements AiSecretaryService {

    // private final = @Autowired 대용
    private final AiChatSessionRepository aiChatSessionRepository;
    private final AiChatMessageRepository aiChatMessageRepository;
    private final EmpRepository empRepository;

    // 채팅 세션(채팅방) 생성
    @Override
    public AiChatSessionEntity createSession(String empNo, SessionType sessionType, String title) {
        // [1] empNo이 있으면 employee에 값을 저장하고, 없으면 오류 메시지를 뿌리고 중단해라
        EmpEntity employee  = empRepository.findById(empNo)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사원입니다."));

        // [2] Repository에 넘길 값 취합
        AiChatSessionEntity session = AiChatSessionEntity.builder()
                .employee(employee)
                .sessionType(sessionType)
                .title(title)
                .lastMessageAt(LocalDateTime.now())
                .build();

        return aiChatSessionRepository.save(session);
    }

    // 채팅 세션 목록 조회
    @Override
    public List<AiChatSessionEntity> getSessionList(String empNo, SessionType sessionType) {
        return aiChatSessionRepository.findByEmployeeEmpNoAndSessionTypeOrderByLastMessageAtDesc(empNo, sessionType);
    }

    // 채팅 세션 내 메시지 목록 조회
    @Override
    public List<AiChatMessageEntity> getMessageList(Integer sessionId) {
        return aiChatMessageRepository.findBySessionSessionIdOrderBySeqNoAsc(sessionId);
    }

    // 채팅 세션 내 메시지 저장
    @Override
    @Transactional
    public AiChatMessageEntity saveMessage(Integer sessionId, AiChatMessageEntity message) {
        // [1] 세션 조회 : SELECT * FROM AI_CHAT_SESSION WHERE session_id = ${sessionId}
        AiChatSessionEntity session = aiChatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 대화방 입니다."));

        // [2] 해당세션의 가장 마지막 메시지 seqNo 조회 - 만약 첫 메세지라면 0을 기본으로
        Integer lastSeqNo = aiChatMessageRepository.findTopBySessionSessionIdOrderBySeqNoDesc(sessionId)
                .map(AiChatMessageEntity::getSeqNo)
                .orElse(0);

        // [3] nextSeqNo 설정
        message.setSeqNo(lastSeqNo + 1);

        // [4] 새 메시지 저장
        message.setSession(session);
        AiChatMessageEntity savedMessage = aiChatMessageRepository.save(message);

        // [5] 세션의 lastMessage 갱신
        session.updateLastMessageAt(LocalDateTime.now());

        return savedMessage;
    }
}
