package com.ict06.team1_fin_pj.common.dto;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "SCHEDULE")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleParticipantEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sch_parti_id")
    private Integer schPartiId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id", nullable = false)
    private ScheduleEntity schedule;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "emp_no", nullable = false)
    private EmpEntity employee;

    @Enumerated(EnumType.STRING)
    private ParticipantStatus status;

    @Column(name = "responded_at")
    private LocalDateTime respondedAt;
}
