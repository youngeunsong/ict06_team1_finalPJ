package com.ict06.team1_fin_pj.common.dto.payroll;


import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SalaryPolicyRegisterCheckResponseDTO {

    // 자동으로 결정된 급여등급 코드
    // - 예: G1, G2, G3, G4, G5
    private String gradeId;

    // 급여등급 이름 (사용자에게 보여줄 값)
    // - 예: 사원, 주임, 선임, 책임, 수석
    private String gradeName;

    // 중복 여부
    // - true  : 이미 동일한 부서/직급/등급 정책 존재 (등록 불가)
    // - false : 등록 가능
    private boolean duplicate;

    // 사용자에게 보여줄 메시지
    // - 예: "이미 존재합니다", "등록 가능합니다"
    // - 프론트 alert 또는 UI 표시용
    private String message;

    // 급여등급 설명
    // - GRADE_CODE.description 값
    // - 등록 화면에서 추가 설명 표시용
    private String description;
}
