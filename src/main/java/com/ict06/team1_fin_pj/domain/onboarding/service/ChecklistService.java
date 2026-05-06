/**
 * @FileName : ChecklistService.java
 * @Description : AI 온보딩 체크리스트 Service
 *                체크리스트 조회 및 완료 처리 로직 담당
 * @Author : 김다솜
 * @Date : 2026. 04. 29
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.29    김다솜        최초 생성/체크리스트 조회 및 완료 처리 로직 구현
 */

package com.ict06.team1_fin_pj.domain.onboarding.service;

import com.ict06.team1_fin_pj.common.dto.onboarding.ChecklistResponse;
import com.ict06.team1_fin_pj.domain.auth.repository.EmpRepository;
import com.ict06.team1_fin_pj.domain.employee.entity.EmpEntity;
import com.ict06.team1_fin_pj.domain.onboarding.entity.ChecklistEntity;
import com.ict06.team1_fin_pj.domain.onboarding.entity.ChecklistProgressEntity;
import com.ict06.team1_fin_pj.domain.onboarding.entity.ProgressStatus;
import com.ict06.team1_fin_pj.domain.onboarding.repository.ChecklistProgressRepository;
import com.ict06.team1_fin_pj.domain.onboarding.repository.ChecklistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static java.time.LocalDateTime.now;

@Service
@RequiredArgsConstructor
public class ChecklistService {

    private final ChecklistRepository checklistRepository;
    private final ChecklistProgressRepository progressRepository;
    private final EmpRepository empRepository;

    //사원별 체크리스트 목록 조회
    public List<ChecklistResponse> getChecklist(String empNo) {
        List<ChecklistEntity> checklist = checklistRepository.findAllByOrderByOrderNoAsc();

        Map<Integer, ChecklistProgressEntity> progressMap =
                progressRepository.findByEmployee_EmpNo(empNo)
                        .stream()
                        .collect(Collectors.toMap(
                                progress -> progress.getChecklist().getChecklistId(),
                                progress -> progress
                        ));

        return checklist.stream()
                .map(item -> {
                    ChecklistProgressEntity progress = progressMap.get(item.getChecklistId());

                    return ChecklistResponse.builder()
                            .checklistId(item.getChecklistId())
                            .title(item.getTitle())
                            .category(item.getCategory())
                            .description(item.getDescription())
                            .isMandatory(item.getIsMandatory())
                            .orderNo(item.getOrderNo())
                            .status(progress != null ? progress.getStatus() : ProgressStatus.NOT_STARTED)
                            //연결된 학습 콘텐츠 정보
                            .relatedContentId(item.getRelatedContent() != null ? item.getRelatedContent().getContentId() : null)
                            .relatedContentTitle(item.getRelatedContent() != null ? item.getRelatedContent().getTitle() : null)
                            .build();
                })
                .collect(Collectors.toList());
    }

    //체크리스트 완료 처리
    public void completeChecklist(String empNo, Integer checklistId) {
        EmpEntity emp = empRepository.findByEmpNo(empNo)
                .orElseThrow(() -> new RuntimeException("사원 없음"));

        ChecklistEntity checklist = checklistRepository.findById(checklistId)
                .orElseThrow(() -> new RuntimeException("체크리스트 없음"));

        var existing = progressRepository
                .findByEmployee_EmpNoAndChecklist_ChecklistId(empNo, checklistId);

        if(existing.isPresent()) {
            existing.get().complete();
        } else {
            ChecklistProgressEntity progress = ChecklistProgressEntity.builder()
                    .employee(emp)
                    .checklist(checklist)
                    .status(ProgressStatus.COMPLETED)
                    .completedAt(now())
                    .build();

            progressRepository.save(progress);
        }
    }

    //체크리스트 미완료 처리
    public void uncompleteChecklist(String empNo, Integer checklistId) {
        var existing = progressRepository
                .findByEmployee_EmpNoAndChecklist_ChecklistId(empNo, checklistId);

        existing.ifPresent(ChecklistProgressEntity::uncomplete);
    }

}
