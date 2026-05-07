package com.ict06.team1_fin_pj.domain.evaluation.entity;

import lombok.Getter;

@Getter
public enum QuestionType {
    MULTIPLE_CHOICE("객관식"),
    SHORT_ANSWER("단답형"),
    ESSAY("서술형");

    private final String label;

    QuestionType(String label) {
        this.label = label;
    }

}