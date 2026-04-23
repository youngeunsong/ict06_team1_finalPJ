package com.ict06.team1_fin_pj.domain.auth.controller;

import com.ict06.team1_fin_pj.common.dto.EmpEntity;
import com.ict06.team1_fin_pj.common.security.PrincipalDetails;
import com.ict06.team1_fin_pj.domain.auth.service.AuthServiceImpl;
import com.ict06.team1_fin_pj.domain.auth.service.EmpServiceImpl;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class EmpController {

    private final EmpServiceImpl empService;

    @GetMapping("/welcome")
    public ResponseEntity<EmpEntity> getWelcomeInfo(Principal principal) {
        //로그인한 계정의 사번 가져오기
        String loginEmpNo = principal.getName();

        EmpEntity emp = empService.getWelcomeInfo(loginEmpNo);
        return ResponseEntity.ok(emp);
    }
}
