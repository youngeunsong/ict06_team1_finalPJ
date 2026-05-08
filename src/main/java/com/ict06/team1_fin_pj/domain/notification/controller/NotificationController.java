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
 * @ 2026.05.08    김다솜        JWT 필터에서 토큰 검증 후 @AuthenticationPrincipal 사용
 */

package com.ict06.team1_fin_pj.domain.notification.controller;

import com.ict06.team1_fin_pj.domain.notification.entity.NotificationEntity;
import com.ict06.team1_fin_pj.common.security.PrincipalDetails;
import com.ict06.team1_fin_pj.domain.notification.service.NotificationServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequestMapping("/api/noti")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class NotificationController {

    private final NotificationServiceImpl notificationService;

    /**
     * SSE 구독 (실시간 알림 연결)
     * - JWT 필터에서 이미 검증됨
     * - @AuthenticationPrincipal은 검증된 사용자 정보 추출
     */
    @GetMapping(value = "/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe(@AuthenticationPrincipal PrincipalDetails principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }
        System.out.println("[SSE] 구독 요청 - empNo:" + principal.getEmpNo());
        return notificationService.subscribe(principal.getEmpNo());
    }

    //알림 목록 조회
    @GetMapping
    public ResponseEntity<List<NotificationEntity>> getNotifications(
            @AuthenticationPrincipal PrincipalDetails principal) {
        return ResponseEntity.ok(notificationService.getNotifications(principal.getEmpNo()));
    }

    //읽지 않은 알림 개수 조회
    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(
            @AuthenticationPrincipal PrincipalDetails principal) {
        return ResponseEntity.ok(notificationService.getUnreadCount(principal.getEmpNo()));
    }

    //읽음 처리
    @PatchMapping("/{notiId}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Integer notiId) {
        notificationService.markAsRead(notiId);
        return ResponseEntity.ok("읽음 처리 완료");
    }
}
