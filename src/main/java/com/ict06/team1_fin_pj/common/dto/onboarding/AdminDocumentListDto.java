/**
 * @FileName : AdminDocumentListDto.java
 * @Description : 관리자 온보딩 문서/RAG 데이터 목록 응답 DTO
 * @Author : 김다솜
 * @Date : 2026. 05. 10
 * @Modification_History
 * @
 * @ 수정일자        수정자       수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.05.10    김다솜        최초 생성 및 문서별 청크/벡터 반영 상태 표시값 추가
 */
package com.ict06.team1_fin_pj.common.dto.onboarding;

import com.ict06.team1_fin_pj.domain.onboarding.entity.AccessLevel;
import com.ict06.team1_fin_pj.domain.onboarding.entity.DocumentStage;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AdminDocumentListDto {

    private Integer docId;
    private String title;
    private String filePath;
    private String summaryPreview;
    private String departmentName;
    private AccessLevel accessLevel;
    private DocumentStage currentStage;
    private Integer chunkCount;
    private Integer vectorCount;
    private String createdByName;
    private String lastErrorMessage;
    private LocalDateTime updatedAt;
}
