/**
 * @FileName : NotificationServiceImpl.java
 * @Description : SSE 기반 실시간 알림 전송 및 알림 상태 관리 서비스
 * @Author : 김다솜
 * @Date : 2026. 04. 23
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.23    김다솜        최초 생성
 * @ 2026.04.23    김다솜        SSE 연결 관리 및 알림 저장·전송 로직/더티 체킹 이용한 알림 읽음 처리 로직 추가
 */

package com.ict06.team1_fin_pj.domain.notification.service;

import com.ict06.team1_fin_pj.common.dto.EmpEntity;
import com.ict06.team1_fin_pj.common.dto.NotificationEntity;
import com.ict06.team1_fin_pj.common.dto.NotificationType;
import com.ict06.team1_fin_pj.domain.auth.repository.EmpRepository;
import com.ict06.team1_fin_pj.domain.notification.repository.NotificationRepository;
import com.ict06.team1_fin_pj.domain.notification.sse.SseEmitterManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl {

    private final NotificationRepository notificationRepository;
    private final SseEmitterManager sseEmitterManager;
    private final EmpRepository empRepository;

    //SSE 구독(프론트에서 처음 연결 시 추출)
    public SseEmitter subscribe(String empNo) {
        SseEmitter emitter = new SseEmitter(60*60*1000L);
        sseEmitterManager.add(empNo, emitter);

        //연결 종료/타임아웃 시 제거
        emitter.onCompletion(() -> sseEmitterManager.remove(empNo));
        emitter.onTimeout(() -> sseEmitterManager.remove(empNo));
        emitter.onError(e -> sseEmitterManager.remove(empNo));

        //연결 직후 더미 이벤트 전송(브라우저 연결 유지용)
        try {
            emitter.send(SseEmitter.event().name("connect").data("connected"));
        } catch(Exception e) {
            sseEmitterManager.remove(empNo);
        }
        return emitter;
    }

    //알림 저장 + 실시간 전송
    //다른 도메인에서 알림 기능 필요할 때 이 메서드 호출하면 됩니다!
    @Transactional
    public void sendNotification(String empNo, String notiType, String title, String content, String url) {
        EmpEntity emp = empRepository.findById(empNo)
                .orElseThrow(() -> new RuntimeException("직원을 찾을 수 없습니다."));

        //1. DB 저장
        NotificationEntity noti = NotificationEntity.builder()
                .employee(emp)
                .notiType(NotificationType.valueOf(notiType))
                .title(title)
                .content(content)
                .url(url)
                .isRead(false)
                .build();
        notificationRepository.save(noti);

        //2. SSE로 실시간 전송
        sseEmitterManager.sendToEmp(empNo, noti);
    }

    //알림 목록 조회
    public List<NotificationEntity> getNotifications(String empNo) {
        return notificationRepository.findByEmployee_EmpNoOrderByCreatedAtDesc(empNo);
    }

    //읽지 않은 알림 개수
    public long getUnreadCount(String empNo) {
        return notificationRepository.countByEmployee_EmpNoAndIsRead(empNo, false);
    }

    //알림 읽음 처리
    @Transactional
    public void markAsRead(Integer notiId) {
        //1. DB에서 해당 알림 조회
        //persistence context에 스냅샷 저장
        NotificationEntity noti = notificationRepository.findById(notiId)
                .orElseThrow(() -> new RuntimeException("알림을 찾을 수 없습니다."));
        //2. Entity 상태 변경(NotificationEntity 하단 markRead() 메서드 참고)
        noti.markRead();
        //@Transactional에 의해 메서드 끝날 때 자동으로 update 쿼리 실행하여 DB 업데이트
    }
}
