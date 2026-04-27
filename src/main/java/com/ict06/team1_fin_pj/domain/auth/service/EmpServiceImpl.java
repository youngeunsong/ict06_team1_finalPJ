/**
 * @FileName : EmpServiceImpl.java
 * @Description : 사원 정보 조회 및 수정 처리 비즈니스 로직
 * @Author : 김다솜
 * @Date : 2026. 04. 23
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.23    김다솜        최초 생성/웰컴페이지 정보 조회 및 마이페이지 정보 수정 구현
 */

package com.ict06.team1_fin_pj.domain.auth.service;

import com.ict06.team1_fin_pj.domain.employee.entity.EmpEntity;
import com.ict06.team1_fin_pj.domain.auth.repository.EmpRepository;
import com.ict06.team1_fin_pj.domain.notification.service.NotificationServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmpServiceImpl {

    private final EmpRepository empRepository;
    private final NotificationServiceImpl notificationService;

    //웰컴페이지 정보 조회
    public EmpEntity getWelcomeInfo(String empNo) {
        return empRepository.findLoginEmpInfByEmpNo(empNo)
                .orElseThrow(() -> new RuntimeException(empNo + "사번을 가진 사원의 정보가 없습니다."));
    }

    //마이페이지 정보 수정
    public void updateEmpInfo(String empNo, String name, String email, String phone) {
        empRepository.updateEmpInfo(empNo, name, email, phone);

        //알림 전송(테스트용)
        notificationService.sendNotification(
                empNo,
                "MYPAGE",
                "정보 수정 알림",
                name + "님의 정보가 성공적으로 수정되었습니다.",
                "/mypage"
        );
    }
}
