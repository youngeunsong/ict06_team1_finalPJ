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

        boolean match = passwordEncoder.matches(password, emp.getPassword());
        System.out.println("matches = " + match);

        //2. 비밀번호 해시값 일치 확인(BCrypt 검증)
        if(!match) {
            throw new RuntimeException("사번 또는 비밀번호가 일치하지 않습니다.");
        }

        //3. 권한 명칭 변환(roleId 기준)
        String roleName = switch(emp.getRole().getRoleId()) {
            case 1 -> "ROLE_ADMIN";
            case 2 -> "ROLE_TEAM_LEADER";
            default -> "ROLE_USER";
        };

        //4. JWT 토큰 생성
        String token = jwtTokenProvider.createToken(emp.getEmpNo(), roleName);

        //5. 결과 반환(FE에 전달할 데이터 구성)
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("empNo", emp.getEmpNo());
        response.put("userName", emp.getName());
        response.put("role", roleName);

        return response;
    }
}
