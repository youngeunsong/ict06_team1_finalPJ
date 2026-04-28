package com.ict06.team1_fin_pj.domain.attendance.service;

public interface AttendanceService {

    // 출근 처리
    void checkIn(String empNo, Double lat, Double lng);

}