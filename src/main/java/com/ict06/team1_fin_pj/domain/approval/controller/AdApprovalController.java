package com.ict06.team1_fin_pj.domain.approval.controller;

import com.ict06.team1_fin_pj.domain.approval.entity.AppFormEntity;
import com.ict06.team1_fin_pj.domain.approval.service.AdApprovalServiceImpl;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
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

    @Autowired
    private AdApprovalServiceImpl service;

    // [새 전자 결재 서식 만들기] ----------------------------------------------------------------------------
    // 새 서식 추가 페이지
    @RequestMapping("/createTemplate")
    public String createTemplate(HttpServletRequest request, HttpServletResponse response, Model model)
            throws ServletException, IOException {
        System.out.println("[AdApprovalController] - createTemplate()");
        return "admin/approval/createTemplate";
    }

    // 서식 저장하기 버튼 클릭 후 DB에 저장
    @PostMapping("/addTemplate")
    @ResponseBody
    public String addTemplate(@RequestBody Map<String, Object> body) {
        System.out.println("[AdApprovalController] - addTemplate()");

        String templateHtml = (String) body.get("templateHtml");
        System.out.println("formName:" + (String) body.get("formName"));
        System.out.println("templateHtml: " + templateHtml);

        // AppFormEntity 형태로 준비
        AppFormEntity entity = AppFormEntity.builder()
                .formName((String) body.get("formName"))
                .template((String) body.get("templateHtml"))
                .build();

        // 서비스에 전달
        service.saveAppForm(entity);
        return "ok";
    }

    // [전자 결재 서식 목록 조회] ----------------------------------------------------------------------------
    // 서식 상세 조회
    // TODO: 현재 서식이 어떻게 출력되는 지만 구현. 추후 필요한 버튼 영역 추가 필요
    @RequestMapping("/viewTestTemplate")
    public String viewTestTemplate(HttpServletRequest request, HttpServletResponse response, Model model)
            throws ServletException, IOException {
        System.out.println("[AdApprovalController] - viewTestTemplate()");
        return "admin/approval/viewTestTemplate";
    }

    // [전자 결재 서식 삭제] ----------------------------------------------------------------------------

    // [전자 결재 서식 수정] ----------------------------------------------------------------------------
}
