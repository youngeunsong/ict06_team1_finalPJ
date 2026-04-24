/**
 * @FileName : NotificationController.java
 * @Description : 실시간 알림(SSE) 구독 및 알림 목록 관리를 위한 컨트롤러
 * @Author : 김다솜
 * @Date : 2026. 04. 23
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.23    김다솜        최초 생성/SSE 구독, 알림 조회, 읽음 처리 API 구현
 */

package com.ict06.team1_fin_pj.domain.notification.controller;

import com.ict06.team1_fin_pj.common.dto.NotificationEntity;
import com.ict06.team1_fin_pj.common.security.PrincipalDetails;
import com.ict06.team1_fin_pj.domain.notification.service.NotificationServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequestMapping("/api/noti")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class NotificationController {

    private final NotificationServiceImpl notificationService;

    //SSE 구독
    @GetMapping(value = "/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe(@AuthenticationPrincipal PrincipalDetails principal) {
        return notificationService.subscribe(principal.getUsername());
    }

    //알림 목록 조회
    @GetMapping
    public ResponseEntity<List<NotificationEntity>> getNotifications(
            @AuthenticationPrincipal PrincipalDetails principal) {
        return ResponseEntity.ok(notificationService.getNotifications(principal.getUsername()));
    }

    //읽지 않은 알림 개수
    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(
            @AuthenticationPrincipal PrincipalDetails principal) {
        return ResponseEntity.ok(notificationService.getUnreadCount(principal.getUsername()));
    }

    //읽음 처리
    @PatchMapping("/{notiId}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Integer notiId) {
        notificationService.markAsRead(notiId);
        return ResponseEntity.ok("읽음 처리 완료");
    }
}
