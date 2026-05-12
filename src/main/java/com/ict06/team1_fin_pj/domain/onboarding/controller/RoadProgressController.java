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
 * @ 2026.05.10    김다솜        로드맵 목록 즉시 반영을 위한 학습 완료 취소 API 추가
 */

package com.ict06.team1_fin_pj.domain.onboarding.controller;

import com.ict06.team1_fin_pj.common.dto.onboarding.ProgressCompleteRequest;
import com.ict06.team1_fin_pj.domain.onboarding.service.RoadProgressServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/onboarding/progress")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class RoadProgressController {

    private final RoadProgressServiceImpl progressService;

    @PostMapping("/complete")
    public void complete(@RequestBody ProgressCompleteRequest request) {

        progressService.completeLearning(
                request.getEmpNo(),
                request.getItemId()
        );
    }

    @PostMapping("/uncomplete")
    public void uncomplete(@RequestBody ProgressCompleteRequest request) {

        progressService.uncompleteLearning(
                request.getEmpNo(),
                request.getItemId()
        );
    }
}
