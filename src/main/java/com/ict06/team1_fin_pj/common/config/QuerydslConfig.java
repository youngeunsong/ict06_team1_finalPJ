package com.ict06.team1_fin_pj.common.config;

import com.querydsl.jpa.impl.JPAQueryFactory;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * QueryDSL 설정 클래스
 * 1. 프로젝트 전역에서 QueryDSL을 사용할 수 있도록 JPAQueryFactory를 빈(Bean)으로 등록합니다.
 * 2. EntityManager를 주입받아 QueryDSL이 실제 DB 쿼리를 생성하고 실행할 수 있게 연결합니다.
 */
@Configuration
public class QuerydslConfig {

    @PersistenceContext
    private EntityManager entityManager;

    @Bean
    public JPAQueryFactory jpaQueryFactory() {
        return new JPAQueryFactory(entityManager);
    }
}
