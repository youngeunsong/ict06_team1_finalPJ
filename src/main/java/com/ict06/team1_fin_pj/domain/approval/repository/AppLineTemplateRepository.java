package com.ict06.team1_fin_pj.domain.approval.repository;

import com.ict06.team1_fin_pj.domain.approval.entity.AppLineTemplateEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * @author : 송영은$
 * description : 결재선 템플릿용 리포지토리
 * ========================================
 * DATE         AUTHOR      NOTE
 * 2026-05-06   송영은       최초 생성
 **/
@Repository
public interface AppLineTemplateRepository extends JpaRepository<AppLineTemplateEntity, Integer> {
}
