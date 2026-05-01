/**
 * @author : 송영은
 * description : 샘플 페이지 전용 엔티티
 *  * 실제로 필요한 기능이 아니라 리액트를 이용한 MVC 패턴 구현 이해를 위한 예제 코드입니다.
 *  그렇지만 실제로 사용할 APP_FORM 테이블과 연결된 entity이니 주의해주세요!
 * ========================================
 * DATE      AUTHOR      NOTE
 * 26.04.29  송영은       최초 생성
 **/

package com.ict06.team1_fin_pj.test.entity;

import com.ict06.team1_fin_pj.common.dto.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "APP_FORM")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestEntity extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "form_id")
    private Integer formId;

    @Column(name = "form_name", nullable = false, length = 100)
    private String formName;

    @Column(columnDefinition = "TEXT")
    private String template;
}
