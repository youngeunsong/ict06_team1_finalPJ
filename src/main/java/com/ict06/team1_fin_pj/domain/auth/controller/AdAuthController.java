package com.ict06.team1_fin_pj.domain.auth.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/admin")
public class AdAuthController {

    // 관리자 로그인 페이지 (임시)
    // 공통 사이드바 구현을 위해서 임시로 관리자용 로그인 페이지를 구현했습니다. 인증 기능 담당자 분께서 추후 원하시는 대로 수정하셔도 됩니다.
    @GetMapping("/login")
    public String loginPage() {
        return "admin/auth/login";
    }
}
