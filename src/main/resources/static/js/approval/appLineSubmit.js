/**
 * @Description : 전자결재선 서식 생성&수정 시 저장/수정 전송 전용
 * @Author : 송영은
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.05.08    송영은       최초 생성
*/

// payload 생성
function buildPayload() {

    return {
        formName: $('#formName').val(),

        refTargets:
            [...selectedState.ref.values()],

        approvalSteps:
            Object.entries(selectedState.approval)
                .filter(([_, map]) => map && map.size > 0)
                .map(([step, map]) => ({
                    step: Number(step),
                    targets: [...map.values()]
                }))
    };
}

// TODO 보완 필요
function submitCreate() {

    const payload = buildPayload();

    // 서버 전송
    $.ajax({
        url: '/admin/approval/createAppLineFormAction',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(payload),
        success: function () {
            alert('저장 완료');
            window.location.href = '/admin/approval/appLineFormList'; // 결재선 서식 목록 확면으로 이동
        },
        error: function () {
            alert('저장 실패');
        }
    });
}