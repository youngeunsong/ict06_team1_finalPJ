/**
 * @FileName : ChecklistRepository.java
 * @Description : AI 온보딩 체크리스트 Repository
 *                CHECKLIST 테이블 조회 담당
 * @Author : 김다솜
 * @Date : 2026. 04. 29
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.29    김다솜        최초 생성/체크리스트 조회 Repository 구현
 */

package com.ict06.team1_fin_pj.domain.onboarding.repository;

import com.ict06.team1_fin_pj.domain.onboarding.entity.ChecklistEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChecklistRepository extends JpaRepository<ChecklistEntity, Integer> {

    //화면 표시 순서대로 체크리스트 조회
    List<ChecklistEntity> findAllByOrderByOrderNoAsc();
}