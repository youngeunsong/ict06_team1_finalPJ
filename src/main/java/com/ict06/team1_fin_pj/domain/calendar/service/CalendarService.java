package com.ict06.team1_fin_pj.domain.calendar.service;

import com.ict06.team1_fin_pj.common.dto.calendar.ScheduleCreateRequestDto;
import com.ict06.team1_fin_pj.common.dto.calendar.ScheduleListResponseDto;

import java.util.List;

public interface CalendarService {

    // 일정 간단 등록
    Integer createSchedule(ScheduleCreateRequestDto dto);

    // 일정 목록 조회
    // 캘린더 화면에 표시할 데이터를 반환
    List<ScheduleListResponseDto> getScheduleList();
}
