package com.ict06.team1_fin_pj.domain.attendance.repository;

import com.ict06.team1_fin_pj.domain.attendance.entity.LeaveRequestEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

// 연차/휴가 신청 내역 Repository
// interface로 만든다.
public interface LeaveRequestRepository
        extends JpaRepository<LeaveRequestEntity, Integer> {

    // 특정 사원의 휴가 신청 내역 조회
    // 최신 시작일 기준으로 정렬
    List<LeaveRequestEntity> findByEmployee_EmpNoOrderByStartDateDesc(
            String empNo
    );
}