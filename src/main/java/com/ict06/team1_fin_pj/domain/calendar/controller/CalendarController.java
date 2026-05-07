package com.ict06.team1_fin_pj.domain.calendar.controller;

import com.ict06.team1_fin_pj.common.dto.calendar.ScheduleCreateRequestDto;
import com.ict06.team1_fin_pj.common.dto.calendar.ScheduleListResponseDto;
import com.ict06.team1_fin_pj.domain.calendar.service.CalendarService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 사용자용 캘린더 컨트롤러
 */
@RequestMapping("/calendar")
@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class CalendarController {

    @Autowired
    private CalendarService service;

    // 일정 간단 등록
    @PostMapping("/create")
    public Integer createSchedule(@RequestBody ScheduleCreateRequestDto dto) {
        System.out.println("CalendarController - createSchedule()");

        return service.createSchedule(dto);
    }

    // 일정 목록 조회
    // 캘린더 화면에 표시할 데이터를 내려준다.
    @GetMapping("/list")
    public List<ScheduleListResponseDto> getScheduleList() {
        System.out.println("CalendarController - getScheduleList()");

        return service.getScheduleList();
    }
}