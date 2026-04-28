package com.ict06.team1_fin_pj.domain.approval.controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

import java.io.IOException;

@RequestMapping("/admin/approval")
@Controller
public class AdApprovalController {

    @RequestMapping("/createTemplate")
    public String createTemplate(HttpServletRequest request, HttpServletResponse response, Model model)
            throws ServletException, IOException {
        return "admin/approval/createTemplate";
    }
}
