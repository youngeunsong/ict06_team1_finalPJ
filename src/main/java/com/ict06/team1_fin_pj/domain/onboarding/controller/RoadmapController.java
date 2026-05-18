/**
 * @FileName : RoadmapController.java
 * @Description : AI 온보딩 로드맵 Controller
 *                - 사원별 온보딩 로드맵 조회
 *                - 로드맵이 없는 사원은 기본 로드맵 생성 후 반환
 * @Author : 김다솜
 * @Date : 2026. 05. 02
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.05.02    김다솜        최초 생성 및 사원별 로드맵 조회/생성 API 구현
 */

package com.ict06.team1_fin_pj.domain.onboarding.controller;

import com.ict06.team1_fin_pj.common.dto.onboarding.RoadmapResponse;
import com.ict06.team1_fin_pj.domain.onboarding.service.RoadmapServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/onboarding/roadmap")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class RoadmapController {

    private final RoadmapServiceImpl roadmapService;

    /**
     * @MethodName : getRoadmap
     * @Description : 사번 기준 온보딩 로드맵 조회
     *                - 기존 로드맵이 있으면 DB 데이터 반환
     *                - 기존 로드맵이 없으면 기본 로드맵 생성 후 반환
     *
     * @param empNo 사번
     * @return 온보딩 로드맵 응답 DTO
     */
    @GetMapping("/{empNo}")
    public RoadmapResponse getRoadmap(@PathVariable String empNo) {
        return roadmapService.getOrCreateRoadmap(empNo);
    }

}
