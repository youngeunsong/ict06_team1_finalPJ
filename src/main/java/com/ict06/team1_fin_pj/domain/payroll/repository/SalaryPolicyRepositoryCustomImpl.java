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
@RequiredArgsConstructor
public class SalaryPolicyRepositoryCustomImpl implements SalaryPolicyRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    public SalaryPolicyPageResponseDTO selectSalaryPolicyList(SalaryPolicySearchDTO searchDTO){

        BooleanBuilder builder = new BooleanBuilder();
        builder.and(salaryPolicyEntity.isActive.isTrue());

        if (searchDTO != null) {

            if (StringUtils.hasText(searchDTO.getDeptId())) {
                builder.and(salaryPolicyEntity.department.deptId.eq(Integer.valueOf(searchDTO.getDeptId())));
            }

            if (StringUtils.hasText(searchDTO.getPositionId())) {
                builder.and(salaryPolicyEntity.position.positionId.eq(Integer.valueOf(searchDTO.getPositionId())));
            }

            if (StringUtils.hasText(searchDTO.getGradeId())) {
                builder.and(salaryPolicyEntity.grade.gradeId.eq(searchDTO.getGradeId()));
            }

            if (StringUtils.hasText(searchDTO.getKeyword())) {
                builder.and(
                        salaryPolicyEntity.department.deptName.containsIgnoreCase(searchDTO.getKeyword())
                                .or(salaryPolicyEntity.position.positionName.containsIgnoreCase(searchDTO.getKeyword()))
                                .or(salaryPolicyEntity.grade.gradeId.containsIgnoreCase(searchDTO.getKeyword()))
                );
            }
        }

        int page = searchDTO != null ? searchDTO.getPage() : 1;
        int size = searchDTO != null ? searchDTO.getSize() : 10;
        page = page < 1 ? 1 : page;
        size = size < 1 ? 10 : size;
        long offset = (long) (page - 1) * size;

        Long countResult = queryFactory
                .select(salaryPolicyEntity.count())
                .from(salaryPolicyEntity)
                .where(builder)
                .fetchOne();

        long totalCount = countResult != null ? countResult : 0;
        int totalPages = (int) Math.ceil((double) totalCount / size);

        List<SalaryPolicyResponseDTO> content = queryFactory
                .select(Projections.fields(
                        SalaryPolicyResponseDTO.class,
                        salaryPolicyEntity.policyId.longValue().as("policyId"),
                        salaryPolicyEntity.department.deptId.stringValue().as("deptId"),
                        salaryPolicyEntity.department.deptName.as("deptName"),
                        salaryPolicyEntity.position.positionId.stringValue().as("positionId"),
                        salaryPolicyEntity.position.positionName.as("positionName"),
                        salaryPolicyEntity.grade.gradeId.as("gradeId"),
                        salaryPolicyEntity.grade.gradeName.as("gradeName"),
                        salaryPolicyEntity.basicSalary,
                        salaryPolicyEntity.bonusRate,
                        salaryPolicyEntity.positionAllowance,
                        salaryPolicyEntity.description,
                        salaryPolicyEntity.isActive,
                        salaryPolicyEntity.createdAt,
                        salaryPolicyEntity.updatedAt
                ))
                .from(salaryPolicyEntity)
                .where(builder)
                .orderBy(salaryPolicyEntity.policyId.desc())
                .offset(offset)
                .limit(size)
                .fetch();

        return new SalaryPolicyPageResponseDTO(content, totalCount, page, size, totalPages);
    }

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
                .fetchFirst();

        return result != null;
    }

    @Override
    public List<SalaryPolicyResponseDTO> selectActivePoliciesByDept(String deptId) {

        return queryFactory
                .select(Projections.fields(
                        SalaryPolicyResponseDTO.class,

                        // 수정 검증에서 "자기 자신 제외"를 위해 반드시 필요
                        salaryPolicyEntity.policyId.longValue().as("policyId"),

                        // 급여등급 (G1, G2, G3, G4)
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

    @Override
    public void deactivateSalaryPolicy(Integer policyId) {

        // 기존 정책을 삭제하지 않고 비활성화 처리
        // 수정 시 "이력 유지"를 위한 핵심 로직
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

