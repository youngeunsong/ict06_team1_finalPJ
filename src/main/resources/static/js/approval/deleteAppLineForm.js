// 결재선 서식 삭제 Ajax
function deleteAppLineForm(templateId) {

    if (!confirm("정말 삭제하시겠습니까?")) {
        return;
    }

    $.ajax({
        url: `/admin/approval/deleteAppLineForm/${templateId}`,
        type: "DELETE",

        success: function () {

            alert("삭제되었습니다.");

            // 현재 페이지 다시 조회
            loadPage(currentPage);
        },

        error: function () {

            alert("삭제 실패");
        }
    });
}