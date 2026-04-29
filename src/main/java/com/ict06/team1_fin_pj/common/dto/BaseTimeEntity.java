/**
 * @FileName : BaseEntity.java
 * @Description : 모든 엔티티의 공통 필드(등록/수정시간) 자동 관리하는 베이스 클래스
 * @Author : 김다솜
 * @Date : 2026. 04. 23
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.23    김다솜        최초 생성/JPA Auditing 적용
 */

package com.ict06.team1_fin_pj.common.dto;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * [공통 엔티티]
 * 1. @MappedSuperclass: 자식 엔티티들이 이 클래스의 필드(createdAt, updatedAt)를 컬럼으로 인식하게 함
 * 2. @EntityListeners: JPA에게 해당 엔티티는 Auditing(자동 기록) 기능을 사용할 것임을 알림
 */
@Getter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public class BaseTimeEntity {

    @CreatedDate
    @Column(name = "created_at", updatable = false) //생성 시 자동 기록, 이후 수정 불가
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")    //수정 시 자동 갱신
    private LocalDateTime updatedAt;
}
