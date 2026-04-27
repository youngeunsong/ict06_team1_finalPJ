package com.ict06.team1_fin_pj.common.dto;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

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
}