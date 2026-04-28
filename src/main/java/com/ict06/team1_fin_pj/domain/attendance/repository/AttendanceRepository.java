package com.ict06.team1_fin_pj.domain.attendance.repository;

import com.ict06.team1_fin_pj.domain.attendance.entity.AttendanceEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<AttendanceEntity, Integer> {

    // 🔥 오늘 이미 출근했는지 체크
    Optional<AttendanceEntity> findByEmployee_EmpNoAndWorkDate(String empNo, LocalDate workDate);

}