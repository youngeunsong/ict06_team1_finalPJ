/**
 * @FileName : RoadProgressService.java
 * @Description : AI 온보딩 학습 진행률 Service
 *                학습 완료 요청 시 ROAD_PROGRESS 데이터를 생성하거나 수정
 * @Author : 김다솜
 * @Date : 2026. 04. 29
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.29    김다솜        최초 생성/학습 완료 처리 및 진행률 저장 로직 구현
 */

package com.ict06.team1_fin_pj.domain.onboarding.service;

import com.ict06.team1_fin_pj.domain.onboarding.entity.ProgressStatus;
import com.ict06.team1_fin_pj.domain.auth.repository.EmpRepository;
import com.ict06.team1_fin_pj.domain.employee.entity.EmpEntity;
import com.ict06.team1_fin_pj.domain.onboarding.entity.RoadItemEntity;
import com.ict06.team1_fin_pj.domain.onboarding.entity.RoadProgressEntity;
import com.ict06.team1_fin_pj.domain.onboarding.repository.RoadItemRepository;
import com.ict06.team1_fin_pj.domain.onboarding.repository.RoadProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class RoadProgressService {

    private final RoadProgressRepository progressRepository;
    private final EmpRepository empRepository;
    private final RoadItemRepository itemRepository;

    public void completeLearning(String empNo, Integer itemId) {

        //1. 사원 조회
        EmpEntity emp = empRepository.findByEmpNo(empNo)
                .orElseThrow(() -> new RuntimeException("사원 없음"));

        //2. 아이템 조회
        RoadItemEntity item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("아이템 없음"));

        //3. 기존 진행 데이터 조회
        var existing = progressRepository
                .findByEmployee_EmpNoAndItem_ItemId(empNo, itemId);

        if(existing.isPresent()) {
            //4-1. 있으면 update
            existing.get().updateProgress(
                    ProgressStatus.COMPLETED,
                    BigDecimal.valueOf(100)
            );
        } else {
            //4-2. 없으면 insert
            RoadProgressEntity progress = RoadProgressEntity.builder()
                    .employee(emp)
                    .item(item)
                    .status(ProgressStatus.COMPLETED)
                    .rate(BigDecimal.valueOf(100))
                    .build();

            progressRepository.save(progress);
        }
    }
}
