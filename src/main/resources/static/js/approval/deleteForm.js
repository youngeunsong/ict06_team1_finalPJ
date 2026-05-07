// 서식 삭제 Ajax
function deleteForm(formId) {
    event.preventDefault(); // 🔥 추가 (안전장치)
    if (!confirm("정말 삭제하시겠습니까?")) return;

    $.ajax({
        url: `/admin/approval/deleteForm/${formId}`,
        type: 'DELETE',
        success: function () {
            alert("삭제되었습니다.");
            location.href = "/admin/approval/templateList";
        },
        error: function (err) {
            console.error(err);
            alert("삭제 실패");
        }
    });
}