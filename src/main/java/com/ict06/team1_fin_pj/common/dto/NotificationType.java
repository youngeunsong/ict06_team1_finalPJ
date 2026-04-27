package com.ict06.team1_fin_pj.common.dto;

import lombok.Getter;

@Getter
public enum NotificationType {
    APPROVAL("결재"),
    ATTENDANCE("근태"),
    AI("AI"),
    NOTICE("공지"),
    MYPAGE("정보 수정");

    private final String label;

    NotificationType(String label) {
        this.label = label;
    }
}
