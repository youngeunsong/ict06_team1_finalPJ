/**
 * @FileName : SecurityConfig.java
 * @Description :
 * @Author : 김다솜
 * @Date : 2026. 04. 18
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.18    김다솜        최초 생성/SSE 구독, 알림 조회, 읽음 처리 API 구현
 */

package com.ict06.team1_fin_pj.common.security;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class TempPassword {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        System.out.println(encoder.encode("1234"));
    }
}
