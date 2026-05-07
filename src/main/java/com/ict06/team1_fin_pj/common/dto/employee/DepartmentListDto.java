package com.ict06.team1_fin_pj.common.dto.employee;

import com.ict06.team1_fin_pj.domain.employee.entity.DepartmentEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/*
 * 관리자 부서 관리 목록 DTO
 *
 * 관리자 부서 관리 화면에서 부서 목록을 출력할 때 사용하는 DTO이다.
 *
 * Entity를 화면에 바로 넘기지 않고 DTO로 변환하는 이유:
 * 1. parentDept, children 같은 연관관계 때문에 순환 참조 문제가 발생할 수 있다.
 * 2. 화면에 필요한 값만 전달할 수 있다.
 * 3. 본부/팀 여부 같은 화면 전용 데이터를 추가하기 쉽다.
 * 4. Entity 구조 변경이 화면에 직접 영향을 주지 않도록 하기 위함이다.
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartmentListDto {

    /*
     * 부서 ID
     *
     * DEPARTMENT 테이블의 기본키이다.
     */
    private Integer deptId;

    /*
     * 부서명
     *
     * 예:
     * 개발본부
     * 개발1팀
     * 인사팀
     */
    private String deptName;

    /*
     * 상위 부서 ID
     *
     * 본부라면 null
     * 팀이라면 소속 본부의 deptId
     */
    private Integer parentDeptId;

    /*
     * 상위 부서명
     *
     * 본부라면 null
     * 팀이라면 소속 본부명
     */
    private String parentDeptName;

    /*
     * 부서 유형
     *
     * 화면에서 본부/팀 구분 표시용으로 사용한다.
     *
     * 값:
     * - 본부
     * - 팀
     */
    private String deptType;

    /*
     * 하위 팀 개수
     *
     * 본부 아래에 소속된 팀 개수이다.
     *
     * 예:
     * 개발본부
     * ├─ 개발1팀
     * ├─ 개발2팀
     * └─ 디자인팀
     *
     * → childCount = 3
     *
     * 팀은 하위 부서를 가지지 않으므로 일반적으로 0이다.
     */
    private int childCount;

    /*
     * 소속 사원 수
     *
     * 화면에서 부서별 인원 현황을 표시하기 위해 사용한다.
     *
     * 표시 기준:
     *
     * 1. 팀
     * - 해당 팀에 직접 소속된 사원 수
     *
     * 2. 본부
     * - 해당 본부 아래 모든 팀의 사원 수 합계
     *
     * 예:
     * 개발본부
     * ├─ 개발1팀 (3명)
     * ├─ 개발2팀 (5명)
     * └─ 디자인팀 (2명)
     *
     * → 개발본부 employeeCount = 10
     */
    private long employeeCount;

    /*
     * Entity → DTO 변환 메서드
     *
     * 부서 관리 화면에 필요한 데이터만 DTO로 변환한다.
     *
     * employeeCount는 Repository 조회 결과를 Service에서 계산 후 전달받는다.
     */
    public static DepartmentListDto fromEntity(
            DepartmentEntity entity,
            long employeeCount
    ) {
        /*
         * parentDept가 null이면 본부로 판단한다.
         */
        boolean isHeadquarters = entity.getParentDept() == null;

        return DepartmentListDto.builder()
                .deptId(entity.getDeptId())
                .deptName(entity.getDeptName())

                /*
                 * 본부면 null
                 * 팀이면 상위 본부 ID
                 */
                .parentDeptId(
                        isHeadquarters
                                ? null
                                : entity.getParentDept().getDeptId()
                )

                /*
                 * 본부면 null
                 * 팀이면 상위 본부명
                 */
                .parentDeptName(
                        isHeadquarters
                                ? null
                                : entity.getParentDept().getDeptName()
                )

                /*
                 * 화면 표시용 본부/팀 문자열
                 */
                .deptType(
                        isHeadquarters
                                ? "본부"
                                : "팀"
                )

                /*
                 * 하위 팀 개수
                 *
                 * children이 null일 가능성 방어 처리 포함
                 */
                .childCount(
                        entity.getChildren() == null
                                ? 0
                                : entity.getChildren().size()
                )

                /*
                 * Service에서 계산한 사원 수
                 */
                .employeeCount(employeeCount)

                .build();
    }
}