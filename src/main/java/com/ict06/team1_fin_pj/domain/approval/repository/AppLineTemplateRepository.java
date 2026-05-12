package com.ict06.team1_fin_pj.domain.approval.repository;

import com.ict06.team1_fin_pj.domain.approval.entity.AppLineTemplateEntity;
import lombok.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * @author : 송영은$
 * description : 결재선 템플릿용 리포지토리
 * ========================================
 * DATE         AUTHOR      NOTE
 * 2026-05-06   송영은       최초 생성
 **/
@Repository
public interface AppLineTemplateRepository extends JpaRepository<AppLineTemplateEntity, Integer> {

    @NonNull
    Page<AppLineTemplateEntity> findAll(@NonNull Pageable pageable);

    // 상세 조회용 fetch join
    // fetch join(페치 조인)은 JPA(JPQL)에서 연관된 엔티티나 컬렉션을 한 번의 SQL 쿼리로 함께 조회하여
    // 지연 로딩(Lazy Loading) 시 발생하는 N+1 문제를 해결하고 성능을 최적화하는 기능
    // N+1 문제 해결: 연관된 데이터를 가져오기 위해 추가로 발생하는 \(N\)번의 쿼리를 1번의 조인 쿼리로
    @Query("""
        SELECT DISTINCT t
        FROM AppLineTemplateEntity t
        LEFT JOIN FETCH t.details d
        LEFT JOIN FETCH d.approver
        LEFT JOIN FETCH d.department
        LEFT JOIN FETCH d.minPosition
        LEFT JOIN FETCH t.createdBy
        LEFT JOIN FETCH t.form
        WHERE t.templateId = :id
    """)
    Optional<AppLineTemplateEntity> findDetailById(@Param("id") Integer id);

    // 기본 템플릿 불러오기
    Optional<AppLineTemplateEntity> findFirstByForm_FormId(Integer formId); //findFirstByForm_FormId. TODO: isDefault 기준으로 찾기

}
