package com.ict06.team1_fin_pj.common.dto;

import lombok.Getter;

@Getter
public enum ApproverType {
    USER("개인"),
    DEPT("부서"),
    POSITION("직급");

    private final String label;

    ApproverType(String label) {
        this.label = label;
    }
}
