/**
 * @FileName : JwtAuthenticationFilter.java
 * @Description : 모든 요청에서 JWT 토큰 유효성 검사하는 필터
 * @Author : 김다솜
 * @Date : 2026. 04. 18
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.18    김다솜        최초 생성/SSE 구독, 알림 조회, 읽음 처리 API 구현
 * @ 2026.04.23    김다솜        SSE 지원 위한 쿼리 파라미터 토큰 추출 로직 추가
 */

package com.ict06.team1_fin_pj.common.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
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

        HttpServletRequest httpRequest = (HttpServletRequest) request;

        //1. Request Header에서 JWT 토큰 추출
        String token = jwtTokenProvider.resolveToken((HttpServletRequest) request);

        //2. 헤더에 토큰 없는 경우 URL 파라미터("token")에서 추출(SSE 대응)
        if(!StringUtils.hasText(token)) {
            token = httpRequest.getParameter("token");
        }

        //3. 토큰 유효성 검증
        if(token != null && jwtTokenProvider.validateToken(token)) {
            //토큰 유효하면 인증 객체(Authentication) 생성, SecurityContext에 저장
            Authentication authentication = jwtTokenProvider.getAuthentication(token);
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        //4. 다음 필터로 이동
        chain.doFilter(request, response);
    }
}