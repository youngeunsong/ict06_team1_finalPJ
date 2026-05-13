package com.ict06.team1_fin_pj.domain.approval.entity;

import com.ict06.team1_fin_pj.common.dto.BaseTimeEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
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

    @Column(name = "is_default")
    @Builder.Default
    private Boolean isDefault = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "line_template_id")
    private AppLineTemplateEntity lineTemplate;

    /**
     * 결재 서식의 기본 정보를 수정합니다.
     * 결재선 서식 연결은 별도 메서드로 분리해 화면의 저장 책임을 명확히 합니다.
     */
    public void updateForm(String formName, String template) {
        this.formName = formName;
        this.template = template;
    }

    /**
     * 기본 결재 서식 여부를 Boolean null 값과 무관하게 안전하게 판단합니다.
     */
    public boolean isDefaultForm() {
        return Boolean.TRUE.equals(this.isDefault);
    }

    /**
     * 결재 서식에서 사용할 결재선 서식을 연결합니다.
     * 하나의 결재선 서식을 여러 결재 서식이 공유할 수 있도록 APP_FORM이 FK를 가집니다.
     */
    public void updateLineTemplate(AppLineTemplateEntity lineTemplate) {
        this.lineTemplate = lineTemplate;
    }
}
