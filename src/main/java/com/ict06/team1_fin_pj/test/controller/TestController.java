/**
 * @author : 송영은
 * description : 사용자용 샘플 페이지 전용 컨트롤러.
 * 실제로 필요한 기능이 아니라 리액트를 이용한 MVC 패턴 구현 이해를 위한 예제 코드입니다.
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
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RequestMapping("/test")
@RestController
@CrossOrigin(origins = "http://localhost:3000") // 리액트와 통신을 위해 cross origin 설정 필요
public class TestController {

    @Autowired
    private TestServiceImpl service;

    // 예제) 전자결재 서식 목록 조회
    @GetMapping("/list") // path.js 에서 정의한 것과 동일한 경로명 적용
    public List<TestEntity> appFormsList(HttpServletRequest request, HttpServletResponse response, Model model)
            throws ServletException, IOException {
        System.out.println("[TestController] - appFormsList()");
        return service.listAllAppForms();
    }
}