package com.ict06.team1_fin_pj.domain.calendar.service;

import com.ict06.team1_fin_pj.common.dto.calendar.ScheduleCreateRequestDto;
import com.ict06.team1_fin_pj.common.dto.calendar.ScheduleListResponseDto;
import com.ict06.team1_fin_pj.domain.calendar.entity.ScheduleEntity;
import com.ict06.team1_fin_pj.domain.calendar.entity.ScheduleType;
import com.ict06.team1_fin_pj.domain.calendar.repository.CalendarRepository;
import com.ict06.team1_fin_pj.domain.employee.entity.DepartmentEntity;
import com.ict06.team1_fin_pj.domain.employee.entity.EmpEntity;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 일정 Service 구현체
 */
@Service
public class CalendarServiceImpl implements CalendarService {

    @Autowired
    private CalendarRepository repository;

    @PersistenceContext
    private EntityManager entityManager;

    // 일정 간단 등록
    @Override
    @Transactional
    public Integer createSchedule(ScheduleCreateRequestDto dto) {
        System.out.println("[CalendarServiceImpl] - createSchedule()");

        if (dto.getTitle() == null || dto.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("일정 제목은 필수입니다.");
        }

        if (dto.getCreatorNo() == null || dto.getCreatorNo().trim().isEmpty()) {
            throw new IllegalArgumentException("작성자 사번은 필수입니다.");
        }

        if (dto.getStartTime() == null) {
            throw new IllegalArgumentException("시작 시간은 필수입니다.");
        }

        if (dto.getEndTime() == null) {
            throw new IllegalArgumentException("종료 시간은 필수입니다.");
        }

        // 작성자 사번으로 Employee 참조
        EmpEntity creator = entityManager.getReference(EmpEntity.class, dto.getCreatorNo());


        // 부서 ID가 있는 경우에만 Department 참조
        DepartmentEntity department = null;
        if (dto.getDeptId() != null) {
            department = entityManager.getReference(DepartmentEntity.class, dto.getDeptId());
        }

        // 일정 유형이 없으면 PERSONAL 기본값 사용
        String typeValue = (dto.getType() == null || dto.getType().trim().isEmpty())
                ? "PERSONAL"
                : dto.getType().trim();

        ScheduleType scheduleType;
        try {
            scheduleType = ScheduleType.valueOf(typeValue);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("잘못된 일정 유형입니다: " + typeValue);
        }

        ScheduleEntity entity = ScheduleEntity.builder()
                .title(dto.getTitle().trim())
                .content(dto.getContent())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .type(scheduleType)
                .creator(creator)
                .department(department)
                .category(dto.getCategory())
                .location(dto.getLocation())
                .isAllDay(Boolean.TRUE.equals(dto.getIsAllDay()))
                .isPublic(dto.getIsPublic() == null ? true : dto.getIsPublic())
                .repeatRule(dto.getRepeatRule())
                .isDeleted(false)
                .build();

        ScheduleEntity saved = repository.save(entity);

        return saved.getScheduleId();
    }

    // 일정 목록 조회
    // 캘린더 화면에 보여줄 일정 데이터를 변환한다.
    @Override
    public List<ScheduleListResponseDto> getScheduleList() {
        return repository.findAll()
                .stream()
                .map(schedule -> ScheduleListResponseDto.builder()
                        .scheduleId(schedule.getScheduleId())
                        .title(schedule.getTitle())
                        .content(schedule.getContent())
                        .startTime(schedule.getStartTime())
                        .endTime(schedule.getEndTime())
                        .type(schedule.getType() != null ? schedule.getType().name() : null)
                        .category(schedule.getCategory())
                        .location(schedule.getLocation())
                        .isAllDay(schedule.getIsAllDay())
                        .isPublic(schedule.getIsPublic())
                        .creatorNo(schedule.getCreator() != null ? schedule.getCreator().getEmpNo() : null)
                        .build())
                .toList();
    }
}