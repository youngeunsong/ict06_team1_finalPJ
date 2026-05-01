package com.ict06.team1_fin_pj.domain.attendance.entity;
import com.ict06.team1_fin_pj.domain.employee.entity.EmpEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;

@Entity
@Table(
        name = "ATTENDANCE",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_emp_work_date",
                        columnNames = {"emp_no", "work_date"}
                )
        }
)
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "attendance_id")
    private Integer attendanceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "emp_no", nullable = false)
    private EmpEntity employee;

    @Column(name = "work_date", nullable = false)
    private LocalDate workDate;

    @Column(name = "check_in_at")
    private LocalDateTime checkInAt;

    @Column(name = "check_out_at")
    private LocalDateTime checkOutAt;

    @Column(name = "check_in_lat", precision = 10, scale = 7)
    private BigDecimal checkInLat;

    @Column(name = "check_in_long", precision = 10, scale = 7)
    private BigDecimal checkInLong;

    @Column(name = "check_out_lat", precision = 10, scale = 7)
    private BigDecimal checkOutLat;

    @Column(name = "check_out_long", precision = 10, scale = 7)
    private BigDecimal checkOutLong;

    @Column(name = "work_hours", precision = 5, scale = 2)
    private BigDecimal workHours;

    @Column(name = "overtime_mins")
    private Integer overtimeMins;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private AttendanceStatus status;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    // 퇴근 처리 시 필요한 값들을 한 번에 변경하는 메서드
    public void checkOut(
            LocalDateTime checkOutAt,
            BigDecimal checkOutLat,
            BigDecimal checkOutLong,
            BigDecimal workHours,
            Integer overtimeMins,
            AttendanceStatus status
    ) {
        // 이미 퇴근 시간이 있으면 중복 퇴근 방지
        if (this.checkOutAt != null) {
            throw new IllegalStateException("이미 퇴근 처리된 기록입니다.");
        }

        this.checkOutAt = checkOutAt;       // 퇴근 시각
        this.checkOutLat = checkOutLat;     // 퇴근 위치 위도
        this.checkOutLong = checkOutLong;   // 퇴근 위치 경도
        this.workHours = workHours;         // 총 근무 시간
        this.overtimeMins = overtimeMins;   // 연장근무 분
        this.status = status;               // 퇴근 상태
    }
}