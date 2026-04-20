package com.ict06.team1_fin_pj.test.controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

import java.io.IOException;

@Controller
public class TestController {

    @RequestMapping("/test")
    public String test(HttpServletRequest request, HttpServletResponse response, Model model)
        throws ServletException, IOException {

        return "index"; // 타임리프 템플릿 => resources/templates/index.html
    }
}
