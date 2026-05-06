/**
 * @author : 송영은
 * description : 사용자용 샘플 페이지 전용 서비스 구현 클래스.
 *  * 실제로 필요한 기능이 아니라 리액트를 이용한 MVC 패턴 구현 이해를 위한 예제 코드입니다.
 * ========================================
 * DATE      AUTHOR      NOTE
 * 26.04.29  송영은       최초 생성
 **/

package com.ict06.team1_fin_pj.test.service;

import com.ict06.team1_fin_pj.test.entity.TestEntity;
import com.ict06.team1_fin_pj.test.repository.TestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TestServiceImpl implements TestService {

    @Autowired
    TestRepository testRepository;

    // [결재 서식 관리]-----------------------------------------
    // insert
    @Override
    public void saveAppForm(TestEntity entity) {

    }

    // list
    @Override
    public List<TestEntity> listAllAppForms() {
        System.out.println("AdApprovalServiceImpl - listAllAppForms()");
        return testRepository.selectTestList(); // ⭐queryDSL 방식 사용
    }

    // 1건 select (상세 화면)
    @Override
    public TestEntity selectAppForm(int id) {
        return null;
    }

    // delete
    @Override
    public void deleteAppForm(int id) {

    }

    // update
    @Override
    public void updateAppForm(TestEntity entity) {

    }
}
