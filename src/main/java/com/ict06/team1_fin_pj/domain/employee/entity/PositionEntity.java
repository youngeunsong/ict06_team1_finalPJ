package com.ict06.team1_fin_pj.domain.employee.entity;

import com.ict06.team1_fin_pj.common.dto.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "POSITION")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PositionEntity extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "position_id")
    private Integer positionId;

    @Column(name = "position_name", nullable = false, length = 50)
    private String positionName;
}
