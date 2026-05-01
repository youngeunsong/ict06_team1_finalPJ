package com.ict06.team1_fin_pj.common.dto.payroll;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class SalaryPolicyPageResponseDTO {

    private List<SalaryPolicyResponseDTO> content;
    private long totalCount;
    private int page;
    private int size;
    private int totalPages;
}
