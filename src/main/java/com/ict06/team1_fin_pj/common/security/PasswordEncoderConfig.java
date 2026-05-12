/**
 * @FileName : PasswordEncoderConfig.java
 * @Description : 비밀번호 암호화를 위한 PasswordEncoder Bean 설정 클래스
 * @Author : 김다솜
 * @Date : 2026. 05. 08
 * @Modification_History
 * @
 * @ 수정일자        수정자       수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.05.08    김다솜        SecurityConfig 순환참조 방지를 위한 BCryptPasswordEncoder Bean 분리
 */

package com.ict06.team1_fin_pj.common.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class PasswordEncoderConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
