package com.ict06.team1_fin_pj.common.dto.employee;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

/*
 * 사원 등록 요청 DTO
 *
 * 사원 등록 화면(create.html)에서 입력한 값을
 * Controller → Service로 전달할 때 사용한다.
 */
@Getter
@Setter
public class EmployeeCreateRequestDto {

    // 사번
    // 입사일 기준으로 자동 생성된다.
    private String empNo;

    // 로그인 아이디
    // 이름 기준으로 자동 생성된다.
    private String empId;

    // 초기 비밀번호
    // Service에서 암호화 후 DB에 저장된다.
    private String password;

    // 사원 이름
    private String name;

    /*
     * 이메일 전체 값
     *
     * 현재 등록 로직에서는 emailId + emailDomain을 조합해서 사용하므로
     * 이 필드는 직접 사용하지 않을 수도 있다.
     */
    private String email;

    // 이메일 아이디 부분
    // 예: test@gmail.com 에서 test
    private String emailId;

    // 이메일 도메인 부분
    // 예: test@gmail.com 에서 gmail.com
    private String emailDomain;

    // 연락처
    private String phone;

    /*
     * 본부 ID
     *
     * 화면의 첫 번째 select 박스 값이다.
     * 예: 경영본부, 개발본부
     *
     * 실제 EMPLOYEE 테이블에 저장되는 값은 아니다.
     * 본부 선택 후 하위 팀 목록을 불러오기 위해 사용한다.
     */
    private Integer parentDeptId;

    /*
     * 팀 ID
     *
     * 화면의 두 번째 select 박스 값이다.
     * 실제 EMPLOYEE.dept_id에 저장되는 값이다.
     *
     * 예:
     * 본부 = 경영본부
     * 팀 = 인사팀
     * 저장 = 인사팀 dept_id
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

    // 입사일
    private LocalDate hireDate;

    // 프로필 사진 업로드 파일
    private MultipartFile profileImgFile;

    // 서명 이미지 업로드 파일
    private MultipartFile signImgFile;
}