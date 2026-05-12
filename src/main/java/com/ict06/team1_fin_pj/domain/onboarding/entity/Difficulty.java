package com.ict06.team1_fin_pj.domain.onboarding.entity;

import lombok.Getter;

@Getter
public enum Difficulty {
    EASY("쉬움"),
    MEDIUM("보통"),
    HARD("어려움");

    private final String label;

    Difficulty(String label) {
        this.label = label;
    }
}
