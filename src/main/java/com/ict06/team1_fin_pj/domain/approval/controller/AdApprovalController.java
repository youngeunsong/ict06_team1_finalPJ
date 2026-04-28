package com.ict06.team1_fin_pj.domain.approval.controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.io.IOException;
import java.util.Map;

// 관리자용 전자결재 컨트롤러

@RequestMapping("/admin/approval")
@Controller
public class AdApprovalController {

    // 새 서식 추가
    @RequestMapping("/createTemplate")
    public String createTemplate(HttpServletRequest request, HttpServletResponse response, Model model)
            throws ServletException, IOException {
        return "admin/approval/createTemplate";
    }

    //
    @PostMapping("/addTemplate")
    @ResponseBody
    public String addTemplate(@RequestBody Map<String, Object> body) {

        String html = (String) body.get("templateHtml");
        System.out.println(html);

        return "ok";
    }

    @RequestMapping("/viewTestTemplate")
    public String viewTestTemplate(HttpServletRequest request, HttpServletResponse response, Model model)
            throws ServletException, IOException {
        return "admin/approval/viewTestTemplate";
    }
}
