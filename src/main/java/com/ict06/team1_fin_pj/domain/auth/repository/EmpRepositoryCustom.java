/**
 * @FileName : EmpRepositoryCustom.java
 * @Description : QueryDSL 커스텀 레포지토리 인터페이스(Auth 도메인)
 *                (JPA 기본쿼리로 처리 어려운 동적쿼리 등 처리를 위함)
 * @Author : 김다솜
 * @Date : 2026. 04. 22
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.22    김다솜        최초 생성/QueryDSL 기반 사원 정보 조회 메서드 정의
 * @ 2026.04.23    김다솜        사원 정보 수정 메서드 정의
 */

package com.ict06.team1_fin_pj.domain.auth.repository;

import com.ict06.team1_fin_pj.common.dto.EmpEntity;

import java.util.List;
import java.util.Optional;

//QueryDSL 전용 커스텀 인터페이스
public interface EmpRepositoryCustom {

    //사원 정보 가져오기
    Optional<EmpEntity> findLoginEmpInfByEmpNo(String empNo);
    void updateEmpInfo(String empNo, String name, String email, String phone);
}
