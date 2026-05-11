package com.ict06.team1_fin_pj.domain.approval.service;

import com.ict06.team1_fin_pj.common.dto.approval.*;
import com.ict06.team1_fin_pj.common.security.PrincipalDetails;
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
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

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
//    @Override
//    public Page<AppFormListDto> getAppFormsWithPaging(int page, int size) {
//        System.out.println("AdApprovalServiceImpl - getAppFormsWithPaging()");
//        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending()); // 페이지 번호와 크기 설정. 최신 순 정렬.
//        return appFormRepository.findAll(pageable); // 페이징된 결과 반환
//    }
    @Override
    @Transactional(readOnly = true)
    public Page<AppFormListDto> getAppFormsWithPaging(
            int page,
            int size
    ) {

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by("updatedAt").descending()
        );

        return appFormRepository
                .findAll(pageable)
                .map(form -> {

                    Optional<AppLineTemplateEntity>
                            lineTemplateOpt =

                            appLineTemplateRepository
                                    .findFirstByForm_FormId(
                                            form.getFormId()
                                    );

                    return AppFormListDto.builder()

                            .formId(form.getFormId())

                            .formName(form.getFormName())

                            .updatedAt(form.getUpdatedAt())

                            .lineTemplateId(
                                    lineTemplateOpt
                                            .map(AppLineTemplateEntity::getTemplateId)
                                            .orElse(null)
                            )

                            .lineTemplateName(
                                    lineTemplateOpt
                                            .map(AppLineTemplateEntity::getTemplateName)
                                            .orElse(null)
                            )

                            .build();
                });
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
    public void saveAppLineForm(AppLineRequestDto dto, PrincipalDetails principal) {

        // 로그인 정보에서 작성자 정보 가져오기
        EmpEntity loginEmp = principal.getEmpEntity();

        // 1️⃣ 템플릿 생성
        AppLineTemplateEntity template =
                AppLineTemplateEntity.builder()
                .templateName(dto.getTemplateName())
                .isDefault(
                        dto.getIsDefault() != null
                                ? dto.getIsDefault()
                                : false
                )
                .createdBy(loginEmp)
                .build();
        appLineTemplateRepository.save(template);

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

    // 결재선 서식의 Detail 추가 로직
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

    // list
    @Override
    @Transactional(readOnly = true)
    public Page<AppLineListDto> listAppLineForm(Pageable pageable) {
        return appLineTemplateRepository.findAll(pageable)
                .map(t -> AppLineListDto.builder()
                        .templateId(t.getTemplateId())
                        .templateName(t.getTemplateName())
                        .formName(
                                t.getForm() != null
                                        ? t.getForm().getFormName()
                                        : "-"
                        )
                        .createdBy( // 작성자: 이름(사번) 형식
                                t.getCreatedBy() != null
                                        ? t.getCreatedBy().getName()
                                        + "("
                                        + t.getCreatedBy().getEmpNo()
                                        + ")"
                                        : ""
                        )
                        .isDefault(t.getIsDefault())
                        .createdAt(t.getCreatedAt())
                        .build()
                );
    }

    // 결재선 서식 목록 조회
    @Override
    @Transactional(readOnly = true)
    public List<AppLineListDto> listAllAppLineTemplates(){

        return appLineTemplateRepository.findAll()
                .stream()
                .map(entity -> AppLineListDto.builder()
                        .templateId(entity.getTemplateId())
                        .templateName(entity.getTemplateName())
                        .isDefault(entity.getIsDefault())
                        .build()
                )
                .toList();
    }

    // 결재선 서식과 결재 서식 연결 저장
    @Transactional
    @Override
    public void applyLineTemplate(Integer formId, Integer templateId) {
        AppFormEntity form =
                appFormRepository.findById(formId)
                        .orElseThrow(() ->
                                new IllegalArgumentException("서식 없음"));

        AppLineTemplateEntity template =
                appLineTemplateRepository.findById(templateId)
                        .orElseThrow(() ->
                                new IllegalArgumentException("결재선 없음"));

        // 결재선 서식에 결재 서식 연결
        template.updateForm(form);
    }

    // 페이징 처리된 list로 받기
    @Override
    @Transactional(readOnly = true)
    public Page<AppLineListDto> getAppLineFormsWithPaging(
            int page,
            int size
    ) {

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "templateId")
        );

        Page<AppLineTemplateEntity> result =
                appLineTemplateRepository.findAll(pageable);

        return result.map(entity -> AppLineListDto.builder()
                .templateId(entity.getTemplateId())
                .templateName(entity.getTemplateName())
                .formName(
                        entity.getForm() != null
                                ? entity.getForm().getFormName()
                                : "-"
                )
                .isDefault(entity.getIsDefault())
                .createdAt(entity.getCreatedAt())
                .createdBy(
                        entity.getCreatedBy() != null
                                ? entity.getCreatedBy().getName()
                                + "("
                                + entity.getCreatedBy().getEmpNo()
                                + ")"
                                : "-"
                )
                .build());
    }

    // 1건 select (상세 화면)
    @Override
    @Transactional(readOnly = true)
    public AppLineDetailDto selectAppLineForm(Integer id) {
        AppLineTemplateEntity template =
                appLineTemplateRepository.findDetailById(id)
                        .orElseThrow(() -> new IllegalArgumentException("결재선 없음"));

        // step 기준 그룹핑
        Map<Integer, List<AppLineTemplateDetailEntity>> grouped =
                template.getDetails().stream()
                        .collect(Collectors.groupingBy(
                                AppLineTemplateDetailEntity::getStepOrder
                        ));

        List<AppLineStepDto> steps = grouped.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> {

                    List<AppLineTargetDto> targets =
                            entry.getValue().stream()
                                    .map(this::convertTargetDto)
                                    .toList();

                    return AppLineStepDto.builder()
//                            .stepOrder(entry.getKey())
                            .step(entry.getKey())
                            .targets(targets)
                            .build();
                })
                .toList();

        return AppLineDetailDto.builder()
                .templateId(template.getTemplateId())
                .templateName(template.getTemplateName())
                .formName(
                        template.getForm() != null
                                ? template.getForm().getFormName()
                                : "-"
                )
                .isDefault(template.getIsDefault())
                .steps(steps)
                .build();
    }

    // 대상 DTO로 변환
    private AppLineTargetDto convertTargetDto(
            AppLineTemplateDetailEntity detail
    ) {

//        String targetName = "-";
//        String departmentName = "";
//        String positionName = "";
//        String empNo = "";
        String id = "";
        String name = "-";
        String dept = "";
        String position = "";
        Integer positionId = 0;

        switch (detail.getApproverType()) {

            case USER -> {

                if (detail.getApprover() != null) {

                    EmpEntity emp = detail.getApprover();

//                    targetName = emp.getName();
//                    empNo = emp.getEmpNo();
                    id = emp.getEmpNo();
                    name = emp.getName();

                    if (emp.getDepartment() != null) {
//                        departmentName =
//                                emp.getDepartment().getDeptName();
                        dept = emp.getDepartment().getDeptName();
                    }

                    if (emp.getPosition() != null) {
//                        positionName =
//                                emp.getPosition().getPositionName();
                        position = emp.getPosition().getPositionName();
                        positionId = emp.getPosition().getPositionId(); // 직급 순서 이용하기 위해 id 필요
                    }
                }
            }

            case DEPT -> {

//                targetName =
//                        detail.getDepartment() != null
//                                ? detail.getDepartment().getDeptName()
//                                : "-";
                id = String.valueOf(detail.getDepartment().getDeptId());
                name = detail.getDepartment().getDeptName();
            }

            case POSITION -> {
//                targetName =
//                        detail.getMinPosition() != null
//                                ? detail.getMinPosition().getPositionName()
//                                : "-";
                if (detail.getMinPosition() != null) {
                    id = String.valueOf(detail.getMinPosition().getPositionId());
                    name = detail.getMinPosition().getPositionName();
                    positionId = detail.getMinPosition().getPositionId();
                }
            }
        }

//        return AppLineTargetDto.builder()
//                .type(detail.getApproverType().name())
//                .targetName(targetName)
//                .departmentName(departmentName)
//                .positionName(positionName)
//                .empNo(empNo)
//                .build();
        return AppLineTargetDto.builder()
                .id(id)
                .name(name)
                .dept(dept)
                .position(position)
                .positionId(positionId)
                .type(detail.getApproverType().name())
                .build();
    }

    // delete
    @Override
    @Transactional
    public void deleteAppLineTemplate(int id) {

        AppLineTemplateEntity template =
                appLineTemplateRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException("결재선 서식 없음"));

        appLineTemplateRepository.delete(template);
    }

    // update
//    @Override
//    public void updateAppLineTemplate(AppLineTemplateEntity entity) {
//
//    }
    @Transactional
    @Override
    public void updateAppLineForm(
            Integer templateId,
            AppLineRequestDto dto,
            PrincipalDetails principal
    ) {

        AppLineTemplateEntity template =
                appLineTemplateRepository.findDetailById(templateId)
                        .orElseThrow(() ->
                                new IllegalArgumentException("결재선 없음"));

        // 1. 기본 정보 수정
        template.updateNameIsDefault(dto.getTemplateName(), dto.getIsDefault());
//        template.setTemplateName(dto.getFormName());
//
//        template.setDescription(dto.getDescription());
//
//        template.setIsDefault(dto.getIsDefault());

        // 2. 기존 detail 제거
        template.getDetails().clear();
        // flush 시 orphanRemoval=true 라면 삭제됨

        // 3. 참조 대상 재삽입
        if (dto.getRefTargets() != null) {

            dto.getRefTargets().forEach(t -> {

                AppLineTemplateDetailEntity detail =
                        createDetailEntity(
                                template,
                                0,
                                t
                        );

                template.addDetail(detail);
            });
        }

        // 4. 결재 단계 재삽입
        dto.getApprovalSteps().forEach(stepDto -> {

            int step = stepDto.getStep();

            stepDto.getTargets().forEach(t -> {

                AppLineTemplateDetailEntity detail =
                        createDetailEntity(
                                template,
                                step,
                                t
                        );

                template.addDetail(detail);
            });
        });
    }


}
