/**
 * @FileName : RoadmapServiceImpl.java
 * @Description : 개인 맞춤형 온보딩 로드맵 생성 및 관리 Service
 *                - 사원의 부서/직급/직무에 따른 추천 알고리즘 및 로드맵 재생성 로직 담당
 * @Author : 김다솜
 * @Date : 2026. 05. 07
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.05.07    김다솜        최초 생성/개인별 맞춤 추천 알고리즘(selectRoadmapContents) 구현
 * @ 2026.05.11    김다솜        로드맵 자동 재생성 시 추천 사유 시각화 및 진행 상태 초기화 로직 보완
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
        List<OnContentEntity> contents = onContentRepository.findAll();

        List<OnContentEntity> selectedContents = contents.stream()
                .filter(content -> Boolean.TRUE.equals(content.getIsMandatory()) || matchesEmployeeTarget(content, emp))
                .sorted(roadmapContentComparator(emp))
                .toList();

        if (!selectedContents.isEmpty()) {
            return selectedContents;
        }

        return contents.stream()
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
                                    item.getRecommendationReason() != null && !item.getRecommendationReason().isBlank()
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
            reasons.add("필수 학습 콘텐츠입니다.");
        }

        if (matchesEmployeeDepartment(content, emp) && emp.getDepartment() != null) {
            reasons.add(emp.getDepartment().getDeptName() + " 대상 추천입니다.");
        }

        if (matchesEmployeePosition(content, emp) && emp.getPosition() != null) {
            reasons.add(emp.getPosition().getPositionName() + " 직무와 연관된 콘텐츠입니다.");
        }

        String targetPosition = normalize(content.getTargetPosition());
        if (reasons.isEmpty() && "공통".equals(content.getTargetPosition())) {
            reasons.add("전사 공통 온보딩 과정입니다.");
        } else if (reasons.isEmpty() && !targetPosition.isBlank()) {
            reasons.add(content.getTargetPosition() + " 기준으로 추천된 콘텐츠입니다.");
        }

        if (content.getDifficulty() != null) {
            reasons.add("난이도는 " + content.getDifficulty().name() + " 수준입니다.");
        }

        return String.join(" ", reasons);
    }
}
