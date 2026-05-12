/**
 * @Description : 전자결재선 서식 생성&수정 시 Ajax만 모음
 * @Author : 송영은
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.05.08    송영은       최초 생성
*/
function loadEmployees(keyword, page = 0) {

    $.get('/admin/approval/targets/employees', {
        keyword: keyword,
        minPositionId:
            state.searchMode === 'app'
                ? getPreviousStepMinPosition()
                : null, // 이전 결재 단계보다 높은 직급의 사원만 조회
        page: page,
        size: 10
    }, function (res) {

        renderEmployeeList(res.content);
        renderPagination(res);
    });
}

function loadDepartments() {

    $.get('/admin/approval/targets/departments',
        function (data) {
            renderDeptList(data);
        });
}

function loadPositions() {

    $.get('/admin/approval/targets/positions',
        function (data) {
            renderPositionList(data);
        });
}