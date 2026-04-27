package com.ict06.team1_fin_pj.common.dto;

import lombok.Getter;

@Getter
public enum LeaveStatus {

    APPROVED("승인"),
    PENDING("대기"),
    REJECTED("반려"),
    CANCELED("취소");

    private final String label;
    LeaveStatus(String label) {
        this.label = label;
    }
}
