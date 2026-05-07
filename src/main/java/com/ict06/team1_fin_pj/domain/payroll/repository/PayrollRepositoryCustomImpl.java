package com.ict06.team1_fin_pj.domain.payroll.repository;

import com.ict06.team1_fin_pj.common.dto.payroll.*;
import com.ict06.team1_fin_pj.domain.payroll.entity.PayrollStatus;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


import static com.ict06.team1_fin_pj.domain.employee.entity.QEmpEntity.empEntity;
import static com.ict06.team1_fin_pj.domain.employee.entity.QDepartmentEntity.departmentEntity;
import static com.ict06.team1_fin_pj.domain.employee.entity.QPositionEntity.positionEntity;
import static com.ict06.team1_fin_pj.domain.payroll.entity.QGradeCodeEntity.gradeCodeEntity;
import static com.ict06.team1_fin_pj.domain.payroll.entity.QPayrollEntity.payrollEntity;
import static com.ict06.team1_fin_pj.domain.payroll.entity.QSalaryPolicyEntity.salaryPolicyEntity;

// 급여대장 QueryDSL 구현
@Repository
@RequiredArgsConstructor
public class PayrollRepositoryCustomImpl implements PayrollRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    // 사원 검색 autocomplete
    @Override
    public List<PayrollEmployeeSearchResponseDTO> searchEmployees(PayrollEmployeeSearchDTO searchDTO) {

        BooleanBuilder builder = new BooleanBuilder();

        String keyword = searchDTO.getKeyword().trim();

        if ("EMP_NO".equals(searchDTO.getSearchType())) {
            builder.and(empEntity.empNo.contains(keyword));
        }

        if ("NAME".equals(searchDTO.getSearchType())) {
            builder.and(empEntity.name.containsIgnoreCase(keyword));
        }

        builder.and(empEntity.isDeleted.eq("N"));

        var query = queryFactory
                .select(Projections.fields(
                        PayrollEmployeeSearchResponseDTO.class,

                        empEntity.empNo.as("empNo"),
                        empEntity.name.as("empName"),
                        departmentEntity.deptName.as("deptName"),
                        departmentEntity.parentDept.deptName.as("parentDeptName"),
                        positionEntity.positionName.as("positionName"),
                        gradeCodeEntity.gradeId.as("gradeId")
                ))
                .from(empEntity)
                .leftJoin(empEntity.department, departmentEntity)
                .leftJoin(empEntity.position, positionEntity)
                .leftJoin(empEntity.grade, gradeCodeEntity)
                .where(builder)
                .orderBy(empEntity.empNo.asc());

        if (!Boolean.TRUE.equals(searchDTO.getShowAll())) {
            query.limit(searchDTO.getLimit());
        }

        return query.fetch();
    }

    // 사원 인사정보 조회
    @Override
    public Optional<PayrollEmployeeInfoResponseDTO> selectEmployeeInfo(String empNo) {

        PayrollEmployeeInfoResponseDTO result = queryFactory
                .select(Projections.fields(
                        PayrollEmployeeInfoResponseDTO.class,

                        empEntity.empNo.as("empNo"),
                        empEntity.name.as("empName"),
                        departmentEntity.deptName.as("deptName"),
                        departmentEntity.parentDept.deptName.as("parentDeptName"),
                        positionEntity.positionName.as("positionName"),
                        gradeCodeEntity.gradeId.as("gradeId"),
                        gradeCodeEntity.description.as("gradeDescription"),
                        empEntity.hireDate.as("hireDate"),
                        empEntity.status.as("status"),
                        empEntity.bank.as("bank"),
                        empEntity.accountNo.as("accountNo")
                ))
                .from(empEntity)
                .leftJoin(empEntity.department, departmentEntity)
                .leftJoin(empEntity.position, positionEntity)
                .leftJoin(empEntity.grade, gradeCodeEntity)
                .where(
                        empEntity.empNo.eq(empNo),
                        empEntity.isDeleted.eq("N")
                )
                .fetchOne();

        return Optional.ofNullable(result);
    }

    // 급여대장 상태 조회
    @Override
    public Optional<PayrollStatusResponseDTO> selectPayrollStatus(String empNo, String payMonth) {

        PayrollStatusResponseDTO result = queryFactory
                .select(Projections.fields(
                        PayrollStatusResponseDTO.class,

                        payrollEntity.payrollId.longValue().as("payrollId"),
                        payrollEntity.status.stringValue().as("payrollStatus"),
                        payrollEntity.baseSalary.as("baseSalary"),
                        payrollEntity.payDate.stringValue().as("payDate")
                ))
                .from(payrollEntity)
                .where(
                        payrollEntity.employee.empNo.eq(empNo),
                        payrollEntity.payMonth.eq(payMonth)
                )
                .fetchOne();

        if (result == null) {
            return Optional.empty();
        }

        setStatusInfo(result);

        return Optional.of(result);
    }

    // 이전 확정/지급완료 기본급 조회
    @Override
    public Optional<PayrollBaseSalaryResponseDTO> selectRecentConfirmedBaseSalary(String empNo, String payMonth) {

        PayrollBaseSalaryResponseDTO result = queryFactory
                .select(Projections.fields(
                        PayrollBaseSalaryResponseDTO.class,

                        payrollEntity.baseSalary.as("baseSalary"),
                        payrollEntity.grade.gradeId.as("gradeId")
                ))
                .from(payrollEntity)
                .where(
                        payrollEntity.employee.empNo.eq(empNo),
                        payrollEntity.payMonth.lt(payMonth),
                        payrollEntity.status.in(PayrollStatus.CONFIRMED, PayrollStatus.PAID)
                )
                .orderBy(payrollEntity.payMonth.desc())
                .limit(1)
                .fetchOne();

        if (result == null) {
            return Optional.empty();
        }

        result.setSalarySource("RECENT_CONFIRMED");
        result.setPolicyExists(true);
        result.setPolicyChanged(false);
        result.setWarningMessage(null);

        return Optional.of(result);
    }

    // 현재 기본급 정책 조회
    @Override
    public Optional<PayrollBaseSalaryResponseDTO> selectCurrentSalaryPolicyBaseSalary(String empNo) {

        PayrollBaseSalaryResponseDTO result = queryFactory
                .select(Projections.fields(
                        PayrollBaseSalaryResponseDTO.class,

                        salaryPolicyEntity.basicSalary.as("baseSalary"),
                        salaryPolicyEntity.grade.gradeId.as("gradeId")
                ))
                .from(empEntity)
                .join(empEntity.department, departmentEntity)
                .join(empEntity.position, positionEntity)
                .join(empEntity.grade, gradeCodeEntity)
                .join(salaryPolicyEntity).on(
                        salaryPolicyEntity.department.deptId.eq(departmentEntity.deptId),
                        salaryPolicyEntity.position.positionId.eq(positionEntity.positionId),
                        salaryPolicyEntity.grade.gradeId.eq(gradeCodeEntity.gradeId),
                        salaryPolicyEntity.isActive.isTrue()
                )
                .where(
                        empEntity.empNo.eq(empNo),
                        empEntity.isDeleted.eq("N")
                )
                .fetchOne();

        if (result == null) {
            return Optional.empty();
        }

        result.setSalarySource("POLICY");
        result.setPolicyExists(true);
        result.setPolicyChanged(false);
        result.setWarningMessage(null);

        return Optional.of(result);
    }

    // 상태명과 버튼 상태 세팅
    private void setStatusInfo(PayrollStatusResponseDTO result) {

        if ("DRAFT".equals(result.getPayrollStatus())) {
            result.setPayrollStatusName("작성중");
            result.setEditable(true);
            result.setDeletable(true);
            result.setPreviewAvailable(false);
            result.setConfirmAvailable(false);
            result.setPayConfirmAvailable(false);
            result.setResetAvailable(true);
        }

        if ("CONFIRMED".equals(result.getPayrollStatus())) {
            result.setPayrollStatusName("확정");
            result.setEditable(false);
            result.setDeletable(false);
            result.setPreviewAvailable(true);
            result.setConfirmAvailable(false);
            result.setPayConfirmAvailable(true);
            result.setResetAvailable(false);
        }

        if ("PAID".equals(result.getPayrollStatus())) {
            result.setPayrollStatusName("지급완료");
            result.setEditable(false);
            result.setDeletable(false);
            result.setPreviewAvailable(true);
            result.setConfirmAvailable(false);
            result.setPayConfirmAvailable(false);
            result.setResetAvailable(false);
        }
    }
}
