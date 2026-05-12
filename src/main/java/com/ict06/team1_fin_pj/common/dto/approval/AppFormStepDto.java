package com.ict06.team1_fin_pj.common.dto.approval;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

/**
 * @author : 송영은$
 * description : 전자결재 단계 DTO
 * ========================================
 * DATE         AUTHOR      NOTE
 * 2026-05-06   송영은       최초 생성
 **/
@Getter
@Setter
public class AppFormStepDto {

    private int step;

    private List<AppFormTargetDto> targets;
}
