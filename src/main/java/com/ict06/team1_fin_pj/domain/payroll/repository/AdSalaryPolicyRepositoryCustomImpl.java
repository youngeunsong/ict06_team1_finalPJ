package com.ict06.team1_fin_pj.domain.payroll.repository;

import com.ict06.team1_fin_pj.common.dto.payroll.PayrollSelectOptionDTO;
import com.ict06.team1_fin_pj.common.dto.payroll.SalaryPolicyPageResponseDTO;
import com.ict06.team1_fin_pj.common.dto.payroll.SalaryPolicyResponseDTO;
import com.ict06.team1_fin_pj.common.dto.payroll.SalaryPolicySearchDTO;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;
import com.querydsl.core.types.Projections;

import java.util.List;

import static com.ict06.team1_fin_pj.domain.payroll.entity.QSalaryPolicyEntity.salaryPolicyEntity;
import static com.ict06.team1_fin_pj.domain.employee.entity.QDepartmentEntity.departmentEntity;
import static com.ict06.team1_fin_pj.domain.employee.entity.QPositionEntity.positionEntity;
import static com.ict06.team1_fin_pj.domain.payroll.entity.QGradeCodeEntity.gradeCodeEntity;
@Repository
@RequiredArgsConstructor
public class AdSalaryPolicyRepositoryCustomImpl implements AdSalaryPolicyRepositoryCustom {

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
                                .or(salaryPolicyEntity.grade.gradeName.containsIgnoreCase(searchDTO.getKeyword()))
                                .or(salaryPolicyEntity.description.containsIgnoreCase(searchDTO.getKeyword()))
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
                        gradeCodeEntity.gradeName
                ))
                .from(gradeCodeEntity)
                .where(gradeCodeEntity.isActive.isTrue())
                .fetch();
    }
}

