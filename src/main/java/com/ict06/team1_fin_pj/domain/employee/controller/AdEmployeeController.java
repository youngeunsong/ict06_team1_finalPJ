/**
 * @author : 송영은
 * description : 관리자용 인사 관리 컨트롤러
 * ========================================
 * DATE         AUTHOR      NOTE
 * 2026-04-24   송영은       최초 생성
 **/

package com.ict06.team1_fin_pj.domain.employee.controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

import java.io.IOException;

@RequestMapping("/admin/employee")
@Controller
public class AdEmployeeController {

    // [인사 관리 메인]
    @RequestMapping("/main")
    public String employeeMain(HttpServletRequest request, HttpServletResponse response, Model model)
            throws ServletException, IOException {
        System.out.println("[AdEmployeeController] - employeeMain()");
        return "admin/employee/employeeMain";
    }

}
