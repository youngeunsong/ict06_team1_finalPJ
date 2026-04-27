/**
 * @FileName : SseEmitterManager.java
 * @Description : 사원별 SSE 연결(SseEmitter) 객체를 관리하는 컴포넌트
 * @Author : 김다솜
 * @Date : 2026. 04. 23
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.23    김다솜        최초 생성/ConcurrentHashMap 기반 스레드 안전 연결 관리 구현
 */

package com.ict06.team1_fin_pj.domain.notification.sse;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SseEmitterManager {
    //사원별 SSE 연결 저장
    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();

    //연결 추가
    public void add(String empNo, SseEmitter emitter) {
        emitters.put(empNo, emitter);
    }

    //연결 제거
    public void remove(String empNo) {
        emitters.remove(empNo);
    }

    //특정 사원에게 알림 전송
    public void sendToEmp(String empNo, Object data) {
        SseEmitter emitter = emitters.get(empNo);
        if(emitter != null) {
            try {
                emitter.send(SseEmitter.event()
                        .name("notification")
                        .data(data));
            } catch(Exception e) {
                emitters.remove(empNo);
            }
        }
    }
}
