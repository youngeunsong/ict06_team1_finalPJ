package com.ict06.team1_fin_pj.common.dto;

import lombok.Getter;

@Getter
public enum ParticipantStatus {
    ACCEPTED("참석"),
    PENDING("미정"),
    REJECTED("불참");

    private final String label;

    ParticipantStatus(String label) {
        this.label = label;
    }
}
