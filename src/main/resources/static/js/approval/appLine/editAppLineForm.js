/**
 * @Description : 전자결재선 서식 수정
 * @Author : 송영은
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.05.08    송영은       최초 생성
*/

// 1) 기존 데이터 로딩
$(document).ready(function () {
    bindCommonEvents();
    loadDetail(templateId);
});

// 결재선 데이터 로딩 후 렌더링
function loadDetail(templateId) {
    $.get(
        `/admin/approval/appLineFormDetailData/${templateId}`,
        function(detail) {
            applyDetailData(detail);
            renderTargetUI();
        }
    );
}

//function applyDetailData(detail) {
//
//    $('#formName').val(detail.formName);
//
//    $('#appLineDesc').val(detail.description);
//
//    $('#checkDefault').prop(
//        'checked',
//        detail.isDefault
//    );
//
//    // // 참조 대상 복원
//    // detail.refTargets.forEach(...)
//
//    // // 결재 단계 복원
//    // detail.approvalSteps.forEach(...)
//}

// 최종 수정 내용 submit
$('#appFormEditor').on('submit', function(e){

    e.preventDefault();

    const payload = buildPayload();

    $.ajax({

        url:
            `/admin/approval/appLineForm/${templateId}`,

        type: 'PUT',

        contentType: 'application/json',

        data: JSON.stringify(payload),

        success: function(){

            alert('수정 완료');

            location.href =
                `/admin/approval/appLineFormDetail/${templateId}`;
        },

        error: function(xhr){

            console.error(xhr);

            alert('수정 실패');
        }
    });
});