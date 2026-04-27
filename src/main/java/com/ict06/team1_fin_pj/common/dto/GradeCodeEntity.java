package com.ict06.team1_fin_pj.common.dto;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

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

    @Column(length = 200)
    private String description;

    @Column(name = "is_active")
    private Boolean isActive;
}
