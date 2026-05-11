/**
 * @author : 송영은
 * description : 관리자용 전자결재 서비스 인터페이스
 * ========================================
 * DATE         AUTHOR      NOTE
 * 2026-04-29   송영은       최초 생성
 **/

package com.ict06.team1_fin_pj.domain.approval.service;

import com.ict06.team1_fin_pj.common.dto.approval.*;
import com.ict06.team1_fin_pj.common.security.PrincipalDetails;
import com.ict06.team1_fin_pj.domain.approval.entity.AppFormEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;



public interface AdApprovalService {

    // [결재 서식 관리]-----------------------------------------
    // insert
    public void saveAppForm(AppFormEntity entity);

    // list
    public List<AppFormEntity> listAllAppForms();

    // 페이징 처리된 list로 받기
    public Page<AppFormListDto> getAppFormsWithPaging(int page, int size);

    // 1건 select (상세 화면)
    public AppFormEntity selectAppForm(int id);

    // delete
    public void deleteAppForm(int id);

    // update
    public void updateAppForm(int id, AppFormDto dto);

    // [결재선 서식 관리]--------------------------------------------
    // insert
    public void saveAppLineForm(AppLineFormRequestDto dto, PrincipalDetails principal);

    // list
    public Page<AppLineFormListDto> listAppLineForm(Pageable pageable);

    // 결재선 서식 목록 조회
    List<AppLineFormListDto> listAllAppLineTemplates();

    // 결재선 서식과 결재 서식 연결 저장
    void applyLineTemplate(Integer formId, Integer templateId);

    // 페이징 처리된 list로 받기
    Page<AppLineFormListDto> getAppLineFormsWithPaging(int page, int size);

    // 1건 select (상세 화면)
    public AppLineFormDetailDto selectAppLineForm(Integer id);

    // delete
    public void deleteAppLineTemplate(int id);

    // update
//    public void updateAppLineTemplate(AppLineTemplateEntity entity);
    void updateAppLineForm(
            Integer templateId,
            AppLineFormRequestDto dto,
            PrincipalDetails principal
    );
}
