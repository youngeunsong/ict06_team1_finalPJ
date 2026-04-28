/**
 * @FileName : AuthController.java
 * @Description : 사원 인증(로그인) 처리 컨트롤러
 * @Author : 김다솜
 * @Date : 2026. 04. 16
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.16    김다솜        최초 생성
 * @ 2026.04.17    김다솜        로그인 처리 메서드 추가 (JWT 연동)
 */

package com.ict06.team1_fin_pj.domain.auth.controller;

import com.ict06.team1_fin_pj.domain.auth.service.AuthServiceImpl;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final AuthServiceImpl authService;

    //사번, 비밀번호 받아 로그인 처리
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            //프론트에서 보낸 empNo를 String 형태로 서비스에 전달
            //서비스-security에서 정수로 변환해 DB 조회
            Map<String, Object> result = authService.login(
                    loginRequest.getEmpNo(),
                    loginRequest.getPassword()
            );
            return ResponseEntity.ok(result);
        } catch(RuntimeException e) {
            //로그인 실패 시 400에러+메시지
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    //로그인 요청 데이터 담는 DTO
    @Data
    static class LoginRequest {
        private String empNo;
        private String password;
    }
}
