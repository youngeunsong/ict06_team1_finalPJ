package com.ict06.team1_fin_pj.domain.approval.service;

import com.ict06.team1_fin_pj.domain.approval.entity.AppFormEntity;
import com.ict06.team1_fin_pj.domain.approval.entity.AppLineTemplateEntity;
import com.ict06.team1_fin_pj.domain.approval.repository.AppFormRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @package : package com.ict06.team1_fin_pj.domain.approval.service;
 * @name : AdApprovalServiceImpl
 * @author : 송영은
 * description : 관리자용 전자결재 서비스 구현 클래스
 * ========================================
 * DATE      AUTHOR      NOTE
 * 26.04.20  송영은       최초 생성
 **/

@Service
public class AdApprovalServiceImpl implements AdApprovalService {

    @Autowired
    AppFormRepository appFormRepository;

    // [결재 서식 관리]-----------------------------------------
    // insert
    @Override
    public void saveAppForm(AppFormEntity entity) {
        System.out.println("AdApprovalServiceImpl - saveAppForm()");
        appFormRepository.save(entity);
    }

    // list
    @Override
    public List<AppFormEntity> listAllAppForms() {
        return List.of();
    }

    // 1건 select (상세 화면)
    @Override
    public AppFormEntity selectAppForm(int id) {
        return null;
    }

    // delete
    @Override
    public void deleteAppForm(int id) {

    }

    // update
    @Override
    public void updateAppForm(AppFormEntity entity) {

    }

    // [결재선 서식 관리]--------------------------------------------
    // insert
    @Override
    public void saveAppLineTemplate(AppLineTemplateEntity entity) {

    }

    // list
    @Override
    public List<AppLineTemplateEntity> listAppLineTemplate() {
        return List.of();
    }

    // 1건 select (상세 화면)
    @Override
    public AppLineTemplateEntity selectAppLineTemplate(int id) {
        return null;
    }

    // delete
    @Override
    public void deleteAppLineTemplate(int id) {

    }

    // update
    @Override
    public void updateAppLineTemplate(AppLineTemplateEntity entity) {

    }
}
