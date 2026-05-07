package com.ict06.team1_fin_pj.common.dto.payroll;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class SalaryPolicyPageResponseDTO {

    // 실제 조회된 데이터 목록
    // - 기본급 정책 리스트 (현재 페이지에 해당하는 데이터)
    private List<SalaryPolicyResponseDTO> content;

    // 전체 데이터 개수 (DB 기준)
    // - 페이징 계산에 사용 (전체 몇 건인지)
    private long totalCount;

    // 현재 페이지 번호
    // - 프론트에서 페이지 표시용
    private int page;

    // 한 페이지당 데이터 개수
    // - page size
    private int size;

    // 전체 페이지 수
    // - totalCount / size 계산값
    private int totalPages;
}
