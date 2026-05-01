/**
 * @FileName : RoadProgressController.java
 * @Description : AI 온보딩 학습 진행률 Controller
 *                학습 완료 요청을 받아 ROAD_PROGRESS 저장 로직을 호출한다.
 * @Author : 김다솜
 * @Date : 2026. 04. 29
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.29    김다솜        최초 생성/학습 완료 처리 API 구현
 */

package com.ict06.team1_fin_pj.domain.onboarding.controller;

import com.ict06.team1_fin_pj.common.dto.onboarding.ProgressCompleteRequest;
import com.ict06.team1_fin_pj.domain.onboarding.service.RoadProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/onboarding/progress")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class RoadProgressController {

    private final RoadProgressService progressService;

    @PostMapping("/complete")
    public void complete(@RequestBody ProgressCompleteRequest request) {

        progressService.completeLearning(
                request.getEmpNo(),
                request.getItemId()
        );
    }
}
