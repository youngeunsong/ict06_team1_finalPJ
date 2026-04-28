package com.ict06.team1_fin_pj.domain.approval.entity;

import lombok.Getter;

@Getter
public enum ApprovalLineStatus {
    WAITING("대기"),
    APPROVED("승인"),
    REJECTED("반려");

    private final String label;

    ApprovalLineStatus(String label) {
        this.label = label;
    }
}
