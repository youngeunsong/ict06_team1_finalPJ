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

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtTokenProvider jwtToken;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http)
        throws Exception {
        http
                //CORS 설정 적용(corsConfigurationSource를 filterChain에 등록)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                //REST API이므로 CSRF 보안 및 기본 로그인 폼 비활성화
                .csrf(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                //JWT이므로 세션 생성 X(Stateless)
                .sessionManagement(session -> session.sessionCreationPolicy((SessionCreationPolicy.STATELESS)))
                //요청 권한 설정
                .authorizeHttpRequests(auth -> auth
                        //1. 회원가입, 로그인은 허용
                        .requestMatchers("/api/auth/**").permitAll()
                        //2. 날씨 및 뉴스 API 경로 추가
                        .requestMatchers("/api/weather/**").permitAll()
                        .requestMatchers("/api/news/**").permitAll()

                        //그 외 모든 요청은 인증 필요
                        .anyRequest().authenticated()
                )
                //UsernamePasswordAuthenticationFilter 앞에 JWT 인증 필터 추가
                .addFilterBefore(new JwtAuthenticationFilter(jwtToken), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    //프론트(React) -> 백엔드로 CORS(교차 출처 요청) 허용하는 설정
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration corsConfig = new CorsConfiguration();

        //허용할 origin(React 기본포트 3000)
        corsConfig.setAllowedOrigins(List.of("http://localhost:3000"));

        //허용할 HTTP 메서드
        corsConfig.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        //허용할 헤더(Authorization 누락 시 JWT 전송 불가)
        //corsConfig.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Cache-Control"));
        corsConfig.setAllowedHeaders(List.of("*"));

        //자격증명 허용(쿠키, 인증헤더 허용하려면 필수)
        corsConfig.setAllowCredentials(true);

        corsConfig.setExposedHeaders(List.of("Authorization"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        //모든 API 경로(/**)에 대해 위 설정 적용
        source.registerCorsConfiguration("/**", corsConfig);

        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        //비밀번호 암호화 위한 BCrypt 빈 등록
        return new BCryptPasswordEncoder();
    }
}