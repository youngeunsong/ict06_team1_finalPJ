package com.ict06.team1_fin_pj.domain.attendance.repository;

import com.ict06.team1_fin_pj.domain.attendance.entity.LeaveTypeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

// 휴가 유형 Repository
// 연차, 반차, 병가 같은 휴가 종류 조회용
public interface LeaveTypeRepository
        extends JpaRepository<LeaveTypeEntity, Integer> {

    // 휴가 유형명으로 조회
    // 예: 연차, 반차
    Optional<LeaveTypeEntity> findByTypeName(String typeName);
}