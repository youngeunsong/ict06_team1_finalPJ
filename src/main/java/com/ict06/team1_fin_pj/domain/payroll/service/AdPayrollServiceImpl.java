package com.ict06.team1_fin_pj.domain.payroll.service;


import com.ict06.team1_fin_pj.common.dto.payroll.GradeCodeDTO;
import com.ict06.team1_fin_pj.common.dto.payroll.SalaryPolicyResponseDTO;
import com.ict06.team1_fin_pj.domain.payroll.repository.AdPayrollRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdPayrollServiceImpl implements AdPayrollService {

    private final AdPayrollRepository adPayrollRepository;

    // 기본급 정책 목록 조회
    @Override
    public List<SalaryPolicyResponseDTO> getSalaryPolicyList() {
        return  adPayrollRepository.selectSalaryPolicyList(searchDTO);
    }

    // 부서 select box용 목록 조회
    @Override
    public List<DepartmentDTO> getDepartmentList() {
        return adPayrollRepository.selectDepartmentList();
    }

    // 직급 select box용 목록 조회
    @Override
    public List<PositionDTO> getPositionList() {
        return adPayrollRepository.selectPositionList();
    }

    // 급여등급 select box용 목록 조회
    @Override
    public List<GradeCodeDTO> getGradeCodeList() {
        return adPayrollRepository.selectGradeCodeList();
    }
}
