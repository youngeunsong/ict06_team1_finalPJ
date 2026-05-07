package com.ict06.team1_fin_pj.domain.payroll.service;

import com.ict06.team1_fin_pj.common.dto.payroll.*;
import com.ict06.team1_fin_pj.domain.payroll.repository.PayrollRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.List;

// 관리자용 급여대장 서비스 구현
@Service
@RequiredArgsConstructor
public class AdPayrollServiceImpl implements AdPayrollService  {

    private final PayrollRepository payrollRepository;

    // 사원 검색 autocomplete
    @Override
    @Transactional(readOnly = true)
    public List<PayrollEmployeeSearchResponseDTO> searchEmployees(PayrollEmployeeSearchDTO searchDTO) {

        validateEmployeeSearch(searchDTO);

        return payrollRepository.searchEmployees(searchDTO);
    }

    // 사원 인사정보 조회
    @Override
    @Transactional(readOnly = true)
    public PayrollEmployeeInfoResponseDTO getEmployeeInfo(String empNo) {

        validateEmpNo(empNo);

        return payrollRepository.selectEmployeeInfo(empNo)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사원입니다."));
    }

    // 급여대장 상태 조회
    @Override
    @Transactional(readOnly = true)
    public PayrollStatusResponseDTO getPayrollStatus(PayrollMainRequestDTO requestDTO) {

        validateMainRequest(requestDTO);

        String payMonth = makePayMonth(requestDTO.getPayYear(), requestDTO.getPayMonth());

        return payrollRepository.selectPayrollStatus(requestDTO.getEmpNo(), payMonth)
                .orElseGet(() -> PayrollStatusResponseDTO.builder()
                        .payrollId(null)
                        .payrollStatus("NEW")
                        .payrollStatusName("미작성")
                        .payDate(null)
                        .editable(true)
                        .deletable(false)
                        .previewAvailable(false)
                        .confirmAvailable(false)
                        .payConfirmAvailable(false)
                        .resetAvailable(true)
                        .build());
    }

    // 기본급 자동 로딩
    @Override
    @Transactional(readOnly = true)
    public PayrollBaseSalaryResponseDTO getBaseSalary(PayrollMainRequestDTO requestDTO) {

        validateMainRequest(requestDTO);

        String payMonth = makePayMonth(requestDTO.getPayYear(), requestDTO.getPayMonth());

        // 기존 급여대장이 있으면 저장된 기본급 사용
        PayrollStatusResponseDTO statusDTO = getPayrollStatus(requestDTO);

        if (!"NEW".equals(statusDTO.getPayrollStatus())) {
            return PayrollBaseSalaryResponseDTO.builder()
                    .baseSalary(statusDTO.getBaseSalary())
                    .salarySource("SAVED")
                    .policyExists(true)
                    .policyChanged(false)
                    .warningMessage(null)
                    .build();
        }

        // 이전 확정/지급완료 기본급 조회
        PayrollBaseSalaryResponseDTO recentSalary =
                payrollRepository.selectRecentConfirmedBaseSalary(requestDTO.getEmpNo(), payMonth)
                        .orElse(null);

        if (recentSalary != null && recentSalary.getBaseSalary() != null) {
            return recentSalary;
        }

        // 현재 기본급 정책 조회
        return payrollRepository.selectCurrentSalaryPolicyBaseSalary(requestDTO.getEmpNo())
                .orElseGet(() -> PayrollBaseSalaryResponseDTO.builder()
                        .baseSalary(null)
                        .salarySource("MANUAL")
                        .policyExists(false)
                        .policyChanged(false)
                        .warningMessage("현재 사원의 기본급 정책이 설정되어 있지 않거나 삭제되었습니다. 기본급 관리에서 확인해주세요.")
                        .build());
    }

    // 사원 검색값 검증
    private void validateEmployeeSearch(PayrollEmployeeSearchDTO searchDTO) {

        if (searchDTO == null || !StringUtils.hasText(searchDTO.getKeyword())) {
            throw new IllegalArgumentException("검색어를 입력해 주세요.");
        }

        String keyword = searchDTO.getKeyword().trim();
        String searchType = searchDTO.getSearchType();

        if ("EMP_NO".equals(searchType) && keyword.length() < 6) {
            throw new IllegalArgumentException("사번은 6자리 이상 입력해 주세요.");
        }

        if ("NAME".equals(searchType) && keyword.length() < 2) {
            throw new IllegalArgumentException("이름은 2글자 이상 입력해 주세요.");
        }

        if (searchDTO.getLimit() == null || searchDTO.getLimit() <= 0) {
            searchDTO.setLimit(10);
        }

        if (searchDTO.getShowAll() == null) {
            searchDTO.setShowAll(false);
        }
    }

    // 사번 검증
    private void validateEmpNo(String empNo) {

        if (!StringUtils.hasText(empNo)) {
            throw new IllegalArgumentException("사번이 없습니다.");
        }

        if (empNo.trim().length() < 6) {
            throw new IllegalArgumentException("사번은 6자리 이상이어야 합니다.");
        }
    }

    // 메인 조회값 검증
    private void validateMainRequest(PayrollMainRequestDTO requestDTO) {

        if (requestDTO == null) {
            throw new IllegalArgumentException("조회 조건이 없습니다.");
        }

        validateEmpNo(requestDTO.getEmpNo());

        if (requestDTO.getPayYear() == null) {
            throw new IllegalArgumentException("작성년도를 선택해 주세요.");
        }

        if (requestDTO.getPayMonth() == null) {
            throw new IllegalArgumentException("작성월을 선택해 주세요.");
        }

        LocalDate now = LocalDate.now();

        if (requestDTO.getPayYear() > now.getYear()) {
            throw new IllegalArgumentException("미래 연도는 조회할 수 없습니다.");
        }

        if (requestDTO.getPayYear() == now.getYear()
                && requestDTO.getPayMonth() > now.getMonthValue()) {
            throw new IllegalArgumentException("미래 월은 조회할 수 없습니다.");
        }
    }

    // YYYY-MM 생성
    private String makePayMonth(Integer year, Integer month) {

        if (month < 10) {
            return year + "-0" + month;
        }

        return year + "-" + month;
    }
}

