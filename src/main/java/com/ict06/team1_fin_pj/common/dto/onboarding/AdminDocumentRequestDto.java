/**
 * @FileName : AdminDocumentRequestDto.java
 * @Description : 관리자 온보딩 문서/RAG 데이터 등록 및 수정 요청 DTO
 * @Author : 김다솜
 * @Date : 2026. 05. 10
 * @Modification_History
 * @
 * @ 수정일자        수정자       수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.05.10    김다솜        최초 생성 및 문서 메타데이터/처리 단계 요청값 추가
 */
package com.ict06.team1_fin_pj.common.dto.onboarding;

import com.ict06.team1_fin_pj.domain.onboarding.entity.AccessLevel;
import com.ict06.team1_fin_pj.domain.onboarding.entity.DocumentStage;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminDocumentRequestDto {

    private String title;
    private String filePath;
    private Integer deptId;
    private AccessLevel accessLevel;
    private DocumentStage currentStage;
}
