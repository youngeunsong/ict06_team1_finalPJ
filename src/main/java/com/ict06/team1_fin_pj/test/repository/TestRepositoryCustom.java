package com.ict06.team1_fin_pj.test.repository;

import com.ict06.team1_fin_pj.test.entity.TestEntity;

import java.util.List;

/**
 * @author : 송영은$
 * description : Test예제의 QueryDSL용 리포지토리.
 * * 기존 JPA 기반 리포지토리에 QueryDSL을 사용하기위한 custom 인터페이스
 * ========================================
 * DATE         AUTHOR      NOTE
 * 2026-04-29   송영은       최초 생성
 **/
public interface TestRepositoryCustom {

    // 결재 서식 목록 선택
    List<TestEntity> selectTestList();
}
