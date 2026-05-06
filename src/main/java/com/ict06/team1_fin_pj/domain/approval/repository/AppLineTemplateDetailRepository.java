package com.ict06.team1_fin_pj.domain.approval.repository;

import com.ict06.team1_fin_pj.domain.approval.entity.AppLineTemplateDetailEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * @author : 송영은$
 * description : 전자 결재선 서식 디테일용 리포지토리
 * ========================================
 * DATE         AUTHOR      NOTE
 * 2026-05-06   송영은       최초 생성
 **/
@Repository
public interface AppLineTemplateDetailRepository extends JpaRepository<AppLineTemplateDetailEntity, Integer> {
}
