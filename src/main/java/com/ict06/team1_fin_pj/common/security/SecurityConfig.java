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

//                //JWT이므로 세션 생성 X(Stateless)
//                .sessionManagement(session -> session.sessionCreationPolicy((SessionCreationPolicy.STATELESS)))

                // 👉JWT 적용하지만, 타임리프 전용으로 세션 사용 가능하도록 변경
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                )

                // 👉요청 권한 설정
                .authorizeHttpRequests(auth -> auth
                        //1. 회원가입, 로그인은 허용
                        .requestMatchers("/api/auth/**").permitAll()
                        //2. 날씨 및 뉴스 API 경로 추가
                        .requestMatchers("/api/weather/**").permitAll()
                        .requestMatchers("/api/news/**").permitAll()

                        // 👉3. 관리자 페이지 (세션 로그인)
                        .requestMatchers("/admin/login", "/admin/login-process").permitAll()
                        .requestMatchers("/admin/**").hasRole("ADMIN")

//                        //그 외 모든 요청은 인증 필요
//                        .anyRequest().authenticated()

                        // 👉기타
                        .anyRequest().permitAll()
                )

                // 👉 관리자 로그인 (세션 기반)
                .formLogin(form -> form
                        .loginPage("/admin/login")                 // 로그인 페이지 URL
                        .loginProcessingUrl("/admin/login-process")// 로그인 처리 URL
                        .defaultSuccessUrl("/admin/main", true)    // 로그인 성공 후 이동
                        .failureUrl("/admin/login?error=true")
                        .permitAll()
                )

                // 👉 로그아웃
                .logout(logout -> logout
                        .logoutUrl("/admin/logout")
                        .logoutSuccessUrl("/admin/login")
                )


                //UsernamePasswordAuthenticationFilter 앞에 JWT 인증 필터 추가
                .addFilterBefore(new JwtAuthenticationFilter(jwtToken),
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    //프론트(React) -> 백엔드로 CORS(교차 출처 요청) 허용하는 설정
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration corsConfig = new CorsConfiguration();

        //허용할 origin(React 기본포트 3000)
        corsConfig.setAllowedOrigins(List.of("http://localhost:3000"));

        //허용할 HTTP 메서드
        corsConfig.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        //허용할 헤더(Authorization 누락 시 JWT 전송 불가)
        corsConfig.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Cache-Control"));

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