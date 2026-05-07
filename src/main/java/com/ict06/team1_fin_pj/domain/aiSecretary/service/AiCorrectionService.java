package com.ict06.team1_fin_pj.domain.aiSecretary.service;

import com.ict06.team1_fin_pj.common.dto.aiSecretary.CorrectionResponseDto;

public interface AiCorrectionService {

    CorrectionResponseDto correct(String empNo, String text, String mode);
}