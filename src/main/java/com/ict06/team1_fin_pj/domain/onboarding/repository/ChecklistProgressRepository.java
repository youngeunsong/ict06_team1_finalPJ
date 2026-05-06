/**
 * @FileName : ChecklistProgressRepository.java
 * @Description : AI 온보딩 체크리스트 진행 상태 Repository
 *                CHECKLIST_PROGRESS 테이블 조회 및 저장 담당
 * @Author : 김다솜
 * @Date : 2026. 04. 29
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.29    김다솜        최초 생성/사원-체크리스트 기준 진행 상태 조회 Repository 구현
 */
package com.ict06.team1_fin_pj.domain.onboarding.repository;

import com.ict06.team1_fin_pj.domain.onboarding.entity.ChecklistProgressEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChecklistProgressRepository extends JpaRepository<ChecklistProgressEntity, Integer> {

    //특정 사원의 전체 체크리스트 진행 상태 조회
    List<ChecklistProgressEntity> findByEmployee_EmpNo(String empNo);

    //특정 사원+특정 체크리스트의 진행 상태 조회
    Optional<ChecklistProgressEntity> findByEmployee_EmpNoAndChecklist_ChecklistId(String empNo, Integer checklistId);
}