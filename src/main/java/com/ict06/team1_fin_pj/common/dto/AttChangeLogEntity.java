package com.ict06.team1_fin_pj.common.dto;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "ATTENDANCE_CHANGE_LOG")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttChangeLogEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "change_log_id")
    private Integer changeLogId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "att_id", nullable = false)
    private AttendanceEntity attendance;

    @Column(name = "work_date")
    private LocalDate workDate;

    @Column(name = "before_check_in")
    private LocalDateTime beforeCheckIn;

    @Column(name = "after_check_in")
    private LocalDateTime afterCheckIn;

    @Column(name = "before_check_out")
    private LocalDateTime beforeCheckOut;

    @Column(name = "after_check_out")
    private LocalDateTime afterCheckOut;

    @Enumerated(EnumType.STRING)
    @Column(name = "before_status")
    private AttendanceStatus beforeStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "after_status")
    private AttendanceStatus afterStatus;

    @Column(name = "change_reason", nullable = false, columnDefinition = "TEXT")
    private String changeReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by")
    private EmpEntity changedBy;

    @Column(name = "changed_at")
    private LocalDateTime changedAt;
}
