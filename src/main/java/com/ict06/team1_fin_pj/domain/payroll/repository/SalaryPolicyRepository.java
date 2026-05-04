package com.ict06.team1_fin_pj.domain.payroll.repository;

import com.ict06.team1_fin_pj.domain.payroll.entity.SalaryPolicyEntity;
import org.springframework.data.jpa.repository.JpaRepository;

// 기본급 정책 테이블에 대한 Repository 인터페이스
// - Spring Data JPA가 자동으로 구현체를 생성해준다.
// JpaRepository 상속
// - 기본 CRUD 기능 제공
//    (save, findById, findAll, delete 등)
// SalaryPolicyRepositoryCustom 상속
// - QueryDSL 기반 커스텀 메서드 사용
//    (복잡한 조회, 동적 쿼리, 페이징, 검증 로직 등)
// 즉, "기본 CRUD + 복잡한 쿼리(QueryDSL)"를 동시에 사용하는 구조
public interface SalaryPolicyRepository extends JpaRepository<SalaryPolicyEntity, Integer>, SalaryPolicyRepositoryCustom {
}
