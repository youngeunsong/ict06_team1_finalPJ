package com.ict06.team1_fin_pj.domain.notification.entity;

import com.ict06.team1_fin_pj.common.dto.BaseTimeEntity;
import com.ict06.team1_fin_pj.domain.employee.entity.EmpEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "NOTIFICATION")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationEntity extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "noti_id")
    private Integer notiId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "emp_no", nullable = false)
    private EmpEntity employee;

    @Enumerated(EnumType.STRING)
    @Column(name = "noti_type", length = 20)
    private NotificationType notiType;

    @Column(length = 100)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(length = 500)
    private String url;

    @Column(name = "is_read")
    @Builder.Default
    private Boolean isRead = false;

    // NotificationEntity.java 안에 추가 (Dirty Checking 활용)
    @Column(name = "read_at")
    private LocalDateTime readAt;

    public void markRead() {
        this.isRead = true;
        this.readAt = LocalDateTime.now();
    }
}
