/**
 * @FileName : RoadmapServiceImpl.java
 * @Description : ???ル봿?????轅붽틓???????????⑥쥓????黎??筌??醫됲뀭???Β?堉????袁⑸즴?????????댁삩???Service
 *                - ?????????뉖????轅붽틓??????轅붽틓????勇???????덈폇??????살퓢癲??????????????黎??筌??醫됲뀭???Β?堉???????黎??筌??믨퀡???????
 * @Author : ?關?쒎첎????????ㅼ뒩??
 * @Date : 2026. 05. 07
 * @Modification_History
 * @
 * @ ????蹂κ텥???        ????蹂κ텥???       ????蹂κ텥??????쇨덧??
 * @ ----------    ---------    -------------------------------
 * @ 2026.05.07    ?關?쒎첎????????ㅼ뒩??       ?轅붽틓????彛?????袁⑸즴??????ル봿????嶺뚮ㅏ援앯뙴??轅붽틓?????????살퓢癲???????????selectRoadmapContents) ??????삳눇?
 * @ 2026.05.11    ?關?쒎첎????????ㅼ뒩??       ?黎??筌??醫됲뀭???Β?堉????癲????????????살퓢癲?????? ??????????轅붽틓????筌뤾쑴??????釉먮빱???逆???⑸걦????黎??筌??믨퀡?????ㅼ뒧????
 */

package com.ict06.team1_fin_pj.domain.onboarding.service;

import com.ict06.team1_fin_pj.common.dto.onboarding.RoadmapGroupResponse;
import com.ict06.team1_fin_pj.common.dto.onboarding.RoadmapItemResponse;
import com.ict06.team1_fin_pj.common.dto.onboarding.RoadmapResponse;
import com.ict06.team1_fin_pj.domain.auth.repository.EmpRepository;
import com.ict06.team1_fin_pj.domain.employee.entity.EmpEntity;
import com.ict06.team1_fin_pj.domain.onboarding.entity.GeneratedType;
import com.ict06.team1_fin_pj.domain.onboarding.entity.OnContentEntity;
import com.ict06.team1_fin_pj.domain.onboarding.entity.ProgressStatus;
import com.ict06.team1_fin_pj.domain.onboarding.entity.RoadItemEntity;
import com.ict06.team1_fin_pj.domain.onboarding.entity.RoadProgressEntity;
import com.ict06.team1_fin_pj.domain.onboarding.entity.RoadmapEntity;
import com.ict06.team1_fin_pj.domain.onboarding.repository.OnContentRepository;
import com.ict06.team1_fin_pj.domain.onboarding.repository.RoadItemRepository;
import com.ict06.team1_fin_pj.domain.onboarding.repository.RoadProgressRepository;
import com.ict06.team1_fin_pj.domain.onboarding.repository.RoadmapRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoadmapServiceImpl {

    private final EmpRepository empRepository;
    private final RoadmapRepository roadmapRepository;
    private final RoadItemRepository roadItemRepository;
    private final RoadProgressRepository roadProgressRepository;
    private final OnContentRepository onContentRepository;

    @Transactional
    public RoadmapResponse getOrCreateRoadmap(String empNo) {
        EmpEntity emp = empRepository.findByEmpNo(empNo)
                .orElseThrow(() -> new RuntimeException("Employee not found."));

        RoadmapEntity roadmap = roadmapRepository
                .findFirstByEmployee_EmpNoOrderByRoadmapIdDesc(empNo)
                .orElseGet(() -> createDefaultRoadmap(emp));

        List<RoadItemEntity> existingItems =
                roadItemRepository.findByRoadmap_RoadmapIdOrderByOrderNo(roadmap.getRoadmapId());

        if (existingItems.isEmpty()) {
            roadmap = createDefaultRoadmap(emp);
        }

        return buildRoadmapResponse(empNo, roadmap);
    }

    @Transactional
    public RoadmapEntity regenerateRoadmap(String empNo) {
        EmpEntity emp = empRepository.findByEmpNo(empNo)
                .orElseThrow(() -> new RuntimeException("Employee not found."));

        return createDefaultRoadmap(emp);
    }

    @Transactional
    public RoadmapEntity resetAndRegenerateRoadmap(Integer roadmapId) {
        RoadmapEntity roadmap = roadmapRepository.findById(roadmapId)
                .orElseThrow(() -> new RuntimeException("Roadmap not found."));

        String empNo = roadmap.getEmployee().getEmpNo();
        roadProgressRepository.deleteByItem_Roadmap_RoadmapId(roadmapId);
        roadmapRepository.delete(roadmap);
        roadmapRepository.flush();

        EmpEntity emp = empRepository.findByEmpNo(empNo)
                .orElseThrow(() -> new RuntimeException("Employee not found."));

        return createDefaultRoadmap(emp);
    }

    private RoadmapEntity createDefaultRoadmap(EmpEntity emp) {
        RoadmapEntity roadmap = RoadmapEntity.builder()
                .title(emp.getName() + " Onboarding Roadmap")
                .employee(emp)
                .department(emp.getDepartment())
                .position(emp.getPosition())
                .generatedType(GeneratedType.MANUAL)
                .version(1)
                .isCompleted(false)
                .build();

        RoadmapEntity savedRoadmap = roadmapRepository.save(roadmap);

        List<OnContentEntity> recommendedContents = selectRoadmapContents(emp);
        int orderNo = 1;

        for (OnContentEntity content : recommendedContents) {
            createItem(
                    savedRoadmap,
                    emp,
                    content,
                    resolveCategoryName(content),
                    buildRecommendationReason(content, emp),
                    orderNo++
            );
        }

        return savedRoadmap;
    }

    private List<OnContentEntity> selectRoadmapContents(EmpEntity emp) {
        List<OnContentEntity> eligibleContents = onContentRepository.findAll().stream()
                .filter(content -> isEligibleForEmployee(content, emp))
                .toList();

        LinkedHashSet<OnContentEntity> selectedContents = new LinkedHashSet<>();

        eligibleContents.stream()
                .filter(content -> Boolean.TRUE.equals(content.getIsMandatory()))
                .sorted(roadmapContentComparator(emp))
                .forEach(selectedContents::add);

        eligibleContents.stream()
                .filter(content -> matchesEmployeeTarget(content, emp))
                .sorted(roadmapContentComparator(emp))
                .forEach(selectedContents::add);

        eligibleContents.stream()
                .filter(this::isCommonContent)
                .sorted(roadmapContentComparator(emp))
                .forEach(selectedContents::add);

        if (!selectedContents.isEmpty()) {
            return selectedContents.stream().toList();
        }

        return eligibleContents.stream()
                .filter(this::isCommonContent)
                .sorted(roadmapContentComparator(emp))
                .toList();
    }

    private Comparator<OnContentEntity> roadmapContentComparator(EmpEntity emp) {
        return Comparator
                .comparing((OnContentEntity content) -> !Boolean.TRUE.equals(content.getIsMandatory()))
                .thenComparing(content -> !matchesEmployeeTarget(content, emp))
                .thenComparing(content -> nullToEmpty(content.getCategory()))
                .thenComparing(content -> content.getDifficulty() != null ? content.getDifficulty().ordinal() : 99)
                .thenComparing(OnContentEntity::getContentId);
    }

    private boolean matchesEmployeeTarget(OnContentEntity content, EmpEntity emp) {
        if (matchesEmployeePosition(content, emp)) {
            return true;
        }

        if (matchesEmployeeDepartment(content, emp)) {
            return true;
        }

        String targetPosition = normalize(content.getTargetPosition());

        if (targetPosition.isBlank()) {
            return false;
        }

        List<String> employeeKeywords = new ArrayList<>();
        employeeKeywords.add(emp.getDepartment() != null ? emp.getDepartment().getDeptName() : null);
        employeeKeywords.add(emp.getPosition() != null ? emp.getPosition().getPositionName() : null);
        employeeKeywords.add(emp.getStatus());

        return employeeKeywords.stream()
                .filter(Objects::nonNull)
                .map(this::normalize)
                .filter(keyword -> !keyword.isBlank())
                .anyMatch(keyword -> targetPosition.contains(keyword) || keyword.contains(targetPosition));
    }

    private boolean isEligibleForEmployee(OnContentEntity content, EmpEntity emp) {
        if (!isDevelopmentTrack(emp) && isDevelopmentCategory(content)) {
            return false;
        }

        if (!isDesignTrack(emp) && isDesignCategory(content)) {
            return false;
        }

        return true;
    }

    private boolean isDevelopmentTrack(EmpEntity emp) {
        List<String> employeeKeywords = List.of(
                emp.getDepartment() != null ? emp.getDepartment().getDeptName() : null,
                emp.getDepartment() != null && emp.getDepartment().getParentDept() != null
                        ? emp.getDepartment().getParentDept().getDeptName()
                        : null,
                emp.getPosition() != null ? emp.getPosition().getPositionName() : null
        );

        return employeeKeywords.stream()
                .filter(Objects::nonNull)
                .map(this::normalize)
                .anyMatch(keyword ->
                        keyword.contains("\uAC1C\uBC1C")
                                || keyword.contains("backend")
                                || keyword.contains("frontend")
                                || keyword.contains("\uBC31\uC5D4\uB4DC")
                                || keyword.contains("\uD504\uB860\uD2B8")
                                || keyword.contains("engineer")
                                || keyword.contains("\uC5D4\uC9C0\uB2C8\uC5B4")
                );
    }

    private boolean isDevelopmentCategory(OnContentEntity content) {
        return contentMatchesAnyKeyword(
                content,
                List.of("\uAC1C\uBC1C", "backend", "frontend", "\uBC31\uC5D4\uB4DC", "\uD504\uB860\uD2B8", "spring", "jpa", "redis", "react", "api")
        );
    }

    private boolean isDesignTrack(EmpEntity emp) {
        List<String> employeeKeywords = List.of(
                emp.getDepartment() != null ? emp.getDepartment().getDeptName() : null,
                emp.getDepartment() != null && emp.getDepartment().getParentDept() != null
                        ? emp.getDepartment().getParentDept().getDeptName()
                        : null,
                emp.getPosition() != null ? emp.getPosition().getPositionName() : null
        );

        return employeeKeywords.stream()
                .filter(Objects::nonNull)
                .map(this::normalize)
                .anyMatch(keyword ->
                        keyword.contains("\uB514\uC790\uC778")
                                || keyword.contains("design")
                                || keyword.contains("ux")
                                || keyword.contains("ui")
                );
    }

    private boolean isDesignCategory(OnContentEntity content) {
        return contentMatchesAnyKeyword(
                content,
                List.of("\uB514\uC790\uC778", "design", "ux", "ui", "figma", "prototype", "qa")
        );
    }

    private boolean isCommonContent(OnContentEntity content) {
        String category = nullToEmpty(content.getCategory()).trim();
        String targetPosition = nullToEmpty(content.getTargetPosition()).trim();

        return "\uC804\uC0AC".equals(category) || "\uACF5\uD1B5".equals(targetPosition);
    }

    private boolean matchesEmployeePosition(OnContentEntity content, EmpEntity emp) {
        if (emp.getPosition() == null || content.getTargetPositions().isEmpty()) {
            return false;
        }

        Integer employeePositionId = emp.getPosition().getPositionId();

        return content.getTargetPositions().stream()
                .anyMatch(position -> position.getPositionId().equals(employeePositionId));
    }

    private boolean matchesEmployeeDepartment(OnContentEntity content, EmpEntity emp) {
        if (emp.getDepartment() == null || content.getTargetDepartments().isEmpty()) {
            return false;
        }

        Integer employeeDepartmentId = emp.getDepartment().getDeptId();

        return content.getTargetDepartments().stream()
                .anyMatch(department -> department.getDeptId().equals(employeeDepartmentId));
    }

    private String resolveCategoryName(OnContentEntity content) {
        if (content.getCategory() != null && !content.getCategory().isBlank()) {
            return content.getCategory();
        }

        return Boolean.TRUE.equals(content.getIsMandatory())
                ? "Mandatory Training"
                : "Job Training";
    }

    private String normalize(String value) {
        return value == null ? "" : value.replaceAll("\\s+", "").toLowerCase();
    }

    private String nullToEmpty(String value) {
        return value == null ? "" : value;
    }

    private boolean contentMatchesAnyKeyword(OnContentEntity content, List<String> keywords) {
        List<String> contentKeywords = new ArrayList<>();
        contentKeywords.add(content.getCategory());
        contentKeywords.add(content.getSubCategory());
        contentKeywords.add(content.getTargetPosition());
        contentKeywords.add(content.getTitle());
        contentKeywords.addAll(
                content.getTargetDepartments().stream()
                        .map(department -> department != null ? department.getDeptName() : null)
                        .toList()
        );

        List<String> normalizedContentKeywords = contentKeywords.stream()
                .filter(Objects::nonNull)
                .map(this::normalize)
                .filter(keyword -> !keyword.isBlank())
                .toList();

        return keywords.stream()
                .map(this::normalize)
                .anyMatch(expected -> normalizedContentKeywords.stream().anyMatch(value -> value.contains(expected)));
    }

    private void validateRoadmapEligibleEmployee(EmpEntity emp) {
        if (isAdminEmployee(emp)) {
            throw new IllegalStateException("Administrator accounts are not eligible for onboarding roadmaps.");
        }
    }

    private boolean isAdminEmployee(EmpEntity emp) {
        return emp.getRole() != null
                && emp.getRole().getRoleName() != null
                && normalize(emp.getRole().getRoleName()).contains("admin");
    }

    private void createItem(
            RoadmapEntity roadmap,
            EmpEntity emp,
            OnContentEntity content,
            String categoryName,
            String recommendationReason,
            Integer orderNo
    ) {
        LocalDate startDate = LocalDate.now().plusDays((long) (orderNo - 1) * 3);
        LocalDate dueDate = startDate.plusDays(2);

        RoadItemEntity item = RoadItemEntity.builder()
                .roadmap(roadmap)
                .content(content)
                .itemTitle(content.getTitle())
                .recommendationReason(recommendationReason)
                .categoryName(categoryName)
                .orderNo(orderNo)
                .startDate(startDate)
                .dueDate(dueDate)
                .build();

        RoadItemEntity savedItem = roadItemRepository.save(item);

        RoadProgressEntity progress = RoadProgressEntity.builder()
                .employee(emp)
                .item(savedItem)
                .status(ProgressStatus.NOT_STARTED)
                .rate(BigDecimal.ZERO)
                .build();

        roadProgressRepository.save(progress);
    }

    private RoadmapResponse buildRoadmapResponse(String empNo, RoadmapEntity roadmap) {
        List<RoadItemEntity> items =
                roadItemRepository.findByRoadmap_RoadmapIdOrderByOrderNo(roadmap.getRoadmapId());

        List<RoadmapItemResponse> itemResponses = items.stream()
                .map(item -> {
                    RoadProgressEntity progress = roadProgressRepository
                            .findByEmployee_EmpNoAndItem_ItemId(empNo, item.getItemId())
                            .orElse(null);

                    return RoadmapItemResponse.builder()
                            .item_id(item.getItemId())
                            .content_id(item.getContent().getContentId())
                            .item_title(item.getItemTitle())
                            .recommendation_reason(
                                    isReadableRecommendationReason(item.getRecommendationReason())
                                            ? item.getRecommendationReason()
                                            : buildRecommendationReason(item.getContent(), roadmap.getEmployee())
                            )
                            .category_name(item.getCategoryName())
                            .order_no(item.getOrderNo())
                            .start_date(item.getStartDate())
                            .due_date(item.getDueDate())
                            .status(progress != null ? progress.getStatus().name() : "NOT_STARTED")
                            .rate(progress != null ? progress.getRate() : BigDecimal.ZERO)
                            .build();
                })
                .toList();

        Map<String, List<RoadmapItemResponse>> grouped =
                itemResponses.stream().collect(Collectors.groupingBy(RoadmapItemResponse::getCategory_name));

        List<RoadmapGroupResponse> groups = grouped.entrySet().stream()
                .map(entry -> RoadmapGroupResponse.builder()
                        .category_name(entry.getKey())
                        .items(entry.getValue().stream()
                                .sorted(Comparator.comparing(RoadmapItemResponse::getOrder_no))
                                .toList())
                        .build())
                .sorted(Comparator.comparing(group -> group.getItems().get(0).getOrder_no()))
                .toList();

        return RoadmapResponse.builder()
                .recommended_roadmap(groups)
                .build();
    }

    private String buildRecommendationReason(OnContentEntity content, EmpEntity emp) {
        LinkedHashSet<String> reasons = new LinkedHashSet<>();

        if (Boolean.TRUE.equals(content.getIsMandatory())) {
            reasons.add("\uD544\uC218 \uD559\uC2B5 \uCF58\uD150\uCE20\uC785\uB2C8\uB2E4.");
        }

        if (matchesEmployeeDepartment(content, emp) && emp.getDepartment() != null) {
            reasons.add(emp.getDepartment().getDeptName() + " \uB300\uC0C1 \uCD94\uCC9C\uC785\uB2C8\uB2E4.");
        }

        if (matchesEmployeePosition(content, emp) && emp.getPosition() != null) {
            reasons.add(emp.getPosition().getPositionName() + " \uC9C1\uBB34\uC640 \uC5F0\uAD00\uB41C \uCF58\uD150\uCE20\uC785\uB2C8\uB2E4.");
        }

        String targetPosition = normalize(content.getTargetPosition());
        if (reasons.isEmpty() && "\uACF5\uD1B5".equals(content.getTargetPosition())) {
            reasons.add("\uC804\uC0AC \uACF5\uD1B5 \uC628\uBCF4\uB529 \uACFC\uC815\uC785\uB2C8\uB2E4.");
        } else if (reasons.isEmpty() && !targetPosition.isBlank()) {
            reasons.add(content.getTargetPosition() + " \uAE30\uC900\uC73C\uB85C \uCD94\uCC9C\uB41C \uCF58\uD150\uCE20\uC785\uB2C8\uB2E4.");
        }

        if (content.getDifficulty() != null) {
            reasons.add("\uB09C\uC774\uB3C4\uB294 " + content.getDifficulty().name() + " \uB2E8\uACC4\uC785\uB2C8\uB2E4.");
        }

        return String.join(" ", reasons);
    }

    private boolean isReadableRecommendationReason(String value) {
        if (value == null || value.isBlank()) {
            return false;
        }

        return !value.contains("�")
                && !value.contains("??")
                && !value.contains("?袁")
                && value.codePoints().filter(Character::isLetterOrDigit).count() >= 4;
    }
}




