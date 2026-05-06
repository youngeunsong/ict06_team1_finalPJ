package com.ict06.team1_fin_pj.common.dto.employee;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

/*
 * 사원 수정 요청 DTO
 *
 * 사원 수정 화면(edit.html)에 기존 정보를 보여줄 때도 사용하고,
 * 수정 폼을 제출할 때 Controller → Service로 값을 전달할 때도 사용한다.
 */
@Getter
@Setter
public class EmployeeUpdateRequestDto {

    /*
     * 사번
     *
     * 수정 화면에 표시되지만 수정할 수 없다.
     */
    private String empNo;

    /*
     * 로그인 아이디
     *
     * 수정 화면에 표시되지만 수정할 수 없다.
     */
    private String empId;

    // 사원 이름
    private String name;

    // 이메일 아이디 부분
    private String emailId;

    // 이메일 도메인 부분
    private String emailDomain;

    // 연락처
    private String phone;

    /*
     * 본부 ID
     *
     * 수정 화면에서 기존 사원이 속한 팀의 상위 본부를
     * 선택 상태로 보여주기 위해 사용한다.
     *
     * 실제 EMPLOYEE 테이블에 저장되는 값은 아니다.
     */
    private Integer parentDeptId;

    /*
     * 팀 ID
     *
     * 실제 EMPLOYEE.dept_id에 저장되는 값이다.
     * 수정 화면에서는 두 번째 select 박스 값으로 사용한다.
     */
    private Integer deptId;

    // 직급 ID
    private Integer positionId;

    // 권한 ID
    private Integer roleId;

    // 은행명
    private String bank;

    // 계좌번호
    private String accountNo;

    /*
     * 재직 상태
     *
     * 예:
     * 재직, 휴직, 퇴사
     */
    private String status;

    /*
     * 입사일
     *
     * 수정 화면에 표시되지만 수정할 수 없다.
     */
    private LocalDate hireDate;

    /*
     * 새 비밀번호
     *
     * 비워두면 기존 비밀번호 유지.
     * 값이 들어오면 Service에서 암호화 후 변경한다.
     */
    private String password;

    /*
     * 기존 프로필 이미지 경로
     *
     * 수정 화면에서 현재 이미지를 보여주기 위해 사용한다.
     */
    private String profileImg;

    /*
     * 기존 서명 이미지 경로
     *
     * 수정 화면에서 현재 이미지를 보여주기 위해 사용한다.
     */
    private String signImg;

    /*
     * 새 프로필 이미지 업로드 파일
     *
     * 파일을 선택한 경우에만 기존 이미지가 교체된다.
     */
    private MultipartFile profileImgFile;

    /*
     * 새 서명 이미지 업로드 파일
     *
     * 파일을 선택한 경우에만 기존 이미지가 교체된다.
     */
    private MultipartFile signImgFile;
}