package com.ict06.team1_fin_pj.common.dto;

import lombok.Getter;

@Getter
public enum ApprovalStatus {
    PENDING("대기"),
    IN_PROGRESS("진행"),
    COMPLETED("완료"),
    REJECTED("반려");

    private final String label;

    ApprovalStatus(String label) {
        this.label = label;
    }
}
