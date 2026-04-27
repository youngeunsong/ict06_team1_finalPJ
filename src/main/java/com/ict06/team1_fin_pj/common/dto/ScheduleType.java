package com.ict06.team1_fin_pj.common.dto;

import lombok.Getter;

@Getter
public enum ScheduleType {
    PERSONAL("개인"),
    DEPARTMENT("부서"),
    COMPANY("전체");

    private final String label;

    ScheduleType(String label) {
        this.label = label;
    }
}
