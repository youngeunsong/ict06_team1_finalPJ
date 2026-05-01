package com.ict06.team1_fin_pj.domain.employee.service;

import com.ict06.team1_fin_pj.common.dto.employee.*;
import com.ict06.team1_fin_pj.common.security.PrincipalDetails;
import com.ict06.team1_fin_pj.domain.employee.entity.DepartmentEntity;
import com.ict06.team1_fin_pj.domain.employee.entity.EmpEntity;
import com.ict06.team1_fin_pj.domain.employee.entity.EmpHistoryEntity;
import com.ict06.team1_fin_pj.domain.employee.entity.PositionEntity;
import com.ict06.team1_fin_pj.domain.employee.entity.RoleEntity;
import com.ict06.team1_fin_pj.domain.employee.repository.AdDepartmentRepository;
import com.ict06.team1_fin_pj.domain.employee.repository.AdEmpHistoryRepository;
import com.ict06.team1_fin_pj.domain.employee.repository.AdEmployeeRepository;
import com.ict06.team1_fin_pj.domain.employee.repository.AdPositionRepository;
import com.ict06.team1_fin_pj.domain.employee.repository.AdRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/*
 * 인사관리 서비스 구현 클래스
 *
 * Controller에서 요청받은 실제 기능을 처리하는 곳이다.
 *
 * 예:
 * - 사원 목록 조회
 * - 사원 등록
 * - 사원 수정
 * - 사번 자동 생성
 * - 아이디 자동 생성
 * - 이미지 저장
 * - 상태 변경 이력 저장
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdEmployeeServiceImpl implements AdEmployeeService {

    /*
     * 이미지 파일이 실제로 저장될 기본 폴더 경로
     *
     * System.getProperty("user.dir")는 현재 프로젝트 실행 위치를 의미한다.
     *
     * 결과 예시:
     * 프로젝트경로/employee/ict_06_uploads
     */
    private static final String UPLOAD_BASE_DIR =
            System.getProperty("user.dir") + "/employee/ict_06_uploads";

    // 사원 DB 접근 Repository
    private final AdEmployeeRepository adEmployeeRepository;

    // 부서 DB 접근 Repository
    private final AdDepartmentRepository adDepartmentRepository;

    // 직급 DB 접근 Repository
    private final AdPositionRepository adPositionRepository;

    // 권한 DB 접근 Repository
    private final AdRoleRepository adRoleRepository;

    // 비밀번호 암호화 객체
    private final PasswordEncoder passwordEncoder;

    // 사원 변경 이력 저장 Repository
    private final AdEmpHistoryRepository adEmpHistoryRepository;

    /*
     * 사원 목록 조회
     *
     * 검색 조건을 받아서 사원 목록을 조회한다.
     * status가 비어 있으면 기본값을 "기본"으로 설정한다.
     *
     * "기본"은 퇴사자를 제외하고 조회하는 용도로 사용된다.
     */
    @Override
    public List<EmployeeListDto> findEmployees(EmployeeSearchConditionDto conditionDto) {
        String status = conditionDto.getStatus();

        // 상태 검색 조건이 없으면 기본값 설정
        if (status == null || status.trim().isEmpty()) {
            status = "기본";
            conditionDto.setStatus("기본");
        }

        // Repository의 검색 쿼리 호출
        return adEmployeeRepository.searchEmployees(
                conditionDto.getKeyword(),
                conditionDto.getDeptId(),
                conditionDto.getPositionId(),
                conditionDto.getRoleId(),
                status
        );
    }

    /*
     * 사원 상세 정보 조회
     *
     * 사번으로 사원 상세 DTO를 조회한다.
     * 없으면 예외를 발생시킨다.
     */
    @Override
    public EmployeeDetailDto findEmployeeDetail(String empNo) {
        return adEmployeeRepository.findEmployeeDetail(empNo)
                .orElseThrow(() -> new IllegalArgumentException("사원을 찾을 수 없습니다."));
    }

    /*
     * 부서 목록 조회
     *
     * 등록/수정/검색 화면의 select 박스에 사용된다.
     * DepartmentEntity를 HrSelectOptionDto로 변환해서 반환한다.
     */
    @Override
    public List<HrSelectOptionDto> findDepartments() {
        return adDepartmentRepository.findAll()
                .stream()
                .map(dept -> new HrSelectOptionDto(dept.getDeptId(), dept.getDeptName()))
                .toList();
    }

    /*
     * 직급 목록 조회
     *
     * 등록/수정/검색 화면의 select 박스에 사용된다.
     */
    @Override
    public List<HrSelectOptionDto> findPositions() {
        return adPositionRepository.findAll()
                .stream()
                .map(position -> new HrSelectOptionDto(position.getPositionId(), position.getPositionName()))
                .toList();
    }

    /*
     * 권한 목록 조회
     *
     * 등록/수정/검색 화면의 select 박스에 사용된다.
     */
    @Override
    public List<HrSelectOptionDto> findRoles() {
        return adRoleRepository.findAll()
                .stream()
                .map(role -> new HrSelectOptionDto(role.getRoleId(), role.getRoleName()))
                .toList();
    }

    /*
     * 사번 자동 생성
     *
     * 입사일의 연도 부분을 기준으로 사번을 생성한다.
     *
     * 예:
     * hireDate = "2026-05-01"
     * yearPrefix = "2026"
     *
     * 기존 사번:
     * 20260001, 20260002
     *
     * 새 사번:
     * 20260003
     */
    @Override
    public String generateEmpNo(String hireDate) {
        if (hireDate == null || hireDate.trim().isEmpty()) {
            throw new IllegalArgumentException("입사일을 선택해주세요.");
        }

        // 입사일 문자열에서 앞 4자리 연도만 추출
        String yearPrefix = hireDate.substring(0, 4);

        // 해당 연도로 시작하는 기존 사번 목록 조회
        List<String> empNos = adEmployeeRepository.findEmpNosByYearPrefix(yearPrefix);

        /*
         * 기존 사번에서 연도 부분을 제거하고 숫자만 추출한다.
         *
         * 예:
         * 20260001 -> 0001
         * 20260002 -> 0002
         *
         * 그중 가장 큰 번호를 찾는다.
         */
        int maxNumber = empNos.stream()
                .map(empNo -> empNo.replace(yearPrefix, ""))
                .filter(number -> number.matches("\\d+"))
                .mapToInt(Integer::parseInt)
                .max()
                .orElse(0);

        // 가장 큰 번호 + 1 해서 새 사번 생성
        return yearPrefix + String.format("%04d", maxNumber + 1);
    }

    /*
     * 로그인 아이디 자동 생성
     *
     * 이름을 기준으로 아이디를 생성한다.
     *
     * 예:
     * name = "홍길동"
     *
     * 기존 아이디:
     * 홍길동01, 홍길동02
     *
     * 새 아이디:
     * 홍길동03
     */
    @Override
    public String generateEmpId(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("이름을 입력해주세요.");
        }

        // 앞뒤 공백 제거
        String trimmedName = name.trim();

        // 해당 이름으로 시작하는 기존 아이디 목록 조회
        List<String> empIds = adEmployeeRepository.findEmpIdsByNamePrefix(trimmedName);

        /*
         * 기존 아이디에서 이름 부분을 제거하고 숫자만 추출한다.
         *
         * 예:
         * 홍길동01 -> 01
         * 홍길동02 -> 02
         */
        int maxNumber = empIds.stream()
                .map(empId -> empId.replace(trimmedName, ""))
                .filter(number -> number.matches("\\d+"))
                .mapToInt(Integer::parseInt)
                .max()
                .orElse(0);

        // 가장 큰 번호 + 1 해서 새 아이디 생성
        return trimmedName + String.format("%02d", maxNumber + 1);
    }

    /*
     * 사원 등록 처리
     *
     * DB에 값을 저장하므로 @Transactional이 필요하다.
     *
     * 처리 순서:
     * 1. 이메일 조합
     * 2. 중복 체크
     * 3. 부서/직급/권한 조회
     * 4. 이미지 저장
     * 5. 비밀번호 암호화
     * 6. EmpEntity 생성
     * 7. DB 저장
     */
    @Override
    @Transactional
    public void createEmployee(EmployeeCreateRequestDto requestDto) {
        // 화면에서 emailId, emailDomain을 따로 받기 때문에 하나의 이메일로 합친다.
        String email = requestDto.getEmailId() + "@" + requestDto.getEmailDomain();

        // 사번 중복 체크
        if (adEmployeeRepository.existsByEmpNo(requestDto.getEmpNo())) {
            throw new IllegalArgumentException("이미 사용 중인 사번입니다.|empNo");
        }

        // 로그인 아이디 중복 체크
        if (adEmployeeRepository.existsByEmpId(requestDto.getEmpId())) {
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다.|empId");
        }

        // 이메일 중복 체크
        if (adEmployeeRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.|emailId");
        }

        // 연락처 중복 체크
        if (adEmployeeRepository.existsByPhone(requestDto.getPhone())) {
            throw new IllegalArgumentException("이미 사용 중인 연락처입니다.|phone");
        }

        // 계좌번호 중복 체크
        if (adEmployeeRepository.existsByAccountNo(requestDto.getAccountNo())) {
            throw new IllegalArgumentException("이미 사용 중인 계좌번호입니다.|accountNo");
        }

        // 선택한 부서 ID로 부서 엔티티 조회
        DepartmentEntity department = adDepartmentRepository.findById(requestDto.getDeptId())
                .orElseThrow(() -> new IllegalArgumentException("부서를 찾을 수 없습니다.|deptId"));

        // 선택한 직급 ID로 직급 엔티티 조회
        PositionEntity position = adPositionRepository.findById(requestDto.getPositionId())
                .orElseThrow(() -> new IllegalArgumentException("직급을 찾을 수 없습니다.|positionId"));

        // 선택한 권한 ID로 권한 엔티티 조회
        RoleEntity role = adRoleRepository.findById(requestDto.getRoleId())
                .orElseThrow(() -> new IllegalArgumentException("권한을 찾을 수 없습니다.|roleId"));

        // 프로필 이미지 저장 후 DB에 저장할 경로 반환
        String profileImgPath = saveEmployeeImage(
                requestDto.getProfileImgFile(),
                "profile",
                requestDto.getEmpNo()
        );

        // 서명 이미지 저장 후 DB에 저장할 경로 반환
        String signImgPath = saveEmployeeImage(
                requestDto.getSignImgFile(),
                "sign",
                requestDto.getEmpNo()
        );

        /*
         * 사원 엔티티 생성
         *
         * 비밀번호는 반드시 암호화해서 저장한다.
         * 상태는 신규 등록이므로 "재직"으로 저장한다.
         * isDeleted는 삭제되지 않은 상태인 "N"으로 저장한다.
         */
        EmpEntity employee = EmpEntity.builder()
                .empNo(requestDto.getEmpNo())
                .empId(requestDto.getEmpId())
                .password(passwordEncoder.encode(requestDto.getPassword()))
                .name(requestDto.getName())
                .email(email)
                .phone(requestDto.getPhone())
                .department(department)
                .position(position)
                .role(role)
                .bank(requestDto.getBank())
                .accountNo(requestDto.getAccountNo())
                .hireDate(requestDto.getHireDate())
                .status("재직")
                .isDeleted("N")
                .profileImg(profileImgPath)
                .signImg(signImgPath)
                .build();

        // DB에 사원 저장
        adEmployeeRepository.save(employee);
    }

    /*
     * 사원 수정 화면용 데이터 조회
     *
     * 수정 화면에 기존 정보를 보여주기 위해 사용한다.
     * Entity를 EmployeeUpdateRequestDto로 옮겨 담는다.
     */
    @Override
    public EmployeeUpdateRequestDto findEmployeeForUpdate(String empNo) {
        // 사번으로 기존 사원 조회
        EmpEntity employee = adEmployeeRepository.findById(empNo)
                .orElseThrow(() -> new IllegalArgumentException("사원을 찾을 수 없습니다."));

        EmployeeUpdateRequestDto dto = new EmployeeUpdateRequestDto();

        // 수정 화면에 보여줄 기본 정보 세팅
        dto.setEmpNo(employee.getEmpNo());
        dto.setEmpId(employee.getEmpId());
        dto.setName(employee.getName());

        /*
         * 이메일을 화면에서 emailId / emailDomain으로 나눠 쓰기 때문에
         * @ 기준으로 분리한다.
         *
         * 예:
         * test@gmail.com
         * emailId = test
         * emailDomain = gmail.com
         */
        if (employee.getEmail() != null && employee.getEmail().contains("@")) {
            String[] emailParts = employee.getEmail().split("@", 2);
            dto.setEmailId(emailParts[0]);
            dto.setEmailDomain(emailParts[1]);
        }

        dto.setPhone(employee.getPhone());
        dto.setDeptId(employee.getDepartment().getDeptId());
        dto.setPositionId(employee.getPosition().getPositionId());
        dto.setRoleId(employee.getRole().getRoleId());
        dto.setBank(employee.getBank());
        dto.setAccountNo(employee.getAccountNo());
        dto.setStatus(employee.getStatus());
        dto.setHireDate(employee.getHireDate());
        dto.setProfileImg(employee.getProfileImg());
        dto.setSignImg(employee.getSignImg());

        return dto;
    }

    /*
     * 사원 수정 처리
     *
     * 처리 순서:
     * 1. 기존 사원 조회
     * 2. 기존 부서/직급/상태 저장
     * 3. 새 부서/직급/권한 조회
     * 4. 이메일 조합
     * 5. 중복 체크
     * 6. 기본 정보 수정
     * 7. 이미지 수정
     * 8. 상태 변경 처리
     * 9. 상태 변경 이력 저장
     * 10. 비밀번호 변경
     */
    @Override
    @Transactional
    public void updateEmployee(String empNo, EmployeeUpdateRequestDto requestDto) {
        // 수정할 사원 조회
        EmpEntity employee = adEmployeeRepository.findById(empNo)
                .orElseThrow(() -> new IllegalArgumentException("사원을 찾을 수 없습니다."));

        /*
         * 변경 전 정보를 저장해둔다.
         *
         * 상태 변경 이력 저장할 때
         * 이전 부서, 이전 직급, 이전 상태가 필요하다.
         */
        DepartmentEntity oldDepartment = employee.getDepartment();
        PositionEntity oldPosition = employee.getPosition();
        String oldStatus = employee.getStatus();

        // 새로 선택한 부서 조회
        DepartmentEntity newDepartment = adDepartmentRepository.findById(requestDto.getDeptId())
                .orElseThrow(() -> new IllegalArgumentException("부서를 찾을 수 없습니다."));

        // 새로 선택한 직급 조회
        PositionEntity newPosition = adPositionRepository.findById(requestDto.getPositionId())
                .orElseThrow(() -> new IllegalArgumentException("직급을 찾을 수 없습니다."));

        // 새로 선택한 권한 조회
        RoleEntity role = adRoleRepository.findById(requestDto.getRoleId())
                .orElseThrow(() -> new IllegalArgumentException("권한을 찾을 수 없습니다."));

        // emailId와 emailDomain을 합쳐 완성된 이메일 생성
        String email = requestDto.getEmailId() + "@" + requestDto.getEmailDomain();

        /*
         * 이메일 중복 체크
         *
         * 자기 자신의 empNo는 제외하고 검사한다.
         * 그래야 기존 이메일을 그대로 저장할 때 중복 오류가 나지 않는다.
         */
        if (adEmployeeRepository.existsByEmailAndEmpNoNot(email, empNo)) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.|emailId");
        }

        // 연락처 중복 체크
        if (adEmployeeRepository.existsByPhoneAndEmpNoNot(requestDto.getPhone(), empNo)) {
            throw new IllegalArgumentException("이미 사용 중인 연락처입니다.|phone");
        }

        // 계좌번호 중복 체크
        if (adEmployeeRepository.existsByAccountNoAndEmpNoNot(requestDto.getAccountNo(), empNo)) {
            throw new IllegalArgumentException("이미 사용 중인 계좌번호입니다.|accountNo");
        }

        /*
         * 사원 기본 정보 수정
         *
         * JPA 영속성 컨텍스트 안에서 Entity 값을 변경하면
         * 트랜잭션이 끝날 때 자동으로 update 쿼리가 실행된다.
         */
        employee.updateEmployeeInfo(
                requestDto.getName(),
                email,
                requestDto.getPhone(),
                newDepartment,
                newPosition,
                role,
                requestDto.getBank(),
                requestDto.getAccountNo()
        );

        // 새 프로필 이미지가 업로드되었으면 저장하고 경로 변경
        String profileImgPath = saveEmployeeImage(
                requestDto.getProfileImgFile(),
                "profile",
                empNo
        );

        if (profileImgPath != null) {
            employee.changeProfileImg(profileImgPath);
        }

        // 새 서명 이미지가 업로드되었으면 저장하고 경로 변경
        String signImgPath = saveEmployeeImage(
                requestDto.getSignImgFile(),
                "sign",
                empNo
        );

        if (signImgPath != null) {
            employee.changeSignImg(signImgPath);
        }

        // 수정 화면에서 선택한 새 상태
        String newStatus = requestDto.getStatus();

        /*
         * 상태가 변경되었을 때만 상태 변경 처리와 이력 저장을 한다.
         *
         * 예:
         * 재직 -> 휴직
         * 휴직 -> 재직
         * 재직 -> 퇴사
         */
        if (!oldStatus.equals(newStatus)) {

            // 새 상태가 퇴사면 퇴사일을 오늘 날짜로 저장
            if ("퇴사".equals(newStatus)) {
                employee.changeResignationDate(LocalDate.now());
            }

            // 기존 상태가 퇴사였는데 다시 재직/휴직으로 바뀌면 퇴사일 제거
            if ("퇴사".equals(oldStatus) && !"퇴사".equals(newStatus)) {
                employee.changeResignationDate(null);
            }

            // 사원 상태 변경
            employee.changeStatus(newStatus);

            // 현재 로그인한 관리자 정보 조회
            EmpEntity adminEmployee = getLoginEmployee();

            /*
             * 사원 변경 이력 저장
             *
             * 누가, 언제, 어떤 사원의 상태를 어떻게 변경했는지 기록한다.
             */
            adEmpHistoryRepository.save(
                    EmpHistoryEntity.builder()
                            .employee(employee)
                            .empId(employee.getEmpId())
                            .oldDept(oldDepartment)
                            .newDept(newDepartment)
                            .oldPosition(oldPosition)
                            .newPosition(newPosition)
                            .changeType(oldStatus + " -> " + newStatus)
                            .changedAt(LocalDateTime.now())
                            .changedBy(adminEmployee)
                            .build()
            );
        }

        /*
         * 비밀번호 변경
         *
         * 비밀번호 입력칸이 비어 있으면 기존 비밀번호를 유지한다.
         * 값이 들어온 경우에만 새 비밀번호로 변경한다.
         */
        if (requestDto.getPassword() != null && !requestDto.getPassword().trim().isEmpty()) {
            employee.changePassword(passwordEncoder.encode(requestDto.getPassword()));
        }
    }

    /*
     * 현재 로그인한 사원 정보 조회
     *
     * Spring SecurityContextHolder에서 현재 인증 정보를 꺼낸다.
     * PrincipalDetails 안에 들어 있는 EmpEntity를 반환한다.
     *
     * 상태 변경 이력에서 changedBy에 사용된다.
     */
    private EmpEntity getLoginEmployee() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null
                && authentication.getPrincipal() instanceof PrincipalDetails principalDetails) {
            return principalDetails.getEmpEntity();
        }

        return null;
    }

    /*
     * 사원 이미지 저장 메서드
     *
     * 프로필 이미지와 서명 이미지를 저장할 때 공통으로 사용한다.
     *
     * file: 업로드된 파일
     * folderName: profile 또는 sign
     * empNo: 파일명 앞에 붙일 사번
     *
     * 반환값:
     * DB에 저장할 이미지 접근 경로
     *
     * 예:
     * /employee/uploads/profile/20260001_UUID.png
     */
    private String saveEmployeeImage(MultipartFile file, String folderName, String empNo) {
        // 파일이 없으면 저장하지 않고 null 반환
        if (file == null || file.isEmpty()) {
            return null;
        }

        // 원본 파일명 가져오기
        String originalFilename = file.getOriginalFilename();

        // 원본 파일명이 없으면 저장하지 않음
        if (originalFilename == null || originalFilename.isBlank()) {
            return null;
        }

        // 확장자 검사를 위해 소문자로 변환
        String lowerName = originalFilename.toLowerCase();

        /*
         * 이미지 확장자 검사
         *
         * jpg, jpeg, png 파일만 허용한다.
         * 그 외 파일이면 예외를 발생시킨다.
         */
        if (!(lowerName.endsWith(".jpg")
                || lowerName.endsWith(".jpeg")
                || lowerName.endsWith(".png"))) {
            throw new IllegalArgumentException("이미지 파일은 jpg, jpeg, png만 업로드할 수 있습니다.|" + folderName + "ImgFile");
        }

        // 원본 파일명에서 확장자 추출
        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));

        /*
         * 저장할 파일명 생성
         *
         * 사번 + UUID + 확장자 형태로 저장한다.
         * UUID를 붙이는 이유는 파일명 중복을 막기 위해서다.
         */
        String savedFileName = empNo + "_" + UUID.randomUUID() + extension;

        // 실제 저장할 폴더 객체 생성
        File folder = new File(UPLOAD_BASE_DIR + "/" + folderName);

        // 폴더가 없으면 새로 생성
        if (!folder.exists()) {
            folder.mkdirs();
        }

        // 최종 저장 파일 객체 생성
        File saveFile = new File(folder, savedFileName);

        try {
            // 업로드된 파일을 실제 폴더에 저장
            file.transferTo(saveFile);
        } catch (IOException e) {
            throw new RuntimeException("이미지 파일 저장 중 오류가 발생했습니다.", e);
        }

        // DB에는 실제 파일 경로가 아니라 웹에서 접근할 수 있는 경로를 저장한다.
        return "/employee/uploads/" + folderName + "/" + savedFileName;
    }
}