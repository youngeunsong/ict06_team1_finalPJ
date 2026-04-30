/**
 * @FileName : ProgressCompleteRequest.java
 * @Description : AI 온보딩 학습 완료 요청 DTO
 *                프론트에서 전달한 사번(empNo)과 로드맵 아이템 ID(itemId) 담음
 * @Author : 김다솜
 * @Date : 2026. 04. 29
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.29    김다솜        최초 생성/학습 완료 요청 데이터 전달용 DTO 구현
 */

package com.ict06.team1_fin_pj.common.dto.onboarding;

import lombok.Getter;

@Getter
public class ProgressCompleteRequest {
    private String empNo;
    private Integer itemId;
}
