/**
 * @FileName : OnContentRequestDto.java
 * @Description : 관리자 온보딩 콘텐츠 등록 및 수정 요청 DTO
 * @Author : 김다솜
 * @Date : 2026. 05. 08
 * @Modification_History
 * @
 * @ 수정일자        수정자       수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.05.08    김다솜        최초 생성
 * @ 2026.05.10    김다솜        콘텐츠 대상 직급/부서 다중 선택 요청값 추가
 */
package com.ict06.team1_fin_pj.common.dto.onboarding;

import com.ict06.team1_fin_pj.domain.onboarding.entity.ContentType;
import com.ict06.team1_fin_pj.domain.onboarding.entity.Difficulty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class OnContentRequestDto {

    private String title;
    private ContentType type;
    private String category;
    private String subCategory;
    private String targetPosition;
    private Difficulty difficulty;
    private Integer estimatedTime;
    private String path;
    private Boolean isMandatory = false;
    private List<Integer> targetPositionIds;
    private List<Integer> targetDepartmentIds;
}
