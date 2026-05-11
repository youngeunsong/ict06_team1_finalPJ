package com.ict06.team1_fin_pj.common.dto.approval;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

/**
 * @author : 송영은$
 * description : 전자결재선 추가용 DTO
 * ========================================
 * DATE         AUTHOR      NOTE
 * 2026-05-06   송영은       최초 생성
 **/
@Getter
@Setter
public class AppLineRequestDto {
    private String templateName; // 결재선 서식 이름

    private Boolean isDefault; // 기본 결재선 서식 여부

    private List<ApprovalTargetDto> refTargets;

    private List<ApprovalStepDto> approvalSteps; // 결재 단계
}
