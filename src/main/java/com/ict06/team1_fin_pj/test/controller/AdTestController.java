/**
 * @author : 송영은
 * description : 관리자용 샘플 페이지 전용 컨트롤러.
 * 실제로 필요한 기능이 아니라 타임리프를 이용한 MVC 패턴 구현 이해를 위한 예제 코드입니다.
 * ========================================
 * DATE         AUTHOR      NOTE
 * 2026-04-29   송영은       최초 생성
 **/

package com.ict06.team1_fin_pj.test.controller;

import com.ict06.team1_fin_pj.test.entity.TestEntity;
import com.ict06.team1_fin_pj.test.service.TestServiceImpl;
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

@RequestMapping("/admin/test")
@Controller
public class AdTestController {

    @Autowired
    private TestServiceImpl service;

    // 예제 ) 전자결재 새 서식 추가
    // 새 서식 추가 페이지
    @RequestMapping("/createTemplate")
    public String createTemplate(HttpServletRequest request, HttpServletResponse response, Model model)
            throws ServletException, IOException {
        System.out.println("[AdTestController] - createTemplate()");
        return "admin/test/createTemplate";
    }

    // 서식 저장하기 버튼 클릭 후 DB에 저장
    @PostMapping("/addTemplate")
    @ResponseBody
    public String addTemplate(@RequestBody Map<String, Object> body) {
        System.out.println("[AdTestController] - addTemplate()");

        String templateHtml = (String) body.get("templateHtml");
        System.out.println("formName:" + (String) body.get("formName"));
        System.out.println("templateHtml: " + templateHtml);

        // AppFormEntity 형태로 준비
        TestEntity entity = TestEntity.builder()
                .formName((String) body.get("formName"))
                .template((String) body.get("templateHtml"))
                .build();

        // 서비스에 전달
        service.saveAppForm(entity);
        return "ok";
    }

    //--------------------------------------------------------------------------------------------
    // 템플릿 화면
    @RequestMapping("/template")
    public String template(HttpServletRequest request, HttpServletResponse response, Model model)
            throws ServletException, IOException {
        System.out.println("[AdTestController] - template()");
        return "admin/common/template";
    }

    // 타임리프용 템플릿 공식 예제 연결 페이지 (AdminLTE)
    @RequestMapping("/adminLTE")
    public String test(HttpServletRequest request, HttpServletResponse response, Model model)
            throws ServletException, IOException {
        System.out.println("[AdTestController] - test()");
        return "index"; // 타임리프 템플릿 => resources/templates/index.html
    }

}
