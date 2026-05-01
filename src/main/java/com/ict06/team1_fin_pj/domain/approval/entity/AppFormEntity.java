package com.ict06.team1_fin_pj.domain.approval.entity;

import com.ict06.team1_fin_pj.common.dto.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "APP_FORM")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppFormEntity extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "form_id")
    private Integer formId;

    @Column(name = "form_name", nullable = false, length = 100)
    private String formName;

    @Column(columnDefinition = "TEXT")
    private String template;

    // 상태 변경 메서드
    public void updateForm(String formName, String template) {
        this.formName = formName;
        this.template = template;
    }
}
