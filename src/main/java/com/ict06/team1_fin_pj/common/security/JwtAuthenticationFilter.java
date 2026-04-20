package com.ict06.team1_fin_pj.common.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.GenericFilterBean;

import java.io.IOException;

/**
 * 모든 요청에서 JWT 토큰 유효성 검사하는 필터
 * UsernamePasswordAuthenticationFilter 이전에 실행되도록 설정함
 */

@RequiredArgsConstructor
public class JwtAuthenticationFilter extends GenericFilterBean {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        //1. Request Header에서 JWT 토큰 추출
        String token = jwtTokenProvider.resolveToken((HttpServletRequest) request);

        //2. 토큰 유효성 검증
        if(token != null && jwtTokenProvider.validateToken(token)) {
            //토큰 유효하면 인증 객체(Authentication) 생성, SecurityContext에 저장
            Authentication authentication = jwtTokenProvider.getAuthentication(token);
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        //3. 다음 필터로 이동
        chain.doFilter(request, response);
    }
}