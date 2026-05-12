/**
 * @FileName : AdminOnboardingScheduleDto.java
 * @Description : 관리자 온보딩 일정 목록 응답 DTO
 * @Author : 김다솜
 * @Date : 2026. 05. 10
 * @Modification_History
 * @
 * @ 수정일자        수정자       수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.05.10    김다솜        최초 생성 및 직원별 로드맵 일정/진행 상태 표시값 추가
 */
package com.ict06.team1_fin_pj.common.dto.onboarding;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class AdminOnboardingScheduleDto {

    private Integer roadmapId;
    private Integer itemId;
    private String empNo;
    private String employeeName;
    private String roadmapTitle;
    private String categoryName;
    private String itemTitle;
    private String contentTitle;
    private LocalDate startDate;
    private LocalDate dueDate;
    private String status;
}
