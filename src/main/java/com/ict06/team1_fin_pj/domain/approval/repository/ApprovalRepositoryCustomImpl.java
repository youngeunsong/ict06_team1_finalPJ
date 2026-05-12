package com.ict06.team1_fin_pj.domain.approval.repository;

import com.ict06.team1_fin_pj.common.dto.approval.ApprovalListResponseDto;
import com.ict06.team1_fin_pj.domain.approval.entity.ApprovalStatus;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;

import static com.ict06.team1_fin_pj.domain.approval.entity.QAppLineEntity.appLineEntity;
import static com.ict06.team1_fin_pj.domain.approval.entity.QApprovalEntity.approvalEntity;

/**
 * 결재 문서 목록 조회를 담당하는 QueryDSL Repository 구현체입니다.
 *
 * 개인 문서함/임시저장함은 작성자, 상태, 삭제 여부, 정렬, 페이징 조건이 함께 필요하므로
 * 단순 JpaRepository 메서드명 쿼리보다 QueryDSL로 명시적으로 작성했습니다.
 */
@Repository
@RequiredArgsConstructor
public class ApprovalRepositoryCustomImpl implements ApprovalRepositoryCustom {

    /*
     * QueryDSL 쿼리를 생성하는 핵심 객체입니다.
     * 복잡한 조건 조립, DTO 직접 조회, 페이징 쿼리를 타입 안정성 있게 작성할 수 있습니다.
     */
    private final JPAQueryFactory queryFactory;

    /**
     * 로그인 사용자가 작성한 결재 문서 목록을 조회합니다.
     *
     * status가 있으면 해당 상태만 조회하고,
     * status가 없으면 임시저장(DRAFT)을 제외한 모든 문서를 조회합니다.
     */
    @Override
    public Page<ApprovalListResponseDto> findMyDocuments(
            String writerNo,
            ApprovalStatus status,
            Pageable pageable
    ) {
        // 모든 개인 문서함 조회는 "작성자 본인 + 삭제되지 않은 문서" 조건에서 시작합니다.
        BooleanBuilder builder = baseWriterCondition(writerNo);

        if (status != null) {
            // 상태 필터가 있으면 해당 상태만 조회합니다.
            builder.and(approvalEntity.status.eq(status));
        } else {
            // 개인 문서함 기본 조회에서는 임시저장 문서를 제외합니다.
            // 임시저장은 별도 메뉴인 /drafts에서만 조회합니다.
            builder.and(approvalEntity.status.ne(ApprovalStatus.DRAFT));
        }

        return fetchPage(builder, pageable);
    }

    /**
     * 로그인 사용자가 임시저장한 문서만 조회합니다.
     *
     * 임시저장함은 항상 DRAFT 상태만 보여주므로 별도의 상태 파라미터를 받지 않습니다.
     */
    @Override
    public Page<ApprovalListResponseDto> findMyDrafts(
            String writerNo,
            Pageable pageable
    ) {
        BooleanBuilder builder = baseWriterCondition(writerNo)
                .and(approvalEntity.status.eq(ApprovalStatus.DRAFT));

        return fetchPage(builder, pageable);
    }

    /**
     * 로그인 사용자가 참조자로 포함된 결재 문서 목록을 조회합니다.
     *
     * stepOrder=0은 결재 순서에 참여하지 않는 참조 대상을 의미합니다.
     * 참조자는 임시저장 문서까지 볼 수 있으면 안 되므로 DRAFT 상태는 항상 제외합니다.
     */
    @Override
    public Page<ApprovalListResponseDto> findMyReferencedDocuments(
            String referenceNo,
            ApprovalStatus status,
            Pageable pageable
    ) {
        BooleanBuilder builder = baseReferenceCondition(referenceNo);

        if (status != null) {
            builder.and(approvalEntity.status.eq(status));
        }

        // status 파라미터가 DRAFT로 들어오더라도 참조 문서함에서는 임시저장 문서를 제외합니다.
        builder.and(approvalEntity.status.ne(ApprovalStatus.DRAFT));

        return fetchReferencedPage(builder, pageable);
    }

    /**
     * 개인 문서함 계열 조회에서 항상 적용해야 하는 공통 조건입니다.
     *
     * writerNo 조건으로 다른 사람 문서가 노출되지 않게 하고,
     * isDeleted=false 조건으로 삭제 처리된 문서를 제외합니다.
     */
    private BooleanBuilder baseWriterCondition(String writerNo) {
        return new BooleanBuilder()
                .and(approvalEntity.writer.empNo.eq(writerNo))
                .and(approvalEntity.isDeleted.isFalse());
    }

    /**
     * 참조 문서함 조회에서 항상 적용해야 하는 공통 조건입니다.
     *
     * APP_LINE.approver_no가 로그인 사용자이고 step_order가 0이면,
     * 해당 사용자는 결재자가 아니라 참조자로 문서 열람 권한을 가집니다.
     */
    private BooleanBuilder baseReferenceCondition(String referenceNo) {
        return new BooleanBuilder()
                .and(appLineEntity.approver.empNo.eq(referenceNo))
                .and(appLineEntity.stepOrder.eq(0))
                .and(approvalEntity.isDeleted.isFalse());
    }

    /**
     * 실제 목록 데이터와 전체 건수를 조회해 Page 객체로 변환합니다.
     *
     * Spring Data Page는 content와 total count를 함께 필요로 하므로
     * 목록 조회 쿼리와 count 쿼리를 분리해서 실행합니다.
     */
    private Page<ApprovalListResponseDto> fetchPage(
            BooleanBuilder builder,
            Pageable pageable
    ) {
        // 목록 화면에서 필요한 필드만 DTO로 직접 조회합니다.
        // Entity 전체를 가져오지 않아 불필요한 연관관계 로딩을 줄일 수 있습니다.
        List<ApprovalListResponseDto> content = queryFactory
                .select(Projections.fields(
                        ApprovalListResponseDto.class,
                        approvalEntity.approvalId,
                        approvalEntity.form.formId,
                        approvalEntity.form.formName,
                        approvalEntity.writer.empNo.as("writerNo"),
                        approvalEntity.writer.name.as("writerName"),
                        approvalEntity.title,
                        approvalEntity.status,
                        approvalEntity.currentStep,
                        approvalEntity.maxStep,
                        approvalEntity.currentApprover.empNo.as("currentApproverNo"),
                        approvalEntity.currentApprover.name.as("currentApproverName"),
                        approvalEntity.createdAt,
                        approvalEntity.updatedAt
                ))
                .from(approvalEntity)
                // 결재 양식명과 현재 결재자 이름을 목록에서 바로 보여주기 위해 left join합니다.
                // 임시저장/완료 문서는 currentApprover가 없을 수 있으므로 left join을 사용합니다.
                .leftJoin(approvalEntity.form)
                .leftJoin(approvalEntity.writer)
                .leftJoin(approvalEntity.currentApprover)
                .where(builder)
                // 사용자가 최근 수정한 임시저장/문서를 먼저 볼 수 있도록 updatedAt 내림차순 정렬합니다.
                .orderBy(approvalEntity.updatedAt.desc(), approvalEntity.approvalId.desc())
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        // Page 응답에는 전체 건수가 필요하므로 목록 조회와 동일한 조건으로 count 쿼리를 실행합니다.
        Long countResult = queryFactory
                .select(approvalEntity.count())
                .from(approvalEntity)
                .where(builder)
                .fetchOne();

        long total = countResult != null ? countResult : 0;

        return new PageImpl<>(content, pageable, total);
    }

    /**
     * 참조 문서함 전용 페이징 조회입니다.
     *
     * 작성자 기준 조회와 달리 APP_LINE을 함께 조인해야 하므로 별도 메서드로 분리했습니다.
     */
    private Page<ApprovalListResponseDto> fetchReferencedPage(
            BooleanBuilder builder,
            Pageable pageable
    ) {
        List<ApprovalListResponseDto> content = queryFactory
                .selectDistinct(Projections.fields(
                        ApprovalListResponseDto.class,
                        approvalEntity.approvalId,
                        approvalEntity.form.formId,
                        approvalEntity.form.formName,
                        approvalEntity.writer.empNo.as("writerNo"),
                        approvalEntity.writer.name.as("writerName"),
                        approvalEntity.title,
                        approvalEntity.status,
                        approvalEntity.currentStep,
                        approvalEntity.maxStep,
                        approvalEntity.currentApprover.empNo.as("currentApproverNo"),
                        approvalEntity.currentApprover.name.as("currentApproverName"),
                        approvalEntity.createdAt,
                        approvalEntity.updatedAt
                ))
                .from(approvalEntity)
                .join(approvalEntity.lines, appLineEntity)
                .leftJoin(approvalEntity.form)
                .leftJoin(approvalEntity.writer)
                .leftJoin(approvalEntity.currentApprover)
                .where(builder)
                .orderBy(approvalEntity.updatedAt.desc(), approvalEntity.approvalId.desc())
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        Long countResult = queryFactory
                .select(approvalEntity.approvalId.countDistinct())
                .from(approvalEntity)
                .join(approvalEntity.lines, appLineEntity)
                .where(builder)
                .fetchOne();

        long total = countResult != null ? countResult : 0;

        return new PageImpl<>(content, pageable, total);
    }
}
