package com.ict06.team1_fin_pj.common.dto.approval;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class ApprovalCreateRequestDto {

    // 사용자가 선택한 결재 양식 ID입니다. 예: 연차 신청서, 조퇴 신청서, 물품구입확인서 등
    private Integer formId;

    // 결재 문서 제목입니다. 목록 화면과 상세 화면에서 대표 제목으로 사용됩니다.
    private String title;

    // 결재 문서 본문입니다. 양식별 입력 항목이 다를 수 있으므로 JSON 문자열로 저장합니다.
    private String content;

    // 사용자가 직접 지정한 실제 결재선입니다. 상신 시에는 최소 1명 이상 필요합니다.
    private List<ApprovalLineRequestDto> approvalLines;
}
