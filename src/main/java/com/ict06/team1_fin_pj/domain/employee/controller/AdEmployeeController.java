package com.ict06.team1_fin_pj.domain.employee.controller;

import com.ict06.team1_fin_pj.common.dto.employee.EmployeeCreateRequestDto;
import com.ict06.team1_fin_pj.common.dto.employee.EmployeeSearchConditionDto;
import com.ict06.team1_fin_pj.common.dto.employee.EmployeeUpdateRequestDto;
import com.ict06.team1_fin_pj.domain.employee.service.AdEmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

/*
 * 관리자 인사관리 컨트롤러
 *
 * /admin/employees 로 시작하는 요청을 처리한다.
 *
 * Controller의 역할:
 * - 사용자의 요청을 받음
 * - Service에게 실제 기능 처리를 맡김
 * - 처리 결과를 화면으로 전달함
 */
@Controller
@RequiredArgsConstructor
@RequestMapping("/admin/employees")
public class AdEmployeeController {

    /*
     * 인사관리 서비스
     *
     * 실제 사원 조회, 등록, 수정 등의 기능은
     * AdEmployeeServiceImpl에서 처리한다.
     */
    private final AdEmployeeService adEmployeeService;

    /*
     * 사원 목록 화면
     *
     * GET /admin/employees
     *
     * 검색 조건을 받아서 사원 목록을 조회하고,
     * 부서/직급/권한 select 박스 데이터도 함께 화면에 전달한다.
     */
    @GetMapping
    public String employeeList(
            @ModelAttribute EmployeeSearchConditionDto conditionDto,
            Model model
    ) {
        // 검색 조건에 맞는 사원 목록
        model.addAttribute("employees", adEmployeeService.findEmployees(conditionDto));

        // 검색 필터 select 박스에 사용할 부서 목록
        model.addAttribute("departments", adEmployeeService.findDepartments());

        // 검색 필터 select 박스에 사용할 직급 목록
        model.addAttribute("positions", adEmployeeService.findPositions());

        // 검색 필터 select 박스에 사용할 권한 목록
        model.addAttribute("roles", adEmployeeService.findRoles());

        // 사용자가 선택한 검색 조건을 화면에 다시 유지하기 위해 전달
        model.addAttribute("condition", conditionDto);

        // templates/admin/employee/list.html 화면으로 이동
        return "admin/employee/list";
    }

    /*
     * 사원 등록 화면
     *
     * GET /admin/employees/new
     *
     * 빈 등록 DTO와 select 박스 데이터를 화면에 전달한다.
     */
    @GetMapping("/new")
    public String createForm(Model model) {
        // 등록 화면에서 입력값을 담을 빈 DTO
        model.addAttribute("employeeCreateRequestDto", new EmployeeCreateRequestDto());

        // 등록 화면의 부서 select 박스 데이터
        model.addAttribute("departments", adEmployeeService.findDepartments());

        // 등록 화면의 직급 select 박스 데이터
        model.addAttribute("positions", adEmployeeService.findPositions());

        // 등록 화면의 권한 select 박스 데이터
        model.addAttribute("roles", adEmployeeService.findRoles());

        // templates/admin/employee/create.html 화면으로 이동
        return "admin/employee/create";
    }

    /*
     * 사번 자동 생성
     *
     * GET /admin/employees/generate-emp-no?hireDate=2026-05-01
     *
     * 입사일을 기준으로 사번을 자동 생성한다.
     * @ResponseBody가 있으므로 화면 이름이 아니라 문자열 자체를 응답한다.
     */
    @GetMapping("/generate-emp-no")
    @ResponseBody
    public String generateEmpNo(@RequestParam String hireDate) {
        return adEmployeeService.generateEmpNo(hireDate);
    }

    /*
     * 로그인 아이디 자동 생성
     *
     * GET /admin/employees/generate-emp-id?name=홍길동
     *
     * 이름을 기준으로 아이디를 자동 생성한다.
     */
    @GetMapping("/generate-emp-id")
    @ResponseBody
    public String generateEmpId(@RequestParam String name) {
        return adEmployeeService.generateEmpId(name);
    }

    /*
     * 사원 등록 처리
     *
     * POST /admin/employees
     *
     * 등록 화면에서 입력한 값을 받아 사원을 저장한다.
     * 성공하면 목록 화면으로 이동한다.
     * 실패하면 다시 등록 화면으로 돌아간다.
     */
    @PostMapping
    public String createEmployee(
            @ModelAttribute EmployeeCreateRequestDto requestDto,
            Model model
    ) {
        try {
            // 사원 등록 처리
            adEmployeeService.createEmployee(requestDto);

            // 등록 성공 시 사원 목록으로 이동
            return "redirect:/admin/employees";

        } catch (IllegalArgumentException e) {
            /*
             * 등록 중 오류가 발생한 경우
             *
             * Service에서 "에러메시지|필드명" 형태로 예외를 던지고 있다.
             * 예: "이미 사용 중인 이메일입니다.|emailId"
             *
             * 이 값을 나눠서 화면에 전달하면,
             * 어떤 필드에서 오류가 났는지 표시할 수 있다.
             */
            String message = e.getMessage();
            String errorMessage = message;
            String errorField = "";

            if (message != null && message.contains("|")) {
                String[] parts = message.split("\\|");
                errorMessage = parts[0];
                errorField = parts[1];
            }

            // 사용자가 입력했던 값을 다시 화면에 유지
            model.addAttribute("employeeCreateRequestDto", requestDto);

            // 등록 화면 select 박스 데이터 다시 전달
            model.addAttribute("departments", adEmployeeService.findDepartments());
            model.addAttribute("positions", adEmployeeService.findPositions());
            model.addAttribute("roles", adEmployeeService.findRoles());

            // 에러 메시지와 에러가 발생한 필드명 전달
            model.addAttribute("errorMessage", errorMessage);
            model.addAttribute("errorField", errorField);

            // 다시 등록 화면으로 이동
            return "admin/employee/create";
        }
    }

    /*
     * 사원 상세 화면
     *
     * GET /admin/employees/{empNo}
     *
     * 특정 사번의 상세 정보를 조회해서 화면에 보여준다.
     */
    @GetMapping("/{empNo}")
    public String employeeDetail(
            @PathVariable String empNo,
            Model model
    ) {
        // 사번으로 사원 상세 정보 조회
        model.addAttribute("employee", adEmployeeService.findEmployeeDetail(empNo));

        // templates/admin/employee/detail.html 화면으로 이동
        return "admin/employee/detail";
    }

    /*
     * 사원 수정 화면
     *
     * GET /admin/employees/{empNo}/edit
     *
     * 기존 사원 정보를 조회해서 수정 화면에 보여준다.
     */
    @GetMapping("/{empNo}/edit")
    public String editForm(
            @PathVariable String empNo,
            Model model
    ) {
        // 수정 화면에 보여줄 기존 사원 정보
        model.addAttribute("employeeUpdateRequestDto", adEmployeeService.findEmployeeForUpdate(empNo));

        // 수정 화면 select 박스 데이터
        model.addAttribute("departments", adEmployeeService.findDepartments());
        model.addAttribute("positions", adEmployeeService.findPositions());
        model.addAttribute("roles", adEmployeeService.findRoles());

        // templates/admin/employee/edit.html 화면으로 이동
        return "admin/employee/edit";
    }

    /*
     * 사원 수정 처리
     *
     * POST /admin/employees/{empNo}/edit
     *
     * 수정 화면에서 입력한 값으로 사원 정보를 수정한다.
     * 성공하면 상세 화면으로 이동한다.
     * 실패하면 다시 수정 화면으로 돌아간다.
     */
    @PostMapping("/{empNo}/edit")
    public String updateEmployee(
            @PathVariable String empNo,
            @ModelAttribute EmployeeUpdateRequestDto requestDto,
            Model model
    ) {
        try {
            // 사원 수정 처리
            adEmployeeService.updateEmployee(empNo, requestDto);

            // 수정 성공 시 해당 사원의 상세 화면으로 이동
            return "redirect:/admin/employees/" + empNo;

        } catch (IllegalArgumentException e) {
            /*
             * 수정 중 오류가 발생한 경우
             *
             * 등록과 마찬가지로
             * "에러메시지|필드명" 형태를 분리해서 화면에 전달한다.
             */
            String message = e.getMessage();
            String errorMessage = message;
            String errorField = "";

            if (message != null && message.contains("|")) {
                String[] parts = message.split("\\|");
                errorMessage = parts[0];
                errorField = parts[1];
            }

            // 사용자가 입력했던 수정 값을 다시 화면에 유지
            model.addAttribute("employeeUpdateRequestDto", requestDto);

            // 수정 화면 select 박스 데이터 다시 전달
            model.addAttribute("departments", adEmployeeService.findDepartments());
            model.addAttribute("positions", adEmployeeService.findPositions());
            model.addAttribute("roles", adEmployeeService.findRoles());

            // 에러 메시지와 에러 필드 전달
            model.addAttribute("errorMessage", errorMessage);
            model.addAttribute("errorField", errorField);

            // 다시 수정 화면으로 이동
            return "admin/employee/edit";
        }
    }
}