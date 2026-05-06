/**
 * @FileName : ChecklistResponse.java
 * @Description : AI 온보딩 체크리스트 조회 응답 DTO
 *                체크리스트 정보+개인별 완료 상태 화면에 전달
 * @Author : 김다솜
 * @Date : 2026. 04. 29
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.29    김다솜        최초 생성/체크리스트 조회 응답 데이터 구성
 */

package com.ict06.team1_fin_pj.common.dto.onboarding;

import com.ict06.team1_fin_pj.domain.onboarding.entity.ProgressStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ChecklistResponse {

    private Integer checklistId;
    private String title;
    private String category;
    private String description;
    private Boolean isMandatory;
    private Integer orderNo;
    private ProgressStatus status;
    private Integer relatedContentId;
    private String relatedContentTitle;
}