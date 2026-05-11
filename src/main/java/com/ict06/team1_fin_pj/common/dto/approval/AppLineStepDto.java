package com.ict06.team1_fin_pj.common.dto.approval;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * @author : 송영은$
 * description : 결재선 단계 Dto
 * ========================================
 * DATE         AUTHOR      NOTE
 * 2026-05-07   송영은       최초 생성
 **/
@Getter
@Builder
@AllArgsConstructor
public class AppLineStepDto {

    private Integer stepOrder;
//    private int step; // TODO: 위의 라인으로 인해 오류 발생시 되돌리기

    private List<AppLineTargetDto> targets;
}
