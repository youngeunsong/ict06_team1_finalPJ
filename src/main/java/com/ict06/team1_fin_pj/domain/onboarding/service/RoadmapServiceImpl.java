/**
 * @FileName : RoadmapServiceImpl.java
 * @Description : AI 온보딩 로드맵 Service
 *                - 사원별 온보딩 로드맵 조회
 *                - 로드맵이 없는 경우 기본 로드맵 자동 생성
 *                - ROAD_ITEM 및 ROAD_PROGRESS 초기 데이터 생성
 * @Author : 김다솜
 * @Date : 2026. 05. 02
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.05.02    김다솜        최초 생성 및 사원별 로드맵 조회/생성 로직 구현
 */

package com.ict06.team1_fin_pj.domain.onboarding.service;

import com.ict06.team1_fin_pj.common.dto.onboarding.RoadmapGroupResponse;
import com.ict06.team1_fin_pj.common.dto.onboarding.RoadmapItemResponse;
import com.ict06.team1_fin_pj.common.dto.onboarding.RoadmapResponse;
import com.ict06.team1_fin_pj.domain.auth.repository.EmpRepository;
import com.ict06.team1_fin_pj.domain.employee.entity.EmpEntity;
import com.ict06.team1_fin_pj.domain.onboarding.entity.*;
import com.ict06.team1_fin_pj.domain.onboarding.repository.OnContentRepository;
import com.ict06.team1_fin_pj.domain.onboarding.repository.RoadItemRepository;
import com.ict06.team1_fin_pj.domain.onboarding.repository.RoadProgressRepository;
import com.ict06.team1_fin_pj.domain.onboarding.repository.RoadmapRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoadmapServiceImpl {

    private final EmpRepository empRepository;
    private final RoadmapRepository roadmapRepository;
    private final RoadItemRepository roadItemRepository;
    private final RoadProgressRepository roadProgressRepository;
    private final OnContentRepository onContentRepository;

    /**
     * @MethodName : getOrCreateRoadmap
     * @Description : 사번 기준 로드맵을 조회하고, 없으면 기본 로드맵을 생성
     *
     * @param empNo 사번
     * @return 온보딩 로드맵 응답 DTO
     */
    @Transactional
    public RoadmapResponse getOrCreateRoadmap(String empNo) {

        EmpEntity emp = empRepository.findByEmpNo(empNo)
                .orElseThrow(() -> new RuntimeException("사원 없음"));

        RoadmapEntity roadmap = roadmapRepository
                .findFirstByEmployee_EmpNoOrderByRoadmapIdDesc(empNo)
                .orElseGet(() -> createDefaultRoadmap(emp));

        return buildRoadmapResponse(empNo, roadmap);
    }

    /**
     * @MethodName : createDefaultRoadmap
     * @Description : 신규 사원용 기본 온보딩 로드맵 생성
     *                - ROADMAP 생성
     *                - ROAD_ITEM 생성
     *                - ROAD_PROGRESS 초기 상태 생성
     *
     * @param emp 사원 Entity
     * @return 생성된 로드맵 Entity
     */
    private RoadmapEntity createDefaultRoadmap(EmpEntity emp) {
        RoadmapEntity roadmap = RoadmapEntity.builder()
                .title("테스트 온보딩 로드맵")
                .employee(emp)
                .generatedType(GeneratedType.AI)
                .version(1)
                .isCompleted(false)
                .build();

        RoadmapEntity savedRoadmap = roadmapRepository.save(roadmap);

        createItem(savedRoadmap, emp, 1, "필수이수교육", 1);
        createItem(savedRoadmap, emp, 2, "필수이수교육", 2);
        createItem(savedRoadmap, emp, 3, "필수이수교육", 3);
        createItem(savedRoadmap, emp, 4, "필수이수교육", 4);

        createItem(savedRoadmap, emp, 12, "직무교육 (백엔드)", 5);
        createItem(savedRoadmap, emp, 13, "직무교육 (백엔드)", 6);
        createItem(savedRoadmap, emp, 14, "직무교육 (백엔드)", 7);
        createItem(savedRoadmap, emp, 15, "직무교육 (백엔드)", 8);

        createItem(savedRoadmap, emp, 19, "직무교육 (프론트엔드)", 9);
        createItem(savedRoadmap, emp, 20, "직무교육 (프론트엔드)", 10);
        createItem(savedRoadmap, emp, 21, "직무교육 (프론트엔드)", 11);
        createItem(savedRoadmap, emp, 22, "직무교육 (프론트엔드)", 12);

        createItem(savedRoadmap, emp, 18, "심화교육", 13);
        createItem(savedRoadmap, emp, 16, "심화교육", 14);

        createItem(savedRoadmap, emp, 9, "AI 활용 교육", 15);
        createItem(savedRoadmap, emp, 11, "AI 활용 교육", 16);
        createItem(savedRoadmap, emp, 23, "AI 활용 교육", 17);

        return savedRoadmap;
    }

    /**
     * @MethodName : createItem
     * @Description : 로드맵 아이템과 해당 사원의 진행률 초기 데이터를 생성
     */
    private void createItem(
            RoadmapEntity roadmap,
            EmpEntity emp,
            Integer contentId,
            String categoryName,
            Integer orderNo
    ) {
        OnContentEntity content = onContentRepository.findById(contentId)
                .orElseThrow(() -> new RuntimeException("콘텐츠 없음: " + contentId));

        RoadItemEntity item = RoadItemEntity.builder()
                .roadmap(roadmap)
                .content(content)
                .itemTitle(content.getTitle())
                .categoryName(categoryName)
                .orderNo(orderNo)
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

    /**
     * @MethodName : buildRoadmapResponse
     * @Description : DB 로드맵 데이터를 프론트 렌더링용 그룹 구조로 변환
     */
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
                            .category_name(item.getCategoryName())
                            .order_no(item.getOrderNo())
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
}
