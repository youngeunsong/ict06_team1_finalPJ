/**
 * @author : 송영은
 * description : TestEntity와 연결하는 Repository. Jpa와 QueryDSL 활용
 *  *  단순한 쿼리의 경우 JPA를 이용하면 별도로 repository에 메서드 작성 없이도 ServiceImpl에서 이용가능합니다.
 *  *
 * ========================================
 * DATE         AUTHOR      NOTE
 * 2026-04-29   송영은       최초 생성
 **/

package com.ict06.team1_fin_pj.test.repository;

import com.ict06.team1_fin_pj.test.entity.TestEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// pom.xml에 반드시 Jpa를 추가하고, Jpa를 반드시 extends 한다.
// JpaRepository<DTO, id type>
@Repository
public interface TestRepository
        extends JpaRepository<TestEntity, Integer>, TestRepositoryCustom {

}
