/**
 * @FileName : EmpRepository.java
 * @Description : 사원 정보 접근을 위한 JPA 레포지토리
 * @Author : 김다솜
 * @Date : 2026. 04. 20
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.20    김다솜        최초 생성/사번 기반 조회 메서드 추가
 */

package com.ict06.team1_fin_pj.domain.auth.repository;
import com.ict06.team1_fin_pj.domain.employee.entity.EmpEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmpRepository extends JpaRepository<EmpEntity, String>, EmpRepositoryCustom {
    Optional<EmpEntity> findByEmpNo(String empNo);

}
