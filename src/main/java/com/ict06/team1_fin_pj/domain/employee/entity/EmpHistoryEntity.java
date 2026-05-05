package com.ict06.team1_fin_pj.domain.employee.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDateTime;

@Entity
@Table(name = "EMP_HISTORY")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmpHistoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "history_id")
    private Integer historyId;

    //대상 사원
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "emp_no", nullable = false)
    private EmpEntity employee;

    @Column(name = "emp_id", nullable = false, length = 20)
    private String empId;

    //변경 전 부서
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "old_dept_id")
    private DepartmentEntity oldDept;

    //변경 후 부서
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "new_dept_id")
    private DepartmentEntity newDept;

    //변경 전 직급
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "old_pos_id")
    private PositionEntity oldPosition;

    //변경 후 직급
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "new_pos_id")
    private PositionEntity newPosition;

    //@Enumerated(EnumType.STRING)
    @Column(name = "change_type", length = 50)
    //private ChangeType changeType;
    private String changeType;

    //public enum ChangeType {
    //  PROMOTION, TRANSFER, DEMOTION
    // }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by")
    private EmpEntity changedBy;

    @Column(name = "changed_at")
    @CreatedDate
    private LocalDateTime changedAt;


}
