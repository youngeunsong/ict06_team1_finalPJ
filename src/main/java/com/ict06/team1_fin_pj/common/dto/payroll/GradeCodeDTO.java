package com.ict06.team1_fin_pj.common.dto.payroll;

import lombok.Data;
import lombok.NoArgsConstructor;

// Lombok 어노테이션
// - 아래 기능들을 자동으로 생성해준다:
// 1. Getter 자동 생성
//    → 모든 필드의 getXXX() 메서드 생성
// 2. Setter 자동 생성
//    → 모든 필드의 setXXX() 메서드 생성
// 3. toString() 자동 생성
//    → 객체 출력 시 필드값을 문자열로 보여줌
// 4. equals(), hashCode() 자동 생성
//    → 객체 비교 및 컬렉션 사용 시 필요
// 5. RequiredArgsConstructor 일부 포함
//    → final 필드 기준 생성자 생성
// 주의사항:
// - DTO에서는 사용 가능 (데이터 전달 목적)
// - Entity에서는 사용 금지 (JPA, Lazy Loading, equals 문제 발생 가능)
@Data
@NoArgsConstructor
public class GradeCodeDTO {

    // 급여 등급 코드 (G1, G2, G3...)
    private String gradeId;

    // 급여 등급 이름 (사원, 대리, 과장 등 or 등급 설명)
    private String gradeName;
}
