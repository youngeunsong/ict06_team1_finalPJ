/**
 * @author : 송영은
 * description : 관리자용 급여 관리 컨트롤러
 * ========================================
 * DATE         AUTHOR      NOTE
 * 2026-04-24   송영은       최초 생성
 **/

package com.ict06.team1_fin_pj.domain.payroll.controller;

import com.ict06.team1_fin_pj.common.dto.payroll.*;
import com.ict06.team1_fin_pj.domain.payroll.service.AdPayrollService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

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

    // 부서 + 직급 선택 직후 실행 - 직급에 맞는 급여등급 자동 조회 && 해당 부서 + 직급 + 등급 기본급 정책 중복 여부 확인

    @GetMapping("/salary-policy/register-check")
    @ResponseBody
    public SalaryPolicyRegisterCheckResponseDTO checkSalaryPolicyRegisterAvailable(
            @RequestParam String deptId,
            @RequestParam String positionId
    ) {
        return adPayrollService.checkSalaryPolicyRegisterAvailable(deptId, positionId);
    }

    // 기본급 입력 직후 실행 - 같은 부서 기준 G1 < G2 < G3 < G4 서열 검증
    @GetMapping("/salary-policy/check-grade-order")
    @ResponseBody
    public boolean checkGradeOrder(SalaryPolicyRequestDTO requestDTO) {
        return adPayrollService.isValidGradeOrder(requestDTO);
    }

    // 기본급 정책 최종 등록 - AJAX 검증을 통과했더라도 Service에서 중복/서열 다시 검증
    @PostMapping("/salary-policy/register")
    public String registerSalaryPolicy(@ModelAttribute SalaryPolicyRequestDTO requestDTO,
                                       @RequestParam(defaultValue = "1") int searchPage,
                                       @RequestParam(defaultValue = "10") int searchSize,
                                       @RequestParam(required = false) String searchDeptId,
                                       @RequestParam(required = false) String searchPositionId,
                                       @RequestParam(required = false) String searchGradeId,
                                       @RequestParam(required = false) String searchKeyword,
                                       RedirectAttributes redirectAttributes) {

        adPayrollService.registerSalaryPolicy(requestDTO);

        redirectAttributes.addFlashAttribute("successMessage", "기본급 정책이 등록되었습니다.");

        addSearchCondition(redirectAttributes, searchPage, searchSize,
                searchDeptId, searchPositionId, searchGradeId, searchKeyword);

        return "redirect:/admin/payroll/salary-policy";
    }

    // 기본급 정책 상세 조회 - 수정 버튼 클릭 시 실행되며, 수정 모달에 기존 정책 정보를 채우기 위한 용도
    @GetMapping("/salary-policy/{policyId}")
    @ResponseBody
    public SalaryPolicyResponseDTO getSalaryPolicyDetail(@PathVariable Long policyId) {

        return adPayrollService.getSalaryPolicyDetail(policyId);
    }

    // 수정 중 AJAX 서열 검증 - 수정 모달에서 기본급 입력 직후 실행
    // 현재 수정 중인 정책은 비교 대상에서 제외하고, 같은 부서 기준 G1 < G2 < G3 < G4 서열을 검증한다.
    @GetMapping("/salary-policy/check-grade-order-update")
    @ResponseBody
    public boolean checkGradeOrderForUpdate(SalaryPolicyRequestDTO requestDTO) {

        return adPayrollService.isValidGradeOrderForUpdateCheck(requestDTO);
    }

    // 기본급 정책 수정 처리 - 기본급과 설명만 수정
    // 수정 화면에서는 부서, 직급, 급여등급은 변경하지 않는다.
    // 실제 DB 처리 방식은 기존 정책을 비활성화(isActive=false), 수정된 값으로 새로운 기본급 정책을 등록하는 방식
    @PostMapping("/salary-policy/update")
    public String updateSalaryPolicy(@ModelAttribute SalaryPolicyRequestDTO requestDTO,
                                     @RequestParam(defaultValue = "1") int searchPage,
                                     @RequestParam(defaultValue = "10") int searchSize,
                                     @RequestParam(required = false) String searchDeptId,
                                     @RequestParam(required = false) String searchPositionId,
                                     @RequestParam(required = false) String searchGradeId,
                                     @RequestParam(required = false) String searchKeyword,
                                     RedirectAttributes redirectAttributes) {

        adPayrollService.updateSalaryPolicy(requestDTO);

        redirectAttributes.addFlashAttribute("successMessage", "기본급 정책이 수정되었습니다.");

        addSearchCondition(redirectAttributes, searchPage, searchSize,
                searchDeptId, searchPositionId, searchGradeId, searchKeyword);

        return "redirect:/admin/payroll/salary-policy";
    }

    // 기본급 정책 삭제 처리 - 실제 DB에서 행을 삭제하지 않고 isActive=false로 비활성화
    // 과거 급여대장이나 기존 급여 계산 데이터가 깨지지 않도록 하기 위한 방식
    @PostMapping("/salary-policy/delete")
    public String deleteSalaryPolicy(@RequestParam Long policyId,
                                     @RequestParam(defaultValue = "1") int searchPage,
                                     @RequestParam(defaultValue = "10") int searchSize,
                                     @RequestParam(required = false) String searchDeptId,
                                     @RequestParam(required = false) String searchPositionId,
                                     @RequestParam(required = false) String searchGradeId,
                                     @RequestParam(required = false) String searchKeyword,
                                     RedirectAttributes redirectAttributes) {

        adPayrollService.deleteSalaryPolicy(policyId);

        redirectAttributes.addFlashAttribute("successMessage", "기본급 정책이 삭제되었습니다.");

        addSearchCondition(redirectAttributes, searchPage, searchSize,
                searchDeptId, searchPositionId, searchGradeId, searchKeyword);

        return "redirect:/admin/payroll/salary-policy";
    }

    // 등록/수정/삭제 후 기존 페이지 번호와 검색 조건을 유지하기 위한 공통 메서드
    private void addSearchCondition(RedirectAttributes redirectAttributes,
                                    int page,
                                    int size,
                                    String deptId,
                                    String positionId,
                                    String gradeId,
                                    String keyword) {

        redirectAttributes.addAttribute("page", page);
        redirectAttributes.addAttribute("size", size);

        if (deptId != null && !deptId.isBlank()) {
            redirectAttributes.addAttribute("deptId", deptId);
        }

        if (positionId != null && !positionId.isBlank()) {
            redirectAttributes.addAttribute("positionId", positionId);
        }

        if (gradeId != null && !gradeId.isBlank()) {
            redirectAttributes.addAttribute("gradeId", gradeId);
        }

        if (keyword != null && !keyword.isBlank()) {
            redirectAttributes.addAttribute("keyword", keyword);
        }
    }
}
