/**
 * @Description : 전자결재선 서식 생성&수정 시 UI 렌더링 메서드 모음
 * @Author : 송영은
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.05.08    송영은       최초 생성
*/

// renderEmployeeList
// 사원 목록 렌더링
function renderEmployeeList(data) {

    let html = '';

    if (!data || data.length === 0) {
        html = `<div class="text-muted">조회 결과 없음</div>`;
    } else {

        data.forEach(emp => {
            // 이전 결재 단계보다 높은 직급의 사원만 결재 가능하게 설정
            const minPositionId = getPreviousStepMinPosition(); // 각 결재 단계별 결재 가능 최소 직급 구하기

            // 결재 가능 최소 직급보다 낮은 직급의 사원은 제외
            // if (state.searchMode === 'app' && emp.positionId <= minPositionId) {
            //     return;
            // }
            
            // 렌더링할 값 가져오기
            const id = String(emp.empNo);

            const type = 'USER';

            const key = `${type}_${id}`;

            let isChecked = false;

            if (state.searchMode === 'ref') {
                isChecked = selectedState.ref.has(key);
            } else {
                const stepMap = selectedState.approval[state.currentEditingStep] || new Map();
                isChecked = stepMap.has(key);
            }

            html += `
                <label class="list-group-item d-flex align-items-center">
                    <input type="checkbox"
                        class="form-check-input me-2 target-checkbox"
                        value="${id}"

                        data-name="${emp.name}"
                        data-dept="${emp.deptName}"
                        data-position="${emp.positionName}"

                        data-position-id="${emp.positionId}"

                        data-type="${type}"

                        ${isChecked ? 'checked' : ''}>

                    ${emp.deptName} / ${emp.positionName}
                    / <strong>${emp.name}</strong> (${emp.empNo})
                </label>
            `;

            console.log(
                emp.name,
                emp.positionName,
                emp.positionId
            );
        });
    }

    $('#employeeList').html(html);
}

// renderDeptList
// 부서 목록 렌더링
function renderDeptList(data) {

    let html = '';

    if (!data || data.length === 0) {
        html = `<div class="text-muted">조회 결과 없음</div>`;
    } else {
        const selectedDeptIds = getSelectedDeptIdsBeforeCurrentStep();

        data.forEach(dept => {

            const id = String(dept.id);

            const type = 'DEPT';

            const key = `${type}_${id}`;

            let isChecked = false;

            if (state.searchMode === 'ref') {
                isChecked = selectedState.ref.has(key);
            } else {
                const stepMap = selectedState.approval[state.currentEditingStep] || new Map();
                isChecked = stepMap.has(key);
            }

            html += `
                <label class="list-group-item">
                    <input type="checkbox"
                        class="form-check-input me-2 target-checkbox"
                        value="${id}"
                        data-name="${dept.name}"
                        data-type="${type}"
                        ${isChecked ? 'checked' : ''}>
                    ${dept.name}
                </label>
            `;
        });
    }

    $('#deptList').html(html);
}

// renderPositionList
// 직급 목록 렌더링
function renderPositionList(data) {

    let html = '';

    if (!data || data.length === 0) {
        html = `<div class="text-muted">조회 결과 없음</div>`;
    } else {

        data.forEach(pos => {

            const minPositionId = getPreviousStepMinPosition(); // 각 결재 단계의 결재 가능 최소 직급 구하기 

            if (state.searchMode === 'ref' || pos.id > minPositionId) { // 가장 낮은 직급은 결재자가 될 수 없음. 

                const id = String(pos.id);

                const type = 'POSITION';

                const key = `${type}_${id}`;

                let isChecked = false;

                if (state.searchMode === 'ref') {
                    isChecked = selectedState.ref.has(key);
                } else {
                    const stepMap = selectedState.approval[state.currentEditingStep] || new Map();
                    isChecked = stepMap.has(key);
                }

                html += `
                    <label class="list-group-item">
                        <input type="checkbox"
                            class="form-check-input me-2 target-checkbox"
                            value="${id}"
                            data-name="${pos.name}"
                            data-position-id="${pos.id}"
                            data-type="${type}"
                            ${isChecked ? 'checked' : ''}>
                        ${pos.name}
                    </label>
                `;
                console.log(pos.name, pos.id);  
            }
        });
    }

    $('#positionList').html(html);
}

// renderBadge
// badge 렌더링 + 삭제 버튼
function renderBadge(item, type, step = null) {
    let label = item.name;
    
    // 대상 유형= 사용자 -> 부서, 직급, 이름, 사번 모두 출력
    if (item.type === 'USER') {
        label =
            `${item.dept} / ${item.position}
            / ${item.name} (${item.id})`;
    }

    return `
        <span class="badge bg-${type === 'ref' ? 'secondary' : 'primary'} me-1">
            ${label}
            <button type="button" class="btn-close btn-close-white ms-1"
                onclick="removeSelected('${type}', '${item.type}', '${item.id}', '${step}')"></button>
        </span>
    `;
}

// renderPagination
// 사원 목록 페이징 처리
function renderPagination(res) {

    let html = '';

    for (let i = 0; i < res.totalPages; i++) {
        html += `
            <button class="btn btn-sm ${i === res.number ? 'btn-primary' : 'btn-outline-primary'}"
                onclick="loadEmployees($('#targetList input[type=search]').val(), ${i})">
                ${i + 1}
            </button>
        `;
    }

    $('#pagination').html(html);
}

// renderTargetUI
// 유형별 UI 렌더링: targetList 내용 다르게 렌더링
function renderTargetUI() {
    let html = '';

    // 검색버튼 구현 html
    const searchButtonHtml = `
        <div class="col-md-1">
            <button id="searchBtn" class="btn btn-outline-success w-100 h-100 d-flex justify-content-center align-items-center" type="button">
                <i class="fa-solid fa-magnifying-glass"></i>
            </button>
        </div>
    `;

    // 검색 유형 별 렌더링
    if (state.targetType === 'user') {
        html = '<div class="d-flex justify-content-between">';
        html += renderSearchWindow('사원 이름, 사번'); 
        html += searchButtonHtml; 
        html += `
            </div>
                <div class="mt-3">
                    <p>👤 사원 목록</p>
                    <div id="employeeList" class="list-group"></div>
                    <div id="pagination" class="mt-2"></div> 
                </div>`;
    }

    if (state.targetType === 'dept') {
        html = '<div class="d-flex justify-content-between">';
        html += `
            </div>
                <div class="mt-3">
                    <p>🏢 부서 목록</p>
                    <div id="deptList" class="list-group"></div>
                </div>`;
    }

    if (state.targetType === 'position') {
        html = `
            <div class="mt-3">
                <p>📌 직급 목록</p>
                <div id="positionList" class="list-group"></div>
            </div>`;
    }

    $('#targetList').html(html);

    // ⭐ 렌더링 후 데이터 호출
    if (state.targetType === 'user') loadEmployees('');
    if (state.targetType === 'dept') loadDepartments();
    if (state.targetType === 'position') loadPositions();
}

// renderSearchWindow
// 검색창의 plcaeholder 내용 업데이트 
function renderSearchWindow(placeholder){
    let html = `
        <div class="col-md-11">
            <input class="form-control w-100" type="search" placeholder="${placeholder}" aria-label="Search"/>
        </div>
    `
    return html;
}

// addApprovalStepUI
// 결재 단계 UI 생성 (왼쪽) : 수정, 삭제 기능
function addApprovalStepUI(step) {
    const html = `
        <div class="card p-2 mb-2 approval-step-card"
            id="approval_${step}"
            data-step="${step}"
            onclick="editApprovalStep(${step})">

            <div class="d-flex justify-content-between">

                <span class="step-title">${step}단계</span>

                <button type="button"
                    class="btn btn-sm btn-danger top-0 end-0"
                    onclick="event.stopPropagation(); removeStep(${step})">
                    -
                </button>
            </div>

            <div class="approval-targets"></div>
        </div>
    `;

    $('#approvalList').append(html);
}