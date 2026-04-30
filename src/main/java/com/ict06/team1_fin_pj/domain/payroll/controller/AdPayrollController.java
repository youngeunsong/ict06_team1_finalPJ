package com.ict06.team1_fin_pj.domain.payroll.controller;

import com.ict06.team1_fin_pj.common.dto.payroll.SalaryPolicyPageResponseDTO;
import com.ict06.team1_fin_pj.common.dto.payroll.SalaryPolicyRegisterCheckResponseDTO;
import com.ict06.team1_fin_pj.common.dto.payroll.SalaryPolicyRequestDTO;
import com.ict06.team1_fin_pj.common.dto.payroll.SalaryPolicySearchDTO;
import com.ict06.team1_fin_pj.domain.payroll.service.AdPayrollService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequiredArgsConstructor
@RequestMapping("/admin/payroll")
public class AdPayrollController {

    private final AdPayrollService adPayrollService;


    // 기본급 정책 목록 조회
    @GetMapping("/salary-policy")
    public String salaryPolicyPage(SalaryPolicySearchDTO searchDTO, Model model) {

        SalaryPolicyPageResponseDTO pageResponse =
                adPayrollService.getSalaryPolicyList(searchDTO);

        model.addAttribute("salaryPolicyList", pageResponse.getContent());
        model.addAttribute("pageResponse", pageResponse);

        model.addAttribute("departmentList", adPayrollService.getDepartmentList());
        model.addAttribute("positionList", adPayrollService.getPositionList());
        model.addAttribute("gradeCodeList", adPayrollService.getGradeCodeList());

        model.addAttribute("searchDTO", searchDTO);

        return "admin/payroll/salary-policy";
    }

    // 기본급 등록 페이지 (등록화면)
    @GetMapping("/salary-policy/register")
    public String showSalaryPolicyRegistrationPage(Model model) {
        // 부서, 직급 리스트를 모달에 넣기
        model.addAttribute("departmentList", adPayrollService.getDepartmentList());
        model.addAttribute("positionList", adPayrollService.getPositionList());

        return "admin/payroll/salary-policy-register";
    }

    // 부서 + 직급 선택 직후 실행
    // 1) 직급에 맞는 급여등급 자동 조회
    // 2) 해당 부서 + 직급 + 등급 기본급 정책 중복 여부 확인
    @GetMapping("/salary-policy/register-check")
    @ResponseBody
    public SalaryPolicyRegisterCheckResponseDTO checkSalaryPolicyRegisterAvailable(
            @RequestParam String deptId,
            @RequestParam String positionId
    ) {
        return adPayrollService.checkSalaryPolicyRegisterAvailable(deptId, positionId);
    }

    // 기본급 입력 직후 실행
    // 같은 부서 + 직급 기준 G1 < G2 < G3 < G4 서열 검증
    @GetMapping("/salary-policy/check-grade-order")
    @ResponseBody
    public boolean checkGradeOrder(SalaryPolicyRequestDTO requestDTO) {
        return adPayrollService.isValidGradeOrder(requestDTO);
    }

    // 기본급 정책 최종 등록
    // AJAX 검증을 통과했더라도 Service에서 중복/서열 다시 검증
    @PostMapping("/salary-policy/register")
    public String registerSalaryPolicy(@ModelAttribute SalaryPolicyRequestDTO requestDTO) {

        adPayrollService.registerSalaryPolicy(requestDTO);

        return "redirect:/admin/payroll/salary-policy";
    }
}
