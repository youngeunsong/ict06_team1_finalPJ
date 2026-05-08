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
    loadDetail(templateId);
});

function loadDetail(templateId) {
    $.get(
        `/admin/approval/appLineFormDetailData/${templateId}`,
        function(detail) {
            applyDetailData(detail);
            renderTargetUI();
        }
    );
}

// 2) state preload

// 3) 수정 submit
$(document).ready(async function () {

    const data = await loadDetail(templateId);

    applyDetailToState(data);

    renderAll();
});