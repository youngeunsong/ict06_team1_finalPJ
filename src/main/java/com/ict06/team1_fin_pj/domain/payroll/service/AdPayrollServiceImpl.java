package com.ict06.team1_fin_pj.domain.payroll.service;


import com.ict06.team1_fin_pj.common.dto.payroll.*;
import com.ict06.team1_fin_pj.domain.employee.entity.DepartmentEntity;
import com.ict06.team1_fin_pj.domain.employee.entity.PositionEntity;
import com.ict06.team1_fin_pj.domain.payroll.entity.GradeCodeEntity;
import com.ict06.team1_fin_pj.domain.payroll.entity.SalaryPolicyEntity;
import com.ict06.team1_fin_pj.domain.payroll.repository.AdSalaryPolicyRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdPayrollServiceImpl implements AdPayrollService {

    private final AdSalaryPolicyRepository adSalaryPolicyRepository;

    // 기본급 정책 목록 조회
    @Override
    @Transactional(readOnly = true)
    public SalaryPolicyPageResponseDTO getSalaryPolicyList(SalaryPolicySearchDTO searchDTO) {
        return adSalaryPolicyRepository.selectSalaryPolicyList(searchDTO);
    }

    // 부서 select box용 목록 조회
    @Override
    @Transactional(readOnly = true)
    public List<PayrollSelectOptionDTO> getDepartmentList() {
        return adSalaryPolicyRepository.selectDepartmentList();
    }

    // 직급 select box용 목록 조회
    @Override
    @Transactional(readOnly = true)
    public List<PayrollSelectOptionDTO> getPositionList() {
        return adSalaryPolicyRepository.selectPositionList();
    }

    // 급여등급 select box용 목록 조회
    @Override
    @Transactional(readOnly = true)
    public List<PayrollSelectOptionDTO> getGradeCodeList() {
        return adSalaryPolicyRepository.selectGradeCodeList();
    }

    @Override
    @Transactional(readOnly = true)
    public SalaryPolicyRegisterCheckResponseDTO checkSalaryPolicyRegisterAvailable(String deptId, String positionId) {

        validateDeptAndPosition(deptId, positionId);

        String gradeId = getGradeIdByPosition(positionId);
        String gradeName = getGradeNameByGradeId(gradeId);

        boolean duplicate = adSalaryPolicyRepository.existsActiveSalaryPolicy(
                deptId,
                positionId,
                gradeId
        );

        String message = duplicate
                ? "이미 해당 부서/직급/등급의 기본급 정책이 등록되어 있습니다."
                : "기본급 등록이 가능합니다.";

        return new SalaryPolicyRegisterCheckResponseDTO(
                gradeId,
                gradeName,
                duplicate,
                message
        );
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isValidGradeOrder(SalaryPolicyRequestDTO requestDTO) {
        validateRequiredForGradeCheck(requestDTO);

        String newGradeId = requestDTO.getGradeId();
        BigDecimal newBasicSalary = requestDTO.getBasicSalary();
        int newGradeRank = getGradeRank(newGradeId);

        List<SalaryPolicyResponseDTO> policyList =
                adSalaryPolicyRepository.selectActivePoliciesByDeptAndPosition(
                        requestDTO.getDeptId(),
                        requestDTO.getPositionId()
                );

        for (SalaryPolicyResponseDTO policy : policyList) {

            if (!StringUtils.hasText(policy.getGradeId()) || policy.getBasicSalary() == null) {
                continue;
            }

            int existingGradeRank = getGradeRank(policy.getGradeId());
            BigDecimal existingBasicSalary = policy.getBasicSalary();

            // 낮은 등급의 기본급은 새로 입력한 기본급보다 작아야 함
            if (existingGradeRank < newGradeRank
                    && newBasicSalary.compareTo(existingBasicSalary) <= 0) {
                return false;
            }

            // 높은 등급의 기본급은 새로 입력한 기본급보다 커야 함
            if (existingGradeRank > newGradeRank
                    && newBasicSalary.compareTo(existingBasicSalary) >= 0) {
                return false;
            }
        }

        return true;
    }

    @Override
    public void registerSalaryPolicy(SalaryPolicyRequestDTO requestDTO) {

        validateRequiredForRegister(requestDTO);

        boolean duplicate = adSalaryPolicyRepository.existsActiveSalaryPolicy(
                requestDTO.getDeptId(),
                requestDTO.getPositionId(),
                requestDTO.getGradeId()
        );

        if (duplicate) {
            throw new IllegalArgumentException("이미 등록된 기본급 정책입니다.");
        }

        if (!isValidGradeOrder(requestDTO)) {
            throw new IllegalArgumentException("기본급은 G1 < G2 < G3 < G4 순서로 입력해야 합니다.");
        }

        DepartmentEntity department = entityManager.getReference(
                DepartmentEntity.class,
                Integer.valueOf(requestDTO.getDeptId())
        );

        PositionEntity position = entityManager.getReference(
                PositionEntity.class,
                Integer.valueOf(requestDTO.getPositionId())
        );

        GradeCodeEntity grade = entityManager.getReference(
                GradeCodeEntity.class,
                requestDTO.getGradeId()
        );

        SalaryPolicyEntity salaryPolicy = SalaryPolicyEntity.builder()
                .department(department)
                .position(position)
                .grade(grade)
                .basicSalary(requestDTO.getBasicSalary())
                .bonusRate(BigDecimal.ZERO)
                .positionAllowance(BigDecimal.ZERO)
                .description(requestDTO.getDescription())
                .isActive(true)
                .build();

        adSalaryPolicyRepository.save(salaryPolicy);
    }

    private void validateDeptAndPosition(String deptId, String positionId) {

        if (!StringUtils.hasText(deptId)) {
            throw new IllegalArgumentException("부서를 선택해 주세요.");
        }

        if (!StringUtils.hasText(positionId)) {
            throw new IllegalArgumentException("직급을 선택해 주세요.");
        }
    }

    private void validateRequiredForGradeCheck(SalaryPolicyRequestDTO requestDTO) {

        if (requestDTO == null) {
            throw new IllegalArgumentException("기본급 정책 정보가 없습니다.");
        }

        validateDeptAndPosition(requestDTO.getDeptId(), requestDTO.getPositionId());

        if (!StringUtils.hasText(requestDTO.getGradeId())) {
            throw new IllegalArgumentException("급여등급 정보가 없습니다.");
        }

        if (requestDTO.getBasicSalary() == null) {
            throw new IllegalArgumentException("기본급을 입력해 주세요.");
        }

        if (requestDTO.getBasicSalary().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("기본급은 0보다 커야 합니다.");
        }
    }

    private void validateRequiredForRegister(SalaryPolicyRequestDTO requestDTO) {
        validateRequiredForGradeCheck(requestDTO);
    }

    private String getGradeIdByPosition(String positionId) {

        String positionName = getPositionList().stream()
                .filter(position -> position.getId().equals(positionId))
                .map(PayrollSelectOptionDTO::getName)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 직급입니다."));

        if (positionName.contains("사원")) {
            return "G1";
        }

        if (positionName.contains("대리")) {
            return "G2";
        }

        if (positionName.contains("팀장")) {
            return "G3";
        }

        if (positionName.contains("관리자") || positionName.contains("인사")) {
            return "G4";
        }

        throw new IllegalArgumentException("직급에 매핑된 급여등급이 없습니다.");
    }

    private String getGradeNameByGradeId(String gradeId) {

        return getGradeCodeList().stream()
                .filter(grade -> grade.getId().equals(gradeId))
                .map(PayrollSelectOptionDTO::getName)
                .findFirst()
                .orElse(gradeId);
    }

    private int getGradeRank(String gradeId) {

        return switch (gradeId) {
            case "G1" -> 1;
            case "G2" -> 2;
            case "G3" -> 3;
            case "G4" -> 4;
            default -> throw new IllegalArgumentException("잘못된 급여등급 코드입니다.");
        };
    }
}
}
