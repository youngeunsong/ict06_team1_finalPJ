package com.ict06.team1_fin_pj.domain.attendance.entity;

// JPA 어노테이션 사용
// @Entity, @Table, @Id, @GeneratedValue, @Column 등을 쓰기 위한 import
import jakarta.persistence.*;

// Lombok 어노테이션 사용
// Getter/Setter/생성자/Builder 코드를 자동으로 만들어줌
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

// 이 클래스가 DB 테이블과 연결되는 Entity 클래스라는 뜻
@Entity

// 실제 DB 테이블 이름을 attendance로 지정
// uniqueConstraints는 DB의 UNIQUE 제약조건을 자바 코드에서 표현한 것
@Table(
        name = "attendance",
        uniqueConstraints = {
                // 한 사람(emp_id)은 하루(work_date)에 근태 기록을 1개만 가질 수 있음
                // DB 기준: CONSTRAINT uk_emp_work_date UNIQUE (emp_id, work_date)
                @UniqueConstraint(
                        name = "uk_emp_work_date",
                        columnNames = {"emp_id", "work_date"}
                )
        }
)

// 모든 필드의 getter 메서드 자동 생성
@Getter

// 모든 필드의 setter 메서드 자동 생성
// 초반 개발 단계에서는 편해서 사용
@Setter

// 기본 생성자 자동 생성
// JPA는 기본 생성자가 필요함
@NoArgsConstructor

// 모든 필드를 받는 생성자 자동 생성
@AllArgsConstructor

// Builder 패턴 사용 가능
// 예: Attendance.builder().empId("E001").status("ON_TIME").build()
@Builder
public class Attendance {

    // 근태 기록 식별자
    // DB 컬럼: attendance_id
    // PK 역할
    @Id

    // PostgreSQL의 SERIAL / IDENTITY처럼 자동 증가 처리
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    // DB 컬럼명 지정
    @Column(name = "attendance_id")
    private Long attendanceId;

    // 해당 사원 ID
    // DB 컬럼: emp_id
    // EMPLOYEE.emp_id와 연결되는 값
    @Column(name = "emp_id", nullable = false, length = 20)
    private String empId;

    // 근무 일자
    // DB 컬럼: work_date
    // emp_id와 묶어서 UNIQUE 제약조건 적용
    @Column(name = "work_date", nullable = false)
    private LocalDate workDate;

    // 출근 시각
    // DB 컬럼: check_in_at
    @Column(name = "check_in_at")
    private LocalDateTime checkInAt;

    // 퇴근 시각
    // DB 컬럼: check_out_at
    @Column(name = "check_out_at")
    private LocalDateTime checkOutAt;

    // 출근 위치 위도
    // DB 컬럼: check_in_lat
    // NUMERIC(10,7)에 대응
    @Column(name = "check_in_lat", precision = 10, scale = 7)
    private BigDecimal checkInLat;

    // 출근 위치 경도
    // DB 컬럼: check_in_long
    // NUMERIC(10,7)에 대응
    @Column(name = "check_in_long", precision = 10, scale = 7)
    private BigDecimal checkInLong;

    // 퇴근 위치 위도
    // DB 컬럼: check_out_lat
    // NUMERIC(10,7)에 대응
    @Column(name = "check_out_lat", precision = 10, scale = 7)
    private BigDecimal checkOutLat;

    // 퇴근 위치 경도
    // DB 컬럼: check_out_long
    // NUMERIC(10,7)에 대응
    @Column(name = "check_out_long", precision = 10, scale = 7)
    private BigDecimal checkOutLong;

    // 총 근무시간
    // DB 컬럼: work_hours
    // 예: 8.50 시간
    @Column(name = "work_hours", precision = 5, scale = 2)
    private BigDecimal workHours;

    // 연장근무 분 수
    // DB 컬럼: overtime_mins
    // 예: 30분 연장근무면 30
    @Column(name = "overtime_mins")
    private Integer overtimeMins;

    // 근태 상태
    // DB 컬럼: status
    // 예: ON_TIME, ABSENT, LATE, EARLY, LEFT
    @Column(name = "status", nullable = false, length = 20)
    private String status;

    // 비고
    // DB 컬럼: note
    // 관리자 메모용
    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    // 생성 일시
    // DB 컬럼: created_at
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // 수정 일시
    // DB 컬럼: updated_at
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // INSERT 되기 직전에 자동 실행됨
    // 처음 저장할 때 createdAt, updatedAt을 현재 시간으로 넣어줌
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // UPDATE 되기 직전에 자동 실행됨
    // 수정할 때 updatedAt만 현재 시간으로 갱신
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}