package com.ict06.team1_fin_pj.common.dto.approval;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/**
 * @author : 송영은$
 * description : 결재선 타겟 Dto
 * ========================================
 * DATE         AUTHOR      NOTE
 * 2026-05-07   송영은       최초 생성
 **/
@Getter
@Builder
@AllArgsConstructor
public class AppLineTargetDto {

    private String type;
    private String targetName;
    private String departmentName;
    private String positionName;
    private String empNo;
    private String targetType;
}
