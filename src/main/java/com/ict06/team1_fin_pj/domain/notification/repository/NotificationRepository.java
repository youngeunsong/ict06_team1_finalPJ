/**
 * @FileName : NotificationRepository.java
 * @Description : 알림 데이터(DB) 접근을 위한 JPA 레포지토리
 * @Author : 김다솜
 * @Date : 2026. 04. 23
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.23    김다솜        최초 생성/사원별 최신 알림 조회 및 미읽음 카운트 추가
 * @ 2026.05.08    김다솜        알림 전체 읽음 및 삭제 처리를 위한 사원별 조회 메서드 추가
 */

package com.ict06.team1_fin_pj.domain.notification.repository;

import com.ict06.team1_fin_pj.domain.notification.entity.NotificationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<NotificationEntity, Integer> {
    //특정 사원의 알림 목록 조회(최신순)
    List<NotificationEntity> findByEmployee_EmpNoOrderByCreatedAtDesc(String empNo);

    //읽지 않은 알림 개수
    long countByEmployee_EmpNoAndIsRead(String empNo, Boolean isRead);

    List<NotificationEntity> findByEmployee_EmpNoAndIsRead(String empNo, Boolean isRead);

    List<NotificationEntity> findByEmployee_EmpNo(String empNo);
}
