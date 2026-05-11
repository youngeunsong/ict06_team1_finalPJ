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
 * 2026-05-11   송영은       변수명 변경
 **/
@Getter
@Builder
@AllArgsConstructor
public class AppLineFormTargetDto {

//    private String type;
//    private String targetName;
//    private String targetId;
//    private String departmentName;
//    private Integer positionId;
//    private String positionName;
//    private String empNo;

    // TODO: 위의 코드로 인한 오류 발생 시 아래 코드로 롤백
    private String targetType;
    private String id;
    private String name;
    private String dept;
    private String position;
    private Integer positionId;
    private String type;
}
