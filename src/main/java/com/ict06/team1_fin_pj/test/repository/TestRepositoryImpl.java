package com.ict06.team1_fin_pj.test.repository;

import com.ict06.team1_fin_pj.test.entity.QTestEntity;
import com.ict06.team1_fin_pj.test.entity.TestEntity;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * @author : 송영은$
 * description : Test 예제의 QueryDSL 구현체.
 * * QueryDSL 작성법에 따라 return문을 작성하면 됩니다.
 * ========================================
 * DATE         AUTHOR      NOTE
 * 2026-04-29   송영은     최초 생성
 **/
@Repository
@RequiredArgsConstructor
public class TestRepositoryImpl implements TestRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    public List<TestEntity> selectTestList() {

        QTestEntity test = QTestEntity.testEntity;
        return queryFactory
                .selectFrom(test)
                .orderBy(test.formId.desc())
                .fetch();
    }
}
