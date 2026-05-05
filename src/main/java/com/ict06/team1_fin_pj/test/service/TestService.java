/**
 * @author : 송영은
 * description : 사용자용 샘플 페이지 전용 서비스 인터페이스
 *  * 실제로 필요한 기능이 아니라 리액트를 이용한 MVC 패턴 구현 이해를 위한 예제 코드입니다.
 * ========================================
 * DATE      AUTHOR      NOTE
 * 26.04.29  송영은       최초 생성
 **/

package com.ict06.team1_fin_pj.test.service;

import com.ict06.team1_fin_pj.test.entity.TestEntity;

import java.util.List;

public interface TestService {
    // [결재 서식 관리]-----------------------------------------
    // insert
    public void saveAppForm(TestEntity entity);

    // list
    public List<TestEntity> listAllAppForms();

    // 1건 select (상세 화면)
    public TestEntity selectAppForm(int id);

    // delete
    public void deleteAppForm(int id);

    // update
    public void updateAppForm(TestEntity entity);
}
