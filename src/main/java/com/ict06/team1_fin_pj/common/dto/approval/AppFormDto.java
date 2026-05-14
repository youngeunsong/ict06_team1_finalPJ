package com.ict06.team1_fin_pj.common.dto.approval;

import lombok.Getter;
import lombok.Setter;

/**
 * 관리자 결재 서식 생성/수정 화면에서 사용하는 요청 DTO입니다.
 * isDefault는 제조사 기본 서식 여부이므로 관리자 요청 값으로 받지 않습니다.
 */
@Getter
@Setter
public class AppFormDto {

    private String formName;

    private String template;
}
