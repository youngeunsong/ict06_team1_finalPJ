/**
 * @Description : 전자결재선 새 서식 생성
 * @Author : 송영은
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.05.08    송영은       최초 생성
*/

// 초기화
$(document).ready(function () {
    bindCommonEvents(); 
    renderTargetUI();
});

// 최종 제출: 결재선 서식 추가 
// submit 이벤트 발생
$('#appFormEditor').on('submit', function (e) {
    e.preventDefault(); // 기본 submit 함수 작동 방지

    // 실제 결재 단계 수 계산
    const approvalStepCount =
        Object.values(selectedState.approval)
            .filter(map => map && map.size > 0)
            .length;

    // 새 결재선 서식 추가할려면 최소 결재 1단계 이상 필요
    if (approvalStepCount === 0) {
        alert("최소 1개 이상의 결재 단계를 추가해주세요.");
        return;
    }

    // 서식 저장 Ajax 실행
    submitCreateForm();
});

// 새 결재선 서식 저장 Ajax
function submitCreateForm() {

    const payload = buildPayload();

    $.ajax({

        url: '/admin/approval/createAppLineFormAction',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(payload),
        success: function () {
            alert('저장 완료');
            location.href =
                '/admin/approval/appLineFormList'; // 저장 후 결재선 서식 목록 확면으로 이동
        },

        error: function () {
            alert('저장 실패');
        }
    });
}