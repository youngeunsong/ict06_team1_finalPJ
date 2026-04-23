// 다음 코드는 Node.js를 이용해 일괄적으로 한글로 된 이미지 파일명을 영어로 변환하기 위해 사용했습니다. 

// 코드 실행 방법:
// 1. 해당 폴더 이동
// cd 이미지폴더
// 2. 실행
// node rename.js
const fs = require("fs");

const mapping = {
  "AI 비서 _ 최종 답변 복사 또는 내보내기 중 내보내기 클릭_v2.png": "ai_assistant_export_final_answer_v2.png",
  "AI비서 메인_문서 유형 선택 시.png": "ai_assistant_main_select_document_type.png",
  "AI 비서 메인_직접 작성 시.png": "ai_assistant_main_manual_input.png",
  "AI비서 메인_문서 유형 선택_AI.png": "ai_assistant_main_select_document_type_ai_v2.png",
  "AI비서_AI가 전달 주는 형식에 맞춰 답변.png": "ai_assistant_answer_in_provided_format.png",
  "AI비서_AI가 전달 주는 형식에 맞춰 답변_2.png": "ai_assistant_answer_in_provided_format_v2.png",
  "AI비서_최종 답변 복사 또는 내보내기 중 내보내기 클릭.png": "ai_assistant_export_final_answer.png",
  "AI포털_챗봇.png": "ai_portal_chatbot.png",
  "개인 결재 문서 상세.png": "personal_approval_document_detail.png",
  "개인 문서함.png": "personal_document_box.png",
  "결재 내용 작성_수정_근무계획신청서식.png": "approval_write_edit_work_plan_request.png",
  "결재 내용 작성_수정_부재 일정 신청서식.png": "approval_write_edit_absence_schedule_request.png",
  "결재 내용 작성_수정_지출결의서 서식.png": "approval_write_edit_expense_report_form.png",
  "결재 내용 작성_수정_지출결의서 서식_내역 추가 클릭 후.png": "approval_write_edit_expense_report_add_item.png",
  "결재 대기 문서 상세_결재 상태 수정.png": "approval_pending_document_detail_update_status.png",
  "결재 대기 문서함.png": "approval_pending_documents.png",
  "결재 예정 문서함.png": "approval_scheduled_documents.png",
  "결재내역_작성_수정_결재선_설정.png": "approval_create_edit_approval_line_setting.png",
  "결재라인_작성_수정_결재선 설정.png": "approval_line_create_edit_setting.png",
  "근태관리(주별 보기).png": "attendance_weekly_view.png",
  "근태관리(한달 보기).png": "attendance_monthly_view.png",
  "근태관리_근태통계.png": "attendance_statistics.png",
  "근태관리_출퇴근처리.png": "attendance_checkin_checkout.png",
  "급여명세서 발급.png": "payslip_issue.png",
  "내 정보 수정.png": "edit_my_info.png",
  "마이페이지.png": "my_page.png",
  "사용자_AI 챗봇 열기.png": "user_open_ai_chatbot.png",
  "사용자_AI 챗봇 열기_메뉴 검색창 클릭.png": "user_open_ai_chatbot_click_search.png",
  "사용자_AI 챗봇 열기_메뉴 선택.png": "user_open_ai_chatbot_select_menu.png",
  "사용자_AI 챗봇 열기_메시지.png": "user_open_ai_chatbot_message.png",
  "사용자_AI챗봇.png": "user_ai_chatbot.png",
  "사용자_홈.png": "user_home.png",
  "사원별 급여 확인.png": "employee_salary_view.png",
  "새 결재 진행 - 결재 정보 선택.png": "new_approval_select_info.png",
  "온보딩.png": "onboarding.png",
  "인사평가 메인.png": "hr_evaluation_main.png",
  "일정 간편등록.png": "schedule_quick_add.png",
  "일정 삭제.png": "schedule_delete.png",
  "일정 상세등록_수정.png": "schedule_detail_add_edit.png",
  "임시 저장함.png": "[Approval]tmp_approvals.png",
  "전사 근태 상세내역 및 현황 조회.png": "company_attendance_detail_status.png",
  "전자결재 메인.png": "e_approval_main.png",
  "캘린더 메인(월).png": "calendar_monthly_view.png",
  "캘린더 메인(주).png": "calendar_weekly_view.png",
  "휴가관리.png": "leave_management.png"
};

Object.entries(mapping).forEach(([oldName, newName]) => {
  if (fs.existsSync(oldName)) {
    fs.renameSync(oldName, newName);
    console.log(`Renamed: ${oldName} -> ${newName}`);
  } else {
    console.log(`Not Found: ${oldName}`);
  }
});