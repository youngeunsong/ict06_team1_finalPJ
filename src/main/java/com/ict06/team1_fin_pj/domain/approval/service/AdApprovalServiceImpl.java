package com.ict06.team1_fin_pj.domain.approval.service;

import com.ict06.team1_fin_pj.common.dto.approval.AppFormDto;
import com.ict06.team1_fin_pj.common.dto.approval.ApprovalLineCreateRequestDto;
import com.ict06.team1_fin_pj.common.dto.approval.ApprovalTargetDto;
import com.ict06.team1_fin_pj.domain.approval.entity.AppFormEntity;
import com.ict06.team1_fin_pj.domain.approval.entity.AppLineTemplateDetailEntity;
import com.ict06.team1_fin_pj.domain.approval.entity.AppLineTemplateEntity;
import com.ict06.team1_fin_pj.domain.approval.entity.ApproverType;
import com.ict06.team1_fin_pj.domain.approval.repository.AppFormRepository;
import com.ict06.team1_fin_pj.domain.approval.repository.AppLineTemplateRepository;
import com.ict06.team1_fin_pj.domain.employee.entity.DepartmentEntity;
import com.ict06.team1_fin_pj.domain.employee.entity.EmpEntity;
import com.ict06.team1_fin_pj.domain.employee.entity.PositionEntity;
import com.ict06.team1_fin_pj.domain.employee.repository.AdDepartmentRepository;
import com.ict06.team1_fin_pj.domain.employee.repository.AdEmployeeRepository;
import com.ict06.team1_fin_pj.domain.employee.repository.AdPositionRepository;
import com.ict06.team1_fin_pj.domain.employee.service.AdEmployeeService;
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

    // 전자결재 직접 관련 리포지토리
    @Autowired
    private AppFormRepository appFormRepository;

    @Autowired
    private AppLineTemplateRepository appLineTemplateRepository;

    // 필요한 인사 정보 가져오기 위한 서비스 & 리포지토리
    @Autowired
    private AdEmployeeService adEmployeeService;

    @Autowired
    private AdEmployeeRepository adEmployeeRepository;

    @Autowired
    private AdDepartmentRepository adDepartmentRepository;

    @Autowired
    private AdPositionRepository adPositionRepository;

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
    @Transactional
    public void deleteAppForm(int id) {
        AppFormEntity form = appFormRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("서식 없음"));
        appFormRepository.delete(form);
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
    @Transactional
    @Override
    public void saveAppLineTemplate(ApprovalLineCreateRequestDto dto) {
        // 1️⃣ 템플릿 생성
        AppLineTemplateEntity template = AppLineTemplateEntity.builder()
                .templateName(dto.getFormName())
                .isDefault(false)
                .build();

        // TODO: createdBy, form 세팅 필요하면 추가

        // 2️⃣ 참조 대상 (step = 0으로 처리)
        if (dto.getRefTargets() != null) {

            dto.getRefTargets().forEach(t -> {

                AppLineTemplateDetailEntity detail =
                        createDetailEntity(template, 0, t);

                template.addDetail(detail);
            });
        }

        // 3️⃣ 결재 단계 처리
        dto.getApprovalSteps().forEach(stepDto -> {

            int step = stepDto.getStep();

            stepDto.getTargets().forEach(t -> {

                AppLineTemplateDetailEntity detail =
                        createDetailEntity(template, step, t);

                template.addDetail(detail);
            });
        });

        // 4️⃣ 저장
        appLineTemplateRepository.save(template);
    }

    // Detail 생성 로직
    private AppLineTemplateDetailEntity createDetailEntity(
            AppLineTemplateEntity template,
            int step,
            ApprovalTargetDto t
    ) {

        ApproverType type = ApproverType.valueOf(t.getType());

        AppLineTemplateDetailEntity.AppLineTemplateDetailEntityBuilder builder =
                AppLineTemplateDetailEntity.builder()
                        .template(template)
                        .stepOrder(step)
                        .approverType(type);

        // 타입별 분기 ⭐⭐⭐
        switch (type) {

            case USER -> {
                EmpEntity emp = adEmployeeRepository.findById(t.getId())
                        .orElseThrow(() -> new IllegalArgumentException("사원 없음"));
                builder.approver(emp);
            }

            case DEPT -> {
                DepartmentEntity dept = adDepartmentRepository.findById(Integer.valueOf(t.getId()))
                        .orElseThrow(() -> new IllegalArgumentException("부서 없음"));
                builder.department(dept);
            }

            case POSITION -> {
                PositionEntity pos = adPositionRepository.findById(Integer.valueOf(t.getId()))
                        .orElseThrow(() -> new IllegalArgumentException("직급 없음"));
                builder.minPosition(pos);
            }
        }

        return builder.build();
    }

    // 사원 목록 조회 (페이징 처리 X)
//    @Override
//    public List<ApprovalTargetEmployeeDto> searchEmployees(EmployeeSearchConditionDto conditionDto) {
//        return adEmployeeService.findEmployees(conditionDto)
//                .stream()
//                .map(emp -> new ApprovalTargetEmployeeDto(
//                        emp.getEmpNo(),
//                        emp.getName(),
//                        emp.getDeptName(),
//                        emp.getPositionName(),
//                        emp.getRoleName()
//                ))
//                .toList();
//    }

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
