package com.ict06.team1_fin_pj.common.dto.approval;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * @author : 송영은$
 * description : 결재선 상세 조회용 Dto
 * ========================================
 * DATE         AUTHOR      NOTE
 * 2026-05-07   송영은      최초 생성
 **/
@Getter
@Builder
@AllArgsConstructor
public class AppLineDetailDto {

    private Integer templateId;

    private String templateName;

    private String formName;

    private Boolean isDefault;

//    private String description;

    private List<AppLineStepDto> steps;
}
