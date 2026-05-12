package com.ict06.team1_fin_pj.domain.employee.controller;

import com.ict06.team1_fin_pj.common.dto.employee.DepartmentCreateRequestDto;
import com.ict06.team1_fin_pj.common.dto.employee.DepartmentUpdateRequestDto;
import com.ict06.team1_fin_pj.domain.employee.service.AdDepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

/*
 * 관리자 부서 관리 Controller
 *
 * 관리자 화면에서 부서 CRUD 요청을 처리한다.
 *
 * 담당 URL:
 * - GET  /admin/departments        : 부서 관리 페이지
 * - POST /admin/departments        : 부서 등록
 * - POST /admin/departments/{id}   : 부서 수정
 * - POST /admin/departments/{id}/delete : 부서 삭제
 */
@Controller
@RequiredArgsConstructor
@RequestMapping("/admin/departments")
public class AdDepartmentController {

    private final AdDepartmentService adDepartmentService;

    /*
     * 부서 관리 페이지
     *
     * 화면에 필요한 데이터:
     * 1. departments
     *    - 전체 부서 목록
     *    - 본부와 팀을 모두 포함한다.
     *
     * 2. headquarters
     *    - 본부 목록
     *    - 팀 등록/수정 시 상위 본부 선택에 사용한다.
     */
    @GetMapping
    public String departmentManagePage(Model model) {
        model.addAttribute("departments", adDepartmentService.findDepartments());
        model.addAttribute("headquarters", adDepartmentService.findHeadquarters());

        /*
         * templates/admin/employee/department-manage.html 로 이동한다.
         */
        return "admin/employee/department-manage";
    }

    /*
     * 부서 등록 처리
     *
     * parentDeptId가 null이면 본부 등록,
     * parentDeptId가 있으면 팀 등록으로 처리된다.
     */
    @PostMapping
    public String createDepartment(
            @ModelAttribute DepartmentCreateRequestDto requestDto,
            RedirectAttributes redirectAttributes
    ) {
        try {
            adDepartmentService.createDepartment(requestDto);
            redirectAttributes.addFlashAttribute("successMessage", "부서가 등록되었습니다.");
        } catch (IllegalArgumentException e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }

        return "redirect:/admin/departments";
    }

    /*
     * 부서 수정 처리
     *
     * 부서명 수정 또는 상위 부서 변경을 처리한다.
     */
    @PostMapping("/{deptId}")
    public String updateDepartment(
            @PathVariable Integer deptId,
            @ModelAttribute DepartmentUpdateRequestDto requestDto,
            RedirectAttributes redirectAttributes
    ) {
        try {
            adDepartmentService.updateDepartment(deptId, requestDto);
            redirectAttributes.addFlashAttribute("successMessage", "부서가 수정되었습니다.");
        } catch (IllegalArgumentException e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }

        return "redirect:/admin/departments";
    }

    /*
     * 부서 삭제 처리
     *
     * 삭제 제한:
     * - 하위 팀이 있는 본부 삭제 불가
     * - 소속 사원이 있는 부서 삭제 불가
     */
    @PostMapping("/{deptId}/delete")
    public String deleteDepartment(
            @PathVariable Integer deptId,
            RedirectAttributes redirectAttributes
    ) {
        try {
            adDepartmentService.deleteDepartment(deptId);
            redirectAttributes.addFlashAttribute("successMessage", "부서가 삭제되었습니다.");
        } catch (IllegalArgumentException e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }

        return "redirect:/admin/departments";
    }
}