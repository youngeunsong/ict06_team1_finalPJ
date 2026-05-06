package com.ict06.team1_fin_pj.common.dto.approval;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

/**
 * @author : 송영은$
 * description : 전자결재용 사원 목록 조회 DTO
 * ========================================
 * DATE         AUTHOR      NOTE
 * 2026-05-06   송영은     최초 생성
 **/
@Getter
@AllArgsConstructor
public class ApprovalTargetEmployeeDto {
    private String empNo;
    private String name;
    private String deptName;
    private String positionName;
    private String roleName;
}
