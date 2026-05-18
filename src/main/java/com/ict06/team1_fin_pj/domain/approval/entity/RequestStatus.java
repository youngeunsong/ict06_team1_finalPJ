package com.ict06.team1_fin_pj.domain.approval.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum RequestStatus {
    PENDING("검토 대기"),
    APPROVED("승인 완료"),
    REJECTED("반려"),
    CANCELLED("요청 취소");

    private final String label;
}