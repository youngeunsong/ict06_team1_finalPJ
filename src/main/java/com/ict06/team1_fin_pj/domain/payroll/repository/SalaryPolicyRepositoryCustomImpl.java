package com.ict06.team1_fin_pj.domain.payroll.repository;

import com.ict06.team1_fin_pj.common.dto.payroll.PayrollSelectOptionDTO;
import com.ict06.team1_fin_pj.common.dto.payroll.SalaryPolicyPageResponseDTO;
import com.ict06.team1_fin_pj.common.dto.payroll.SalaryPolicyResponseDTO;
import com.ict06.team1_fin_pj.common.dto.payroll.SalaryPolicySearchDTO;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static com.ict06.team1_fin_pj.domain.employee.entity.QDepartmentEntity.departmentEntity;
import static com.ict06.team1_fin_pj.domain.employee.entity.QPositionEntity.positionEntity;
import static com.ict06.team1_fin_pj.domain.payroll.entity.QGradeCodeEntity.gradeCodeEntity;
import static com.ict06.team1_fin_pj.domain.payroll.entity.QSalaryPolicyEntity.salaryPolicyEntity;

@Repository
@RequiredArgsConstructor // final 필드 생성자 주입
public class SalaryPolicyRepositoryCustomImpl implements SalaryPolicyRepositoryCustom {


    // QueryDSL 핵심 객체
    // - SQL을 Java 코드로 작성하게 해주는 도구
    private final JPAQueryFactory queryFactory;

    // 기본급 정책 목록 조회 메서드
    // - 관리자 메인 화면에서 사용하는 핵심 조회 로직
    @Override
    public SalaryPolicyPageResponseDTO selectSalaryPolicyList(SalaryPolicySearchDTO searchDTO){

        // 동적 WHERE 조건 생성
        BooleanBuilder builder = new BooleanBuilder();

        // 기본 조건: 활성 데이터만 조회
        builder.and(salaryPolicyEntity.isActive.isTrue());

        // 검색 조건이 있을 경우에만 추가
        if (searchDTO != null) {

            // 부서 필터
            if (StringUtils.hasText(searchDTO.getDeptId())) {
                builder.and(salaryPolicyEntity.department.deptId.eq(Integer.valueOf(searchDTO.getDeptId())));
            }

            // 직급 필터
            if (StringUtils.hasText(searchDTO.getPositionId())) {
                builder.and(salaryPolicyEntity.position.positionId.eq(Integer.valueOf(searchDTO.getPositionId())));
            }

            // 급여등급 필터 (G1 ~ G5)
            if (StringUtils.hasText(searchDTO.getGradeId())) {
                builder.and(salaryPolicyEntity.grade.gradeId.eq(searchDTO.getGradeId()));
            }

            // 키워드 검색 (부서명 OR 직급명 OR 등급코드)
            if (StringUtils.hasText(searchDTO.getKeyword())) {
                builder.and(
                        salaryPolicyEntity.department.deptName.containsIgnoreCase(searchDTO.getKeyword())
                                .or(salaryPolicyEntity.position.positionName.containsIgnoreCase(searchDTO.getKeyword()))
                                .or(salaryPolicyEntity.grade.gradeId.containsIgnoreCase(searchDTO.getKeyword()))
                );
            }
        }

        // 페이징 계산
        int page = searchDTO != null ? searchDTO.getPage() : 1;
        int size = searchDTO != null ? searchDTO.getSize() : 10;

        // 최소값 보정
        page = page < 1 ? 1 : page;
        size = size < 1 ? 10 : size;

        // offset 계산 (SQL offset)
        long offset = (long) (page - 1) * size;

        // 전체 개수 조회 (count)
        Long countResult = queryFactory
                .select(salaryPolicyEntity.count())
                .from(salaryPolicyEntity)
                .where(builder)
                .fetchOne();

        long totalCount = countResult != null ? countResult : 0;

        // 총 페이지 수 계산
        int totalPages = (int) Math.ceil((double) totalCount / size);

        // 실제 데이터 조회
        List<SalaryPolicyResponseDTO> content = queryFactory
                .select(Projections.fields(
                        SalaryPolicyResponseDTO.class,

                        // 정책 ID
                        salaryPolicyEntity.policyId.longValue().as("policyId"),

                        // 부서
                        salaryPolicyEntity.department.deptId.stringValue().as("deptId"),
                        salaryPolicyEntity.department.deptName.as("deptName"),

                        // 직급
                        salaryPolicyEntity.position.positionId.stringValue().as("positionId"),
                        salaryPolicyEntity.position.positionName.as("positionName"),

                        // 급여등급
                        salaryPolicyEntity.grade.gradeId.as("gradeId"),
                        salaryPolicyEntity.grade.gradeName.as("gradeName"),

                        // 급여 정보
                        salaryPolicyEntity.basicSalary,
                        salaryPolicyEntity.bonusRate,
                        salaryPolicyEntity.positionAllowance,

                        // 기타
                        salaryPolicyEntity.description,
                        salaryPolicyEntity.isActive,
                        salaryPolicyEntity.createdAt,
                        salaryPolicyEntity.updatedAt
                ))
                .from(salaryPolicyEntity)
                .where(builder) // 동적 조건 적용
                .orderBy(salaryPolicyEntity.policyId.desc()) // 최신순
                .offset(offset) // 페이징 시작 위치
                .limit(size) // 페이지 크기
                .fetch();

        return new SalaryPolicyPageResponseDTO(content, totalCount, page, size, totalPages);
    }

    // select box용 조회 (부서)
    @Override
    public List<PayrollSelectOptionDTO> selectDepartmentList() {
        return queryFactory
                .select(Projections.constructor(
                        PayrollSelectOptionDTO.class,
                        departmentEntity.deptId.stringValue(),
                        departmentEntity.deptName
                ))
                .from(departmentEntity)
                .fetch();
    }

    // select box용 조회 (직급)
    @Override
    public List<PayrollSelectOptionDTO> selectPositionList() {
        return queryFactory
                .select(Projections.constructor(
                        PayrollSelectOptionDTO.class,
                        positionEntity.positionId.stringValue(),
                        positionEntity.positionName
                ))
                .from(positionEntity)
                .fetch();
    }

    // select box용 조회 (급여등급 G1~G5)
    @Override
    public List<PayrollSelectOptionDTO> selectGradeCodeList() {
        return queryFactory
                .select(Projections.constructor(
                        PayrollSelectOptionDTO.class,
                        gradeCodeEntity.gradeId,
                        gradeCodeEntity.gradeName,
                        gradeCodeEntity.description
                ))
                .from(gradeCodeEntity)
                .where(gradeCodeEntity.isActive.isTrue())
                .fetch();
    }

    // 중복 체크 (EXISTS)
    @Override
    public boolean existsActiveSalaryPolicy(String deptId, String positionId, String gradeId) {

        Integer result = queryFactory
                .selectOne()
                .from(salaryPolicyEntity)
                .where(
                        salaryPolicyEntity.department.deptId.eq(Integer.valueOf(deptId)),
                        salaryPolicyEntity.position.positionId.eq(Integer.valueOf(positionId)),
                        salaryPolicyEntity.grade.gradeId.eq(gradeId),
                        salaryPolicyEntity.isActive.isTrue()
                )
                .fetchFirst(); // 첫 결과만 가져옴 (exists 최적화)

        return result != null;
    }

    // 서열 검증용 조회
    @Override
    public List<SalaryPolicyResponseDTO> selectActivePoliciesByDept(String deptId) {

        return queryFactory
                .select(Projections.fields(
                        SalaryPolicyResponseDTO.class,

                        // 수정 검증에서 "자기 자신 제외"를 위해 반드시 필요
                        salaryPolicyEntity.policyId.longValue().as("policyId"),

                        // 급여등급 (G1, G2, G3, G4, G5)
                        salaryPolicyEntity.grade.gradeId.as("gradeId"),

                        // 기본급 (서열 비교 대상)
                        salaryPolicyEntity.basicSalary
                ))
                .from(salaryPolicyEntity)
                .where(
                        // 같은 부서 기준으로만 서열 비교
                        salaryPolicyEntity.department.deptId.eq(Integer.valueOf(deptId)),

                        // 활성화된 정책만 조회 (수정 시 이전 데이터 제외)
                        salaryPolicyEntity.isActive.isTrue()
                )
                .fetch();
    }

    // 수정 모달 단건 조회
    @Override
    public Optional<SalaryPolicyResponseDTO> selectSalaryPolicyDetail(Long policyId) {

        // 수정 모달에서 사용할 "단건 상세 조회"
        SalaryPolicyResponseDTO result = queryFactory
                .select(Projections.fields(
                        SalaryPolicyResponseDTO.class,

                        // 정책 PK
                        salaryPolicyEntity.policyId.longValue().as("policyId"),

                        // 부서 정보
                        salaryPolicyEntity.department.deptId.stringValue().as("deptId"),
                        salaryPolicyEntity.department.deptName.as("deptName"),

                        // 직급 정보
                        salaryPolicyEntity.position.positionId.stringValue().as("positionId"),
                        salaryPolicyEntity.position.positionName.as("positionName"),

                        // 급여등급
                        salaryPolicyEntity.grade.gradeId.as("gradeId"),
                        salaryPolicyEntity.grade.gradeName.as("gradeName"),

                        // 수정 모달에서 급여등급 설명을 표시하기 위한 값
                        salaryPolicyEntity.grade.description.as("gradeDescription"),

                        // 급여 정보
                        salaryPolicyEntity.basicSalary,
                        salaryPolicyEntity.bonusRate,
                        salaryPolicyEntity.positionAllowance,

                        // 기타
                        salaryPolicyEntity.description,
                        salaryPolicyEntity.isActive,

                        // 생성/수정일
                        salaryPolicyEntity.createdAt,
                        salaryPolicyEntity.updatedAt
                ))
                .from(salaryPolicyEntity)
                .where(
                        // PK 기준 조회
                        salaryPolicyEntity.policyId.eq(policyId.intValue()),

                        // 활성 데이터만 조회 (삭제/수정 이력 제외)
                        salaryPolicyEntity.isActive.isTrue()
                )
                .fetchOne();
        // 결과 없으면 Optional.empty()
        return Optional.ofNullable(result);
    }

    // 수정 (QueryDSL UPDATE)
    @Override
    public void updateSalaryPolicy(Integer policyId, BigDecimal basicSalary) {

        // 기본급 정책 수정
        // 엔티티 수정 금지 원칙 때문에 setter/dirty checking 대신 QueryDSL UPDATE 사용
        queryFactory
                .update(salaryPolicyEntity)
                .set(salaryPolicyEntity.basicSalary, basicSalary)
                .where(salaryPolicyEntity.policyId.eq(policyId))
                .execute();
    }

    // 비활성화 (Soft Delete)
    @Override
    public void deactivateSalaryPolicy(Integer policyId) {

        // 기존 정책을 삭제하지 않고 비활성화 처리 - 수정 시 "이력 유지"를 위한 핵심 로직
        queryFactory
                .update(salaryPolicyEntity)

                // isActive = false로 변경
                .set(salaryPolicyEntity.isActive, false)

                // 해당 정책만 변경
                .where(salaryPolicyEntity.policyId.eq(policyId))

                // DB 반영
                .execute();
    }
}

