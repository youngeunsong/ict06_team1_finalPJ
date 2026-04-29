package com.ict06.team1_fin_pj.domain.approval.repository;

import com.ict06.team1_fin_pj.domain.approval.entity.AppFormEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * @author : 송영은
 * description : AppFormEntity와 연결하는 Repository. Jpa와 QueryDSL 활용
 * ========================================
 * DATE         AUTHOR      NOTE
 * 2026-04-29   송영은       최초 생성
 **/

// pom.xml에 반드시 Jpa를 추가하고, Jpa를 반드시 extends 한다.
// JpaRepository<DTO, id type>
@Repository
public interface AppFormRepository extends JpaRepository<AppFormEntity, Integer> {

}
