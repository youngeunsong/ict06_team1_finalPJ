package com.ict06.team1_fin_pj.domain.auth.repository;

import com.querydsl.jpa.impl.JPAQueryFactory;
import com.ict06.team1_fin_pj.common.dto.EmpEntity;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Optional;

import static com.ict06.team1_fin_pj.common.dto.QEmpEntity.empEntity;

//QueryDSL 전용 Custom Repository
@RequiredArgsConstructor
public class EmpRepositoryCustomImpl implements EmpRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    public Optional<EmpEntity> findLoginEmpInfByEmpNo(String empNo) {
        return Optional.ofNullable(
                queryFactory
                        .selectFrom(empEntity)
                        .where(empEntity.empNo.eq(empNo))
                        .fetchOne()
        );
    }
}
