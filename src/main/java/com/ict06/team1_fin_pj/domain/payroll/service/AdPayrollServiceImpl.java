package com.ict06.team1_fin_pj.domain.payroll.service;

import com.ict06.team1_fin_pj.common.dto.payroll.*;
import com.ict06.team1_fin_pj.domain.employee.entity.DepartmentEntity;
import com.ict06.team1_fin_pj.domain.employee.entity.PositionEntity;
import com.ict06.team1_fin_pj.domain.payroll.entity.GradeCodeEntity;
import com.ict06.team1_fin_pj.domain.payroll.entity.SalaryPolicyEntity;
import com.ict06.team1_fin_pj.domain.payroll.repository.AdSalaryPolicyRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
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

    @PersistenceContext
    private EntityManager entityManager;

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

        // 1. 필수값 검증
        validateDeptAndPosition(deptId, positionId);

        // 2. 직급 기준으로 급여등급 결정
        String gradeId = getGradeIdByPosition(positionId);
        String gradeName = getGradeNameByGradeId(gradeId);
        String description = getGradeDescriptionByGradeId(gradeId);

        // 3. 중복 여부 확인
        boolean duplicate = adSalaryPolicyRepository.existsActiveSalaryPolicy(
                deptId,
                positionId,
                gradeId
        );

        // 4. 결과 메시지 생성
        String message;
        if (duplicate) {
            message = "이미 해당 부서/직급의 기본급 정책이 존재합니다.";
        } else {
            message = "기본급 등록이 가능합니다.";
        }

        // 5. 결과 반환
        return new SalaryPolicyRegisterCheckResponseDTO(
                gradeId,
                gradeName,
                duplicate,
                message,
                description
        );
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isValidGradeOrder(SalaryPolicyRequestDTO requestDTO) {

        // 1. 기본값 검증
        validateRequiredForGradeCheck(requestDTO);

        String inputGradeId = requestDTO.getGradeId();
        BigDecimal inputBasicSalary = requestDTO.getBasicSalary();

        int inputGradeRank = getGradeRank(inputGradeId);

        // 2. 같은 부서에 등록된 기존 기본급 정책 조회
        List<SalaryPolicyResponseDTO> policyList =
                adSalaryPolicyRepository.selectActivePoliciesByDept(
                        requestDTO.getDeptId()
                );

        // 3. 기존 정책들과 기본급 순서 비교
        for (SalaryPolicyResponseDTO policy : policyList) {

            String savedGradeId = policy.getGradeId();
            BigDecimal savedBasicSalary = policy.getBasicSalary();

            if (!StringUtils.hasText(savedGradeId)) {
                continue;
            }

            if (savedBasicSalary == null) {
                continue;
            }

            int savedGradeRank = getGradeRank(savedGradeId);

            // 기존 등급이 입력 등급보다 낮으면, 입력 기본급은 기존 기본급보다 커야 한다.
            if (savedGradeRank < inputGradeRank) {
                if (inputBasicSalary.compareTo(savedBasicSalary) <= 0) {
                    return false;
                }
            }

            // 기존 등급이 입력 등급보다 높으면, 입력 기본급은 기존 기본급보다 작아야 한다.
            if (savedGradeRank > inputGradeRank) {
                if (inputBasicSalary.compareTo(savedBasicSalary) >= 0) {
                    return false;
                }
            }
        }

        return true;
    }

    @Override
    @Transactional
    public void registerSalaryPolicy(SalaryPolicyRequestDTO requestDTO) {

        // 1. requestDTO 자체가 null인지 먼저 확인
        if (requestDTO == null) {
            throw new IllegalArgumentException("기본급 정책 정보가 없습니다.");
        }

        // 2. 부서와 직급은 먼저 검증
        validateDeptAndPosition(requestDTO.getDeptId(), requestDTO.getPositionId());

        // 3. 직급 기준으로 급여등급 자동 설정 - 프론트에서 gradeId를 보내더라도 백단에서 다시 결정한다.
        String gradeId = getGradeIdByPosition(requestDTO.getPositionId());
        requestDTO.setGradeId(gradeId);

        // 4. 기본급, 급여등급까지 포함해서 등록값 최종 검증
        validateRequiredForRegister(requestDTO);

        // 5. 같은 부서 + 직급 + 등급 정책이 이미 있는지 확인
        boolean duplicate = adSalaryPolicyRepository.existsActiveSalaryPolicy(
                requestDTO.getDeptId(),
                requestDTO.getPositionId(),
                requestDTO.getGradeId()
        );

        if (duplicate) {
            throw new IllegalArgumentException("이미 등록된 기본급 정책입니다.");
        }

        // 6. 같은 부서 기준으로 G1 < G2 < G3 < G4 < G5 순서 검증
        boolean isValidOrder = isValidGradeOrder(requestDTO);

        if (!isValidOrder) {
            throw new IllegalArgumentException("기본급은 G1 < G2 < G3 < G4 < G5 순서로 입력해야 합니다.");
        }

        // 7. FK 연관 엔티티 참조
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

        // 8. 저장할 기본급 정책 엔티티 생성
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

        // 9. DB 저장
        adSalaryPolicyRepository.save(salaryPolicy);
    }

    @Override
    @Transactional(readOnly = true)
    public SalaryPolicyResponseDTO getSalaryPolicyDetail(Long policyId) {

        // 1. 정책 ID가 없는 경우 조회 자체가 불가능하므로 사전 검증 - 잘못된 요청을 초기에 차단
        if (policyId == null) {
            throw new IllegalArgumentException("정책 ID가 없습니다.");
        }

        // 2. Repository(QueryDSL)를 통해 해당 정책의 상세 정보를 조회
        //    - Entity가 아닌 DTO로 바로 반환받는다
        //    - isActive = true 조건이 내부에 포함되어 있어야 정상 데이터만 조회됨
        //    - 조회 결과가 없으면 Optional.empty() 반환

        // 3. 조회 결과가 없는 경우 예외 처리
        //    - 이미 비활성화된 정책이거나 존재하지 않는 정책일 수 있음

        return adSalaryPolicyRepository.selectSalaryPolicyDetail(policyId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 기본급 정책입니다."));
    }

    @Override
    @Transactional
    public void updateSalaryPolicy(SalaryPolicyRequestDTO requestDTO) {

        // 1. 필수값 체크
        if (requestDTO == null || requestDTO.getPolicyId() == null) {
            throw new IllegalArgumentException("수정할 정책 정보가 없습니다.");
        }

        // 2. 기존 정책 조회
        SalaryPolicyEntity oldPolicy = adSalaryPolicyRepository.findById(requestDTO.getPolicyId().intValue())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 기본급 정책입니다."));

        // 3. 부서/직급/등급은 그대로 유지 (수정 불가)
        requestDTO.setDeptId(oldPolicy.getDepartment().getDeptId().toString());
        requestDTO.setPositionId(oldPolicy.getPosition().getPositionId().toString());
        requestDTO.setGradeId(oldPolicy.getGrade().getGradeId());

        // 4. 기본급 유효성 검증
        validateRequiredForGradeCheck(requestDTO);

        // 5. 서열 검증 (같은 부서 기준)
        boolean valid = isValidGradeOrderForUpdate(requestDTO, oldPolicy.getPolicyId());

        if (!valid) {
            throw new IllegalArgumentException("기본급은 G1 < G2 < G3 < G4 < G5 순서를 유지해야 합니다.");
        }

        // 6. 기본급 정책 직접 수정
        adSalaryPolicyRepository.updateSalaryPolicy(
                oldPolicy.getPolicyId(),
                requestDTO.getBasicSalary()
        );
    }

    @Override
    @Transactional
    public void deleteSalaryPolicy(Long policyId) {

        // 1. 요청값 검증 - 정책 ID가 없으면 어떤 데이터를 삭제해야 하는지 알 수 없으므로 예외 처리
        if (policyId == null) {
            throw new IllegalArgumentException("삭제할 정책 ID가 없습니다.");
        }

        // 2. 삭제 대상 정책 조회 - 실제 DB에 존재하는 정책인지 확인
        SalaryPolicyEntity policy = adSalaryPolicyRepository.findById(policyId.intValue())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 기본급 정책입니다."));

        // 3. 기본급 정책 물리 삭제
        adSalaryPolicyRepository.delete(policy);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isValidGradeOrderForUpdateCheck(SalaryPolicyRequestDTO requestDTO) {

        // 1. 수정할 정책 정보가 없으면 검증 불가
        if (requestDTO == null || requestDTO.getPolicyId() == null) {
            throw new IllegalArgumentException("수정할 정책 정보가 없습니다.");
        }

        // 2. 기존 정책 조회
        SalaryPolicyEntity oldPolicy = adSalaryPolicyRepository.findById(requestDTO.getPolicyId().intValue())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 기본급 정책입니다."));

        // 3. 수정에서는 부서/직급/등급을 변경하지 않으므로 기존 정책 기준으로 다시 세팅
        requestDTO.setDeptId(oldPolicy.getDepartment().getDeptId().toString());
        requestDTO.setPositionId(oldPolicy.getPosition().getPositionId().toString());
        requestDTO.setGradeId(oldPolicy.getGrade().getGradeId());

        // 4. 기본급 입력값 검증
        validateRequiredForGradeCheck(requestDTO);

        // 5. 현재 수정 중인 정책은 제외하고 서열 검증
        return isValidGradeOrderForUpdate(requestDTO, oldPolicy.getPolicyId());
    }

    private boolean isValidGradeOrderForUpdate(SalaryPolicyRequestDTO requestDTO, Integer excludePolicyId) {

        // 1. 수정하려는 급여등급과 기본급을 가져온다.
        //    예) G2 기본급을 3,000,000원으로 수정하려는 경우
        int inputRank = getGradeRank(requestDTO.getGradeId());
        BigDecimal inputSalary = requestDTO.getBasicSalary();

        // 2. 같은 부서에 등록된 활성 기본급 정책 목록을 조회한다.
        //    기본급 서열은 같은 부서 안에서 G1 < G2 < G3 < G4 < G5 순서를 유지해야 한다.
        List<SalaryPolicyResponseDTO> list =
                adSalaryPolicyRepository.selectActivePoliciesByDept(requestDTO.getDeptId());

        // 3. 기존 정책들과 수정하려는 기본급을 비교한다.
        for (SalaryPolicyResponseDTO policy : list) {

            // 4. 현재 수정 중인 정책은 비교 대상에서 제외한다.
            //    자기 자신까지 비교하면 기존 값 때문에 서열 검증이 잘못 실패할 수 있다.
            if (policy.getPolicyId() != null
                    && excludePolicyId != null
                    && policy.getPolicyId().intValue() == excludePolicyId.intValue()) {
                continue;
            }

            // 5. 비교에 필요한 급여등급 또는 기본급이 없으면 해당 데이터는 건너뛴다.
            if (policy.getGradeId() == null || policy.getBasicSalary() == null) {
                continue;
            }

            // 6. 기존 정책의 급여등급 순위와 기본급을 가져온다.
            int savedRank = getGradeRank(policy.getGradeId());
            BigDecimal savedSalary = policy.getBasicSalary();

            // 7. 기존 등급이 수정 대상보다 낮은 등급이면, 수정하려는 기본급은 기존 낮은 등급의 기본급보다 커야 한다.
            //    예) G2를 수정한다면 G1 기본급보다 커야 함
            if (savedRank < inputRank && inputSalary.compareTo(savedSalary) <= 0) {
                return false;
            }

            // 8. 기존 등급이 수정 대상보다 높은 등급이면, 수정하려는 기본급은 기존 높은 등급의 기본급보다 작아야 한다.
            //    예) G2를 수정한다면 G3, G4 기본급보다 작아야 함
            if (savedRank > inputRank && inputSalary.compareTo(savedSalary) >= 0) {
                return false;
            }
        }

        // 9. 모든 비교를 통과하면 서열 조건을 만족한 것으로 판단한다.
        return true;
    }

    private void validateDeptAndPosition(String deptId, String positionId) {

        if (deptId == null || deptId.trim().isEmpty()) {
            throw new IllegalArgumentException("부서를 선택해 주세요.");
        }

        if (positionId == null || positionId.trim().isEmpty()) {
            throw new IllegalArgumentException("직급을 선택해 주세요.");
        }
    }

    private void validateRequiredForGradeCheck(SalaryPolicyRequestDTO requestDTO) {

        if (requestDTO == null) {
            throw new IllegalArgumentException("기본급 정책 정보가 없습니다.");
        }

        // 부서, 직급 검증
        validateDeptAndPosition(requestDTO.getDeptId(), requestDTO.getPositionId());

        // 급여등급 검증
        String gradeId = requestDTO.getGradeId();
        if (gradeId == null || gradeId.trim().isEmpty()) {
            throw new IllegalArgumentException("급여등급 정보가 없습니다.");
        }

        // 기본급 검증
        BigDecimal basicSalary = requestDTO.getBasicSalary();

        if (basicSalary == null) {
            throw new IllegalArgumentException("기본급을 입력해 주세요.");
        }

        if (basicSalary.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("기본급은 0보다 커야 합니다.");
        }
    }

    private void validateRequiredForRegister(SalaryPolicyRequestDTO requestDTO) {
        validateRequiredForGradeCheck(requestDTO);
    }

    private String getGradeIdByPosition(String positionId) {

        String positionName = null;
        List<PayrollSelectOptionDTO> positionList = getPositionList();

        for (PayrollSelectOptionDTO position : positionList) {
            if (position.getId().equals(positionId)) {
                positionName = position.getName();
                break;
            }
        }

        if (positionName == null) {
            throw new IllegalArgumentException("존재하지 않는 직급입니다.");
        }

        if (positionName.contains("사원")) {
            return "G1";
        } else if (positionName.contains("주임")) {
            return "G2";
        } else if (positionName.contains("선임")) {
            return "G3";
        } else if (positionName.contains("책임")) {
            return "G4";
        } else if (positionName.contains("수석")) {
            return "G5";
        }

        throw new IllegalArgumentException("직급에 매핑된 급여등급이 없습니다.");
    }

    private String getGradeNameByGradeId(String gradeId) {

        List<PayrollSelectOptionDTO> gradeList = getGradeCodeList();

        for (PayrollSelectOptionDTO grade : gradeList) {
            if (grade.getId().equals(gradeId)) {
                return grade.getName();
            }
        }

        return gradeId;
    }

    // 급여등급 설명 조회 (GRADE_CODE.description)
    private String getGradeDescriptionByGradeId(String gradeId) {

        List<PayrollSelectOptionDTO> gradeList = getGradeCodeList();

        for (PayrollSelectOptionDTO grade : gradeList) {
            if (grade.getId().equals(gradeId)) {
                return grade.getDescription(); // description 필요
            }
        }

        return "";
    }

    private int getGradeRank(String gradeId) {

        if ("G1".equals(gradeId)) {
            return 1;
        } else if ("G2".equals(gradeId)) {
            return 2;
        } else if ("G3".equals(gradeId)) {
            return 3;
        } else if ("G4".equals(gradeId)) {
            return 4;
        } else if ("G5".equals(gradeId)) {
            return 5;
        }

        throw new IllegalArgumentException("잘못된 급여등급 코드입니다.");
    }
}


