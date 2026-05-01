/**
 * @author : 송영은
 * description : 관리자용 전자결재 컨트롤러
 * ========================================
 * DATE         AUTHOR      NOTE
 * 2026-04-29   송영은       최초 생성
 * 2026-05-01   송영은       결재 서식 생성, 조회 추가
 **/

package com.ict06.team1_fin_pj.domain.approval.controller;

import com.ict06.team1_fin_pj.domain.approval.entity.AppFormEntity;
import com.ict06.team1_fin_pj.domain.approval.service.AdApprovalServiceImpl;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
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

//        String templateHtml = (String) body.get("templateHtml");
        String template = (String) body.get("template");
        System.out.println("formName:" + (String) body.get("formName"));
        System.out.println("template: " + template);

        // AppFormEntity 형태로 준비
        AppFormEntity entity = AppFormEntity.builder()
                .formName((String) body.get("formName"))
                .template(template)
                .build();

        // 서비스에 전달
        service.saveAppForm(entity);
        return "ok";
    }

    // [전자 결재 서식 목록 조회] ----------------------------------------------------------------------------
    // 서식 목록 조회 화면
    @RequestMapping("/templateList")
    public String templateList(HttpServletRequest request, HttpServletResponse response, Model model)
            throws ServletException, IOException {
        System.out.println("[AdApprovalController] - templateList()");
        return "admin/approval/templateList";
    }

    // 페이징 처리된 서식 목록 조회 (Ajax)
    @GetMapping("/getAppForms")
    @ResponseBody
    public Page<AppFormEntity> getAppForms(@RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "10") int size) {
        System.out.println("[AdApprovalController] - getAppForms()");
        return service.getAppFormsWithPaging(page, size);
    }

    // 서식 1건 상세 보기
    @GetMapping("/viewForm/{formId}")
    public String viewForm(@PathVariable int formId, Model model) {
        System.out.println("[AdApprovalController] - viewForm()");

        AppFormEntity form = service.selectAppForm(formId);
        model.addAttribute("form", form);

        return "admin/approval/viewForm"; // thymeleaf 파일
    }

    // 서식 수정
    @GetMapping("/edit/{formId}")
    public String editForm(@PathVariable int formId, Model model) {
        System.out.println("[AdApprovalController] - editForm()");
        AppFormEntity form = service.selectAppForm(formId); //
        model.addAttribute("form", form);
        return "admin/approval/editForm"; // thymeleaf 파일
    }

    // TODO: 현재 테스트용 서식이 어떻게 출력되는 지만 구현. 추후 필요한 버튼 영역 추가 필요
    @RequestMapping("/viewTestTemplate")
    public String viewTestTemplate(HttpServletRequest request, HttpServletResponse response, Model model)
            throws ServletException, IOException {
        System.out.println("[AdApprovalController] - viewTestTemplate()");
        return "admin/approval/viewTestTemplate";
    }

    // [전자 결재 서식 삭제] ----------------------------------------------------------------------------

    // [전자 결재 서식 수정] ----------------------------------------------------------------------------
}
