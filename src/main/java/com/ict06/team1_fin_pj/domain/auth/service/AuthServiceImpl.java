/**
 * @FileName : AuthServiceImpl.java
 * @Description : 사원 인증 및 JWT 토큰 발행 서비스
 * @Author : 김다솜
 * @Date : 2026. 04. 17
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.17    김다솜        최초 생성/로그인 로직 추가
 * @ 2026.04.23    김다솜        사번 기반 권한 매핑 로직 보완
 * @ 2026.05.07    김다솜        로그인 시 Refresh Token DB 저장 로직 추가
 */

package com.ict06.team1_fin_pj.domain.auth.service;

import com.ict06.team1_fin_pj.domain.employee.entity.EmpEntity;
import com.ict06.team1_fin_pj.common.security.JwtTokenProvider;
import com.ict06.team1_fin_pj.domain.auth.repository.EmpRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthServiceImpl {

    private final EmpRepository empRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * 로그인 로직 처리
     * * @param empNo: 사번
     * * @param password: 사용자 비밀번호(plain text)
     * * @return: 생성된 JWT 토큰 및 유저 정보가 담긴 Map 객체
     */

    public Map<String, Object> login(String empNo, String password) {
        System.out.println("입력 empNo = " + empNo);
        System.out.println("입력 password = " + password);

        //1. 사번(empNo)으로 사용자 확인
        EmpEntity emp = empRepository.findByEmpNo(empNo)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        System.out.println("DB password = " + emp.getPassword());
        System.out.println("DB password length = " + emp.getPassword().length());


        //2. 비밀번호 검증
        boolean match = passwordEncoder.matches(password, emp.getPassword());
        if(!match) {
            throw new RuntimeException("사번 또는 비밀번호가 일치하지 않습니다.");
        }
        System.out.println("matches = " + match);

        //3. 권한 명칭 변환(roleId 기준)
        String roleName = switch(emp.getRole().getRoleId()) {
            case 1 -> "ROLE_ADMIN";
            case 2 -> "ROLE_TEAM_LEADER";
            default -> "ROLE_USER";
        };

        //4. Access, Refresh 토큰 생성
        String accessToken = jwtTokenProvider.createAccessToken(emp.getEmpNo(), roleName);
        String refreshToken = jwtTokenProvider.createRefreshToken(emp.getEmpNo());

        //5. DB에 RefreshToken 저장(Dirty Checking 이용)
        emp.updateRefreshToken(refreshToken);

        //6. 결과 반환
        Map<String, Object> response = new HashMap<>();
        // 생성된 AccessToken, RefreshToken을 FE로 전송
        response.put("accessToken", accessToken);
        response.put("refreshToken", refreshToken);
        response.put("empNo", emp.getEmpNo());
        response.put("userName", emp.getName());
        response.put("role", roleName);

        return response;
    }

    // RefreshToken 이용한 AccessToken 재발급 로직
    @Transactional
    public Map<String, String> reissue(String empNo, String refreshToken) {
        // 1. 토큰 유효성 검증
        if(!jwtTokenProvider.validateToken(refreshToken)) {
            throw new RuntimeException("만료되거나 유효하지 않은 Refresh Token입니다.");
        }

        // 2. 사원 조회 및 DB에 저장된 토큰과 일치하는지 대조
        EmpEntity emp = empRepository.findByEmpNo(empNo)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        if(emp.getRefreshToken() == null || !emp.getRefreshToken().equals(refreshToken)) {
            throw new RuntimeException("토큰 정보가 일치하지 않습니다. 변조 위험이 있습니다.");
        }

        // 3. 새 Access Token 발급
        String roleName = switch (emp.getRole().getRoleId()) {
            case 1 -> "ROLE_ADMIN";
            case 2 -> "ROLE_TEAM_LEADER";
            default -> "ROLE_USER";
        };
        String newAccessToken = jwtTokenProvider.createAccessToken(emp.getEmpNo(), roleName);

        // Refresh Token Rotation
        Map<String, String> tokenMap = new HashMap<>();
        tokenMap.put("accessToken", newAccessToken);
        return tokenMap;
    }
}
