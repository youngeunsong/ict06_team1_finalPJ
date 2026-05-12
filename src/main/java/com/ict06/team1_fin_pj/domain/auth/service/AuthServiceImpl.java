/**
 * @FileName : AuthServiceImpl.java
 * @Description : 계정 인증 및 JWT 토큰 관리 서비스
 * @Author : 김다솜
 * @Date : 2026. 04. 17
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.17    김다솜        최초 생성/로그인 로직 추가
 * @ 2026.04.23    김다솜        사번 기반 권한 매핑 로직 보완
 * @ 2026.05.07    김다솜        로그인 시 Refresh Token DB 저장 로직 추가
 * @ 2026.05.08    김다솜        Spring Security 표준 인증(UserDetailsService) 구현
 *                              인증 PrincipalDetails 반환, 민감 로그인 로그 제거, Refresh Token subject 기반 재발급 검증 적용
 */

package com.ict06.team1_fin_pj.domain.auth.service;

import com.ict06.team1_fin_pj.domain.employee.entity.EmpEntity;
import com.ict06.team1_fin_pj.common.security.JwtTokenProvider;
import com.ict06.team1_fin_pj.common.security.PrincipalDetails;
import com.ict06.team1_fin_pj.domain.auth.repository.EmpRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@Primary
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthServiceImpl implements UserDetailsService {

    private final EmpRepository empRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * 1. Spring Security 표준 메서드 구현 (관리자 페이지 로그인용)
     * @param empNo 사번
     * @return UserDetails (시큐리티 인증 객체)
     */
    @Override
    public UserDetails loadUserByUsername(String empNo) throws UsernameNotFoundException {
        EmpEntity emp = empRepository.findByEmpNo(empNo)
                .orElseThrow(() -> new UsernameNotFoundException("존재하지 않는 사번입니다."));

        // 권한 명칭 변환
        return new PrincipalDetails(emp);
    }

    /**
     * 2. 사용자 로그인 로직 (React API용 JWT 발행)
     * * @param empNo: 사번
     * * @param password: 사용자 비밀번호(plain text)
     * * @return: 생성된 JWT 토큰 및 유저 정보가 담긴 Map 객체
     */

    @Transactional
    public Map<String, Object> login(String empNo, String password) {
        // 사번(empNo)으로 사용자 확인
        EmpEntity emp = empRepository.findByEmpNo(empNo)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 비밀번호 검증
        boolean match = passwordEncoder.matches(password, emp.getPassword());
        if(!match) {
            throw new RuntimeException("사번 또는 비밀번호가 일치하지 않습니다.");
        }

        // 권한 명칭 생성
        String roleName = getRoleName(emp.getRole().getRoleId());

        // Access, Refresh 토큰 생성 및 DB 저장 (Dirty Checking)
        String accessToken = jwtTokenProvider.createAccessToken(emp.getEmpNo(), roleName);
        String refreshToken = jwtTokenProvider.createRefreshToken(emp.getEmpNo());
        emp.updateRefreshToken(refreshToken);

        // 응답 데이터 구성
        Map<String, Object> response = new HashMap<>();
        response.put("accessToken", accessToken);
        response.put("refreshToken", refreshToken);
        response.put("empNo", emp.getEmpNo());
        response.put("userName", emp.getName());
        response.put("role", roleName);

        return response;
    }

    /**
     * 3. Refresh Token을 이용한 Access Token 재발급
     */
    @Transactional
    public Map<String, String> reissue(String refreshToken) {
        // 토큰 유효성 검증
        if(!jwtTokenProvider.validateToken(refreshToken)) {
            throw new RuntimeException("만료되거나 유효하지 않은 Refresh Token입니다.");
        }

        String empNo = jwtTokenProvider.getEmpNo(refreshToken);

        // 사원 조회 및 DB에 저장된 토큰과 일치하는지 대조
        EmpEntity emp = empRepository.findByEmpNo(empNo)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        if(emp.getRefreshToken() == null || !emp.getRefreshToken().equals(refreshToken)) {
            throw new RuntimeException("토큰 정보가 일치하지 않습니다. 변조 위험이 있습니다.");
        }

        // 새 Access Token 발급
        String roleName = getRoleName(emp.getRole().getRoleId());
        String newAccessToken = jwtTokenProvider.createAccessToken(emp.getEmpNo(), roleName);

        // Refresh Token Rotation
        Map<String, String> tokenMap = new HashMap<>();
        tokenMap.put("accessToken", newAccessToken);
        return tokenMap;
    }

    @Transactional
    public Map<String, String> reissue(String empNo, String refreshToken) {
        return reissue(refreshToken);
    }

    // 권한 명칭 변환 공통 로직
    private String getRoleName(int roleId) {
        return switch (roleId) {
            case 1 -> "ROLE_ADMIN";
            case 2 -> "ROLE_TEAM_LEADER";
            default -> "ROLE_USER";
        };
    }
}
