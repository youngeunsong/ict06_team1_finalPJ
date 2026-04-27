package com.ict06.team1_fin_pj.common.dto;

import lombok.Getter;

@Getter
public enum ProcessStage {
    UPLOAD,
    CHUNK,
    EMBED,
    INDEX,
    APPROVAL,
    REFLECT
}
