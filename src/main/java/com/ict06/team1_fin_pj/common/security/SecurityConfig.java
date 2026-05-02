/**
 * @FileName : SecurityConfig.java
 * @Description : Spring Security 설정 클래스
 *              - React 사용자 API → JWT 기반 인증 (Stateless)
 *              - 관리자 페이지(Thymeleaf) → 세션 기반 인증 (Form Login)
 *              🔹 보안 구조 분리
 *              1. API (/api/**)
 *                 → JWT 인증
 *                 → 세션 사용 안함
 *              2. 관리자 (/admin/**)
 *                 → 세션 인증
 *                 → Form Login 사용
 *              🔹 목적
 *              - 사용자 API와 관리자 페이지 인증 방식 분리
 *              - API 요청 시 관리자 로그인 페이지로 리다이렉트되는 문제 방지
 * @Author : 김다솜
 * @Date : 2026. 04. 18
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.18    김다솜        최초 생성/SSE 구독, 알림 조회, 읽음 처리 API 구현
 * @ 2026.04.27    송영은        Thymeleaf 기반 관리자 페이지 전용 보안 설정(세션 기반 인증-Form Login 사용)
 * @ 2026.05.01    김다솜        API용 JWT 필터 체인과 관리자용 세션 필터 체인 분리
 */

package com.ict06.team1_fin_pj.common.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
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

    // 1. [React용] REST API 필터 체인
    @Bean
    @Order(1)
    public SecurityFilterChain filterChain(HttpSecurity http)
        throws Exception {
        http
                //1. 기본 보안 설정
                .securityMatcher("/api/**")

                //CORS 설정(corsConfigurationSource를 filterChain에 등록)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                //REST API이므로 CSRF 보안 및 formLogin, basic 비활성화
                .csrf(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)

                //세션 사용 X(JWT 기반)
                .sessionManagement(session ->
                        session.sessionCreationPolicy((SessionCreationPolicy.STATELESS)))

                // URL별 권한 설정
                .authorizeHttpRequests(auth -> auth
                        // 인증 없이 접근 가능한 API
                        .requestMatchers("/api/auth/login").permitAll()

                        // 나머지 API는 JWT 인증 필요
                        .anyRequest().authenticated()
                )

                // JWT 인증 필터 등록
                .addFilterBefore(
                        new JwtAuthenticationFilter(jwtToken),
                        UsernamePasswordAuthenticationFilter.class
                );

//                // 2. 세션 정책: 타임리프 관리자 페이지를 위해 '필요 시 생성'으로 설정
//                // 👉JWT 적용하지만, 타임리프 전용으로 세션 사용 가능하도록 변경
//                .sessionManagement(session ->
//                        session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
//                )

//                // 3. URL별 권한 제어
//                // 👉요청 권한 설정
//                .authorizeHttpRequests(auth -> auth
//                        .requestMatchers("/api/auth/**").permitAll()
//
//                        // [관리자] 관리자 로그인 및 관련 리소스는 허용하되 나머지는 ADMIN 권한 필수
//                        .requestMatchers("/admin/login", "/admin/login-process").permitAll()
//                        .requestMatchers("/admin/**").hasRole("ADMIN")
//
//                        // 👉기타
//                        .anyRequest().permitAll()
//                )
//
//                // 4. 타임리프 관리자용 폼 로그인 설정 (세션 기반)
//                .formLogin(form -> form
//                        .loginPage("/admin/login")                 // 로그인 페이지 URL
//                        .loginProcessingUrl("/admin/login-process")// 로그인 처리 URL
//                        .defaultSuccessUrl("/admin/main", true)    // 로그인 성공 후 이동
//                        .failureUrl("/admin/login?error=true")
//                        .permitAll()
//                )
//
//                // 5. 로그아웃 설정
//                .logout(logout -> logout
//                        .logoutUrl("/admin/logout")
//                        .logoutSuccessUrl("/admin/login")
//                        .invalidateHttpSession(true)
//                        .deleteCookies("JSESSIONID")
//                )


//                // 6. 필터 순서 정의
//                // API 요청 시 헤더에 토큰이 있다면 JWT 필터가 인증 수행
//                //UsernamePasswordAuthenticationFilter 앞에 JWT 인증 필터 추가
//                .addFilterBefore(new JwtAuthenticationFilter(jwtToken),
//                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    @Order(2)
    public SecurityFilterChain adminFilterChain(HttpSecurity http)
        throws Exception {
        http
                // 관리자 페이지 경로에만 이 보안 설정 적용
                .securityMatcher("/admin/**")

                // CSRF 비활성화
                .csrf(AbstractHttpConfigurer::disable)
                // URL별 접근 권한 설정
                .authorizeHttpRequests(auth -> auth
                        // 관리자 로그인 페이지 허용
                        .requestMatchers("/admin/login").permitAll()

                        // 관리자 페이지는 ADMIN 권한 필요
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                )

                // 관리자 로그인 설정(Form Login)
                .formLogin(form -> form
                        .loginPage("/admin/login")      // 로그인 페이지
                        .loginProcessingUrl("/admin/login-process")         // 로그인 처리 URL
                        .defaultSuccessUrl("/admin/home", true)     // 로그인 성공 시
                        .failureUrl("/admin/login?error=true")           // 로그인 실패 시
                        .permitAll()
                )

                // 로그아웃 설정
                .logout(logout -> logout
                        .logoutUrl("/admin/logout")
                        .logoutSuccessUrl("/admin/login")
                        .invalidateHttpSession(true)
                        .deleteCookies("JSESSIONID")
                )

                // 세션 정책
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                );

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