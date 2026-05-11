package com.ict06.team1_fin_pj.common.dto.approval;

import lombok.Getter;
import lombok.Setter;

/**
 * @author : 송영은$
 * description : 전자결재 대상 유형 DTO
 * ========================================
 * DATE         AUTHOR      NOTE
 * 2026-05-06   송영은       최초 생성
 **/
@Getter
@Setter
public class AppFormTargetDto {

    private String id;        // empNo / deptId / positionId
    private String name;

    private String type; // (USER / DEPT / POSITION)
}
