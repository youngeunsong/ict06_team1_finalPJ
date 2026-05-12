package com.ict06.team1_fin_pj.common.dto.approval;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * @author : 송영은$
 * description : 결재선 목록 조회를 위한 dto
 * ========================================
 * DATE         AUTHOR      NOTE
 * 2026-05-07   송영은     최초 생성
 **/
@Getter
@Builder
@AllArgsConstructor
public class AppLineFormListDto {

    private Integer templateId;

    private String templateName;

    private String formName;

    private String createdBy;

    private Boolean isDefault;

    private LocalDateTime createdAt;

    // 결재 서식의 결재선 목록 설정 시
    private Integer lineTemplateId;

    private String lineTemplateName;
}
