package com.ict06.team1_fin_pj.domain.approval.service;

import com.ict06.team1_fin_pj.common.dto.approval.AppFormDto;
import com.ict06.team1_fin_pj.domain.approval.entity.AppFormEntity;
import com.ict06.team1_fin_pj.domain.approval.entity.AppLineTemplateEntity;
import com.ict06.team1_fin_pj.domain.approval.repository.AppFormRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        System.out.println("AdApprovalServiceImpl - selectAppForm()");
        return appFormRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 서식입니다. ID: " + id));
    }

    // delete
    @Override
    public void deleteAppForm(int id) {

    }

    // update
    // JPA는 Dirty Checking을 사용합니다. 변경이 발생한 엔티티를 자동 감지하여 데이터베이스에 반영합니다.
    // 따라서 별도로 update 쿼리를 선언 안 해도 update 됩니다.
    @Transactional // 있어야 dirty checking 작동
    @Override
    public void updateAppForm(int formId, AppFormDto dto) {
        System.out.println("AdApprovalServiceImpl - updateAppForm()");
        // 1. DB에서 조회 (영속 상태)
        AppFormEntity prevEntity = appFormRepository.findById(formId)
                .orElseThrow(() -> new RuntimeException("서식 없음"));
        // 2. 값 변경 -> JPA가 변경 감지 -> UPDATE 쿼리 자동 실행
        prevEntity.updateForm(dto.getFormName(), dto.getTemplate());
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
