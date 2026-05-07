/**
 * @FileName : OnboardingController.java
 * @Description : 온보딩 대시보드 Controller
 *                - 사원별 온보딩 학습 및 평가 요약 정보 조회
 * @Author : 김다솜
 * @Date : 2026. 05. 06
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.05.06    김다솜        최초 생성 및 온보딩 대시보드 요약 API 구현
 */

package com.ict06.team1_fin_pj.domain.onboarding.controller;

import com.ict06.team1_fin_pj.common.dto.onboarding.OnboardingDashboardResponse;
import com.ict06.team1_fin_pj.domain.onboarding.service.OnboardingDashboardServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/onboarding/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class OnboardingController {

    private final OnboardingDashboardServiceImpl dashboardService;

    /**
     * @MethodName : getDashboard
     * @Description : 사번 기준 온보딩 대시보드 요약 정보 조회
     *
     * @param empNo 사번
     * @return 온보딩 대시보드 요약 응답 DTO
     */
    @GetMapping("/{empNo}")
    public OnboardingDashboardResponse getDashboard(@PathVariable String empNo) {
        return dashboardService.getDashboard(empNo);
    }
}