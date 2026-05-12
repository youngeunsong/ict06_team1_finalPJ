package com.ict06.team1_fin_pj.domain.approval.service;

import com.ict06.team1_fin_pj.common.dto.approval.ApprovalCreateRequestDto;
import com.ict06.team1_fin_pj.common.dto.approval.ApprovalCreateResponseDto;
import com.ict06.team1_fin_pj.common.dto.approval.ApprovalDetailResponseDto;
import com.ict06.team1_fin_pj.common.dto.approval.ApprovalListResponseDto;
import com.ict06.team1_fin_pj.common.security.PrincipalDetails;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 일반 직원용 전자결재 서비스 인터페이스입니다.
 *
 * 관리자용 결재 양식/결재선 템플릿 관리는 AdApprovalService에서 처리하고,
 * 이 서비스는 React 사용자 화면에서 사용하는 문서 작성, 임시저장, 상신, 개인 문서함 조회를 담당합니다.
 */
public interface ApprovalService {

    /**
     * 새 결재 문서를 임시저장합니다.
     * 첨부파일이 없는 JSON 요청과 첨부파일이 있는 multipart 요청이 모두 이 메서드를 사용합니다.
     */
    ApprovalCreateResponseDto saveDraft(
            ApprovalCreateRequestDto requestDto,
            PrincipalDetails principal,
            List<MultipartFile> files
    );

    /**
     * 새 결재 문서를 상신합니다.
     * 상신 시에는 결재선이 필수이며, 첫 번째 결재자가 현재 결재자로 지정됩니다.
     */
    ApprovalCreateResponseDto submit(
            ApprovalCreateRequestDto requestDto,
            PrincipalDetails principal,
            List<MultipartFile> files
    );

    /**
     * 로그인한 사용자가 작성한 결재 문서 목록을 조회합니다.
     * status가 null이면 임시저장을 제외한 전체 문서를 조회합니다.
     */
    Page<ApprovalListResponseDto> getMyDocuments(
            String status,
            PrincipalDetails principal,
            Pageable pageable
    );

    /**
     * 로그인한 사용자의 임시저장 문서 목록을 조회합니다.
     */
    Page<ApprovalListResponseDto> getMyDrafts(
            PrincipalDetails principal,
            Pageable pageable
    );

    /**
     * 로그인한 사용자가 참조자로 지정된 결재 문서 목록을 조회합니다.
     *
     * 참조자는 APP_LINE.stepOrder=0으로 저장된 대상이며, 결재 승인/반려 권한은 없고 열람 권한만 가집니다.
     */
    Page<ApprovalListResponseDto> getMyReferencedDocuments(
            String status,
            PrincipalDetails principal,
            Pageable pageable
    );

    /**
     * 결재 문서 상세 정보를 조회합니다.
     *
     * 작성자, 결재자, 참조자만 조회할 수 있으며,
     * 임시저장 문서는 작성자만 열람할 수 있습니다.
     */
    ApprovalDetailResponseDto getApprovalDetail(
            Integer approvalId,
            PrincipalDetails principal
    );
}
