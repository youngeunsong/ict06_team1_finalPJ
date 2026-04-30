

package com.ict06.team1_fin_pj.domain.approval.service;

import com.ict06.team1_fin_pj.domain.approval.entity.AppFormEntity;
import com.ict06.team1_fin_pj.domain.approval.entity.AppLineTemplateDetailEntity;
import com.ict06.team1_fin_pj.domain.approval.entity.AppLineTemplateEntity;

import java.util.List;



public interface AdApprovalService {

    // [결재 서식 관리]-----------------------------------------
    // insert
    public void saveAppForm(AppFormEntity entity);

    // list
    public List<AppFormEntity> listAllAppForms();

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
