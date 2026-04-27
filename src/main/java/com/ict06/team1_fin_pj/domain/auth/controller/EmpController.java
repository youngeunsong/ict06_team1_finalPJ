/**
 * @FileName : EmpController.java
 * @Description : 사원 정보 조회 및 마이페이지 관리 컨트롤러
 * @Author : 김다솜
 * @Date : 2026. 04. 17
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.17    김다솜        최초 생성/웰컴페이지 정보 조회 추가
 * @ 2026.04.23    김다솜        마이페이지 정보 수정 메서드 추가
 */

package com.ict06.team1_fin_pj.domain.auth.controller;

import com.ict06.team1_fin_pj.domain.employee.entity.EmpEntity;
import com.ict06.team1_fin_pj.common.security.PrincipalDetails;
import com.ict06.team1_fin_pj.domain.auth.service.EmpServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class EmpController {

    private final EmpServiceImpl empService;

    //웰컴페이지 > 로그인 계정 정보 조회
    @GetMapping("/welcome")
    public ResponseEntity<EmpEntity> getWelcomeInfo(Principal principal) {
        String loginEmpNo = principal.getName();

        EmpEntity emp = empService.getWelcomeInfo(loginEmpNo);
        return ResponseEntity.ok(emp);
    }

    //마이페이지 > 정보 수정
    @PutMapping("/update")
    public ResponseEntity<?> updateEmpInfo(
            @AuthenticationPrincipal PrincipalDetails principal,
            @RequestBody EmpEntity emp) {
        String empNo = principal.getUsername();
        empService.updateEmpInfo(empNo, emp.getName(), emp.getEmail(), emp.getPhone());
        return ResponseEntity.ok("수정 완료");
    }
}
