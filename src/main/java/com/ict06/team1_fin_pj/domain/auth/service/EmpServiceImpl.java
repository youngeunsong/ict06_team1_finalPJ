package com.ict06.team1_fin_pj.domain.auth.service;

import com.ict06.team1_fin_pj.common.dto.EmpEntity;
import com.ict06.team1_fin_pj.domain.auth.repository.EmpRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmpServiceImpl {

    private final EmpRepository empRepository;

    public EmpEntity getWelcomeInfo(String empNo) {
        return empRepository.findLoginEmpInfByEmpNo(empNo)
                .orElseThrow(() -> new RuntimeException(empNo + "사번을 가진 사원의 정보가 없습니다."));
    }
}
