package com.ict06.team1_fin_pj.domain.aiSecretary.entity;

import lombok.Getter;

@Getter
public enum ProgressStatus {
    NOT_STARTED("미시작"),
    IN_PROGRESS("진행중"),
    COMPLETED("완료");

    private final String label;

    ProgressStatus(String label) {
        this.label = label;
    }
}
