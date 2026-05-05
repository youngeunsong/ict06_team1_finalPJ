package com.ict06.team1_fin_pj.domain.payroll.entity;

import com.ict06.team1_fin_pj.common.dto.BaseTimeEntity;
import com.ict06.team1_fin_pj.domain.employee.entity.EmpEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "GRADE_CODE")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GradeCodeEntity extends BaseTimeEntity {

    @Id
    @Column(name = "grade_id", length = 10)
    private String gradeId;

    @Column(name = "grade_name", nullable = false, length = 50)
    private String gradeName;

    @Column(name = "description", length = 200)
    private String description;

    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;
}
