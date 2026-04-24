package com.ict06.team1_fin_pj.common.dto;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "NOTIFICATION")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class NotificationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "noti_id")
    private Integer notiId;

    @Column(name = "emp_no", nullable = false, length = 20)
    private String empNo;

    @Column(name = "noti_type", nullable = false, length = 20)
    private String notiType;

    @Column(name = "title", nullable = false, length = 100)
    private String title;

    @Column(name = "message")
    private String content;

    @Column(name = "url", length = 500)
    private String url;

    @Column(name = "is_read", length = 1)
    private String isRead;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @CreatedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // NotificationEntity.java 안에 추가 (Dirty Checking 활용)
    public void markRead() {
        this.isRead = "Y";
    }
}
