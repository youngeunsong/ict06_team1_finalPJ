package com.ict06.team1_fin_pj.domain.payroll.controller;

import com.ict06.team1_fin_pj.domain.payroll.service.AdPayrollService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequiredArgsConstructor
@RequestMapping("/admin/payroll")
public class AdPayrollController {

    private final AdPayrollService adPayrollService;

    @GetMapping("/salary-policy")
    public String salaryPolicyPage(Model model) {

        model.addAttribute("salaryPolicyList", adPayrollService.getSalaryPolicyList());
        model.addAttribute("departmentList", adPayrollService.getDepartmentList());
        model.addAttribute("positionList", adPayrollService.getPositionList());
        model.addAttribute("gradeCodeList", adPayrollService.getGradeCodeList());

        return "admin/payroll/salary-policy";
    }
}
