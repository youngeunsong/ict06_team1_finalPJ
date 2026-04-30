/**
 * @FileName : ChecklistCompleteRequest.java
 * @Description : AI 온보딩 체크리스트 완료 요청 DTO
 *                프론트에서 전달한 사번과 체크리스트 ID를 담는다.
 * @Author : 김다솜
 * @Date : 2026. 04. 29
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.29    김다솜        최초 생성/체크리스트 완료 요청 데이터 전달용 DTO 구현
 */

package com.ict06.team1_fin_pj.common.dto.onboarding;

import lombok.Getter;

@Getter
public class ChecklistCompleteRequest {

    private String empNo;
    private Integer checklistId;
}
