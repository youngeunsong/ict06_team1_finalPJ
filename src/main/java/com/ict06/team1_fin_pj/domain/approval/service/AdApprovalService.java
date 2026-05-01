/**
 * @author : 송영은
 * description : 관리자용 전자결재 서비스 인터페이스
 * ========================================
 * DATE         AUTHOR      NOTE
 * 2026-04-29   송영은       최초 생성
 **/

package com.ict06.team1_fin_pj.domain.approval.service;

import com.ict06.team1_fin_pj.domain.approval.entity.AppFormEntity;
import com.ict06.team1_fin_pj.domain.approval.entity.AppLineTemplateDetailEntity;
import com.ict06.team1_fin_pj.domain.approval.entity.AppLineTemplateEntity;
import org.springframework.data.domain.Page;

import java.util.List;



public interface AdApprovalService {

    // [결재 서식 관리]-----------------------------------------
    // insert
    public void saveAppForm(AppFormEntity entity);

    // list
    public List<AppFormEntity> listAllAppForms();

    // 페이징 처리된 list로 받기
    public Page<AppFormEntity> getAppFormsWithPaging(int page, int size);

    // 1건 select (상세 화면)
    public AppFormEntity selectAppForm(int id);

    // delete
    public void deleteAppForm(int id);

    // update
    public void updateAppForm(AppFormEntity entity);

    // [결재선 서식 관리]--------------------------------------------
    // insert
    public void saveAppLineTemplate(AppLineTemplateEntity entity);

    // list
    public List<AppLineTemplateEntity> listAppLineTemplate();

    // 1건 select (상세 화면)
    public AppLineTemplateEntity selectAppLineTemplate(int id);

    // delete
    public void deleteAppLineTemplate(int id);

    // update
    public void updateAppLineTemplate(AppLineTemplateEntity entity);


}
