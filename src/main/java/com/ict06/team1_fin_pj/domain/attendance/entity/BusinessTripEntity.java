package com.ict06.team1_fin_pj.domain.attendance.entity;

import com.ict06.team1_fin_pj.common.dto.BaseTimeEntity;
import com.ict06.team1_fin_pj.domain.employee.entity.EmpEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "BUSINESS_TRIP")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusinessTripEntity extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "trip_id")
    private Integer tripId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "emp_no")
    private EmpEntity employee;

    private String category;

    @Column(name = "start_at")
    private LocalDateTime startAt;

    @Column(name = "end_at")
    private LocalDateTime endAt;

    @Column(name = "location_name", columnDefinition = "TEXT")
    private String locationName;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "approval_id")
    private Integer approvalId;

    @Column(name = "auth_lat", precision = 10, scale = 7)
    private BigDecimal authLat;

    @Column(name = "auth_long", precision = 10, scale = 7)
    private BigDecimal authLng;

    @Builder.Default
    @Column(name = "is_verified")
    private Boolean isVerified = false;
}