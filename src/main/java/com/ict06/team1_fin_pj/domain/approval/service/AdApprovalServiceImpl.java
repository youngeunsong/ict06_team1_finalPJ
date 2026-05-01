package com.ict06.team1_fin_pj.domain.approval.service;

import com.ict06.team1_fin_pj.domain.approval.entity.AppFormEntity;
import com.ict06.team1_fin_pj.domain.approval.entity.AppLineTemplateEntity;
import com.ict06.team1_fin_pj.domain.approval.repository.AppFormRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @author : 송영은
 * description : 관리자용 전자결재 서비스 구현 클래스
 * ========================================
 * DATE      AUTHOR      NOTE
 * 26.04.20  송영은       최초 생성
 **/

@Service
public class AdApprovalServiceImpl implements AdApprovalService {

    @Autowired
    private AppFormRepository appFormRepository;

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
        System.out.println("AdApprovalServiceImpl - listAllAppForms()");
        return appFormRepository.findAll(Sort.by("formId"));
    }

    // 페이징 처리된 list로 받기
    @Override
    public Page<AppFormEntity> getAppFormsWithPaging(int page, int size) {
        System.out.println("AdApprovalServiceImpl - getAppFormsWithPaging()");
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending()); // 페이지 번호와 크기 설정. 최신 순 정렬.
        return appFormRepository.findAll(pageable); // 페이징된 결과 반환
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
