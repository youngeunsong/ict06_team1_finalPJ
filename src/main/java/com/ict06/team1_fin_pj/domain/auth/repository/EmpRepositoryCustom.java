package com.ict06.team1_fin_pj.domain.auth.repository;

import com.ict06.team1_fin_pj.common.dto.EmpEntity;

import java.util.List;
import java.util.Optional;

//QueryDSL 전용 커스텀 인터페이스
public interface EmpRepositoryCustom {

    //사원 정보 가져오기
    Optional<EmpEntity> findLoginEmpInfByEmpNo(String empNo);
}
