package com.ict06.team1_fin_pj.domain.calendar.entity;

import com.ict06.team1_fin_pj.common.dto.BaseTimeEntity;
import com.ict06.team1_fin_pj.domain.employee.entity.DepartmentEntity;
import com.ict06.team1_fin_pj.domain.employee.entity.EmpEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "SCHEDULE")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleEntity extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "schedule_id")
    private Integer scheduleId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    private ScheduleType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_no")
    private EmpEntity creator;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dept_id")
    private DepartmentEntity department;

    @Column(length = 20)
    private String category;

    @Column(length = 200)
    private String location;

    @Column(name = "is_all_day")
    @Builder.Default
    private Boolean isAllDay = false;

    @Column(name = "is_public")
    @Builder.Default
    private Boolean isPublic = true;

    @Column(name = "repeat_rule", length = 50)
    private String repeatRule;

    @Column(name = "is_deleted")
    @Builder.Default
    private Boolean isDeleted = false;

    @Builder.Default
    @OneToMany(mappedBy = "schedule", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ScheduleParticipantEntity> participants = new ArrayList<>();

    // 일정 수정
    public void updateSchedule(
            String title,
            String content,
            LocalDateTime startTime,
            LocalDateTime endTime,
            ScheduleType type,
            DepartmentEntity department,
            String category,
            String location,
            Boolean isAllDay,
            Boolean isPublic,
            String repeatRule
    ) {
        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("일정 제목은 필수입니다.");
        }

        if (startTime == null) {
            throw new IllegalArgumentException("시작 시간은 필수입니다.");
        }

        if (endTime == null) {
            throw new IllegalArgumentException("종료 시간은 필수입니다.");
        }

        this.title = title.trim();
        this.content = content;
        this.startTime = startTime;
        this.endTime = endTime;
        this.type = type;
        this.department = department;
        this.category = category;
        this.location = location;
        this.isAllDay = Boolean.TRUE.equals(isAllDay);
        this.isPublic = isPublic == null ? this.isPublic : isPublic;
        this.repeatRule = repeatRule;
    }

    // 일정 삭제
    public void deleteSchedule() {
        this.isDeleted = true;
    }
}
