/**
 * @Description : 전자결재선 서식 생성&수정 시 이벤트 핸들러만 모음
 * @Author : 송영은
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.05.08    송영은       최초 생성
*/

// $('#addRefTarget').on(...)
// 참조 대상 추가 버튼 클릭 시 
$('#addRefTarget').on('click', function () {
    openSearchPanel('ref'); // 참조 대상 조회 모드로 설정
});

// $('#addAppSteps').on(...)
// 결재 단계 추가 버튼 클릭 시 
$('#addAppSteps').on('click', function () {
    // TODO: max(position_id) -1 이하여야만 함. 백엔드 통신 후 이 값 수정할 것. 
    if(state.approvalStep <= 4) {
        state.approvalStep++; // 결재 단계 증가
        state.currentEditingStep = state.approvalStep; // 현재 수정 중인 결재 단계 업데이트

        // 왼쪽 UI에도 단계 추가
        addApprovalStepUI(state.approvalStep);

        openSearchPanel('app'); // 결재 대상 조회 모드로 설정
    }
    else{
        alert("더 결재 단계를 추가할 수 없습니다."); 
    }
});

// $('#confirmSelect').on(...)
// 선택 완료 버튼 클릭 시 제출
$('#confirmSelect').on('click', function () {

    const selected = [];

    // 선택된 참조 대상 추가
    if (state.searchMode === 'ref') {
        $('#refList').empty();

        selectedState.ref.forEach(item => {
            $('#refList').append(renderBadge(item, 'ref'));
        });
    } 
    // 선택된 결재 대상 추가
    else {
        const step = state.currentEditingStep;
        const stepDiv = $(`#approval_${step} .approval-targets`);

        stepDiv.empty();

        // const stepMap = selectedState.approval[step] || new Map();
        const stepMap = selectedState.approval[state.currentEditingStep] || new Map();

        stepMap.forEach(item => {
            stepDiv.append(renderBadge(item, 'app', step));
        });
    }

    // 선택 후 패널 가리기
    panel.hide();
});

// $(document).on(...)
// 사원 검색 버튼 클릭 동작
$(document).on('click', '#searchBtn', function () {
    const keyword = $('#targetList input[type="search"]').val();

    if (state.targetType === 'user') {
        loadEmployees(keyword);
    }
    if (state.targetType === 'dept') {
        loadDepartments(); // 필요하면 keyword 전달
    }
});

// 사원/부서/권한 다중 선택 -> 상태 저장
$(document).on('change', '.target-checkbox', function () {

    const id = $(this).val();

    const type = state.targetType === 'user' ? 'USER'
    : state.targetType === 'dept' ? 'DEPT'
    : 'POSITION';

    const key = `${type}_${id}`; // 유형별 키 생성 

    const data = {
        id: id,

        name: $(this).data('name'),

        dept: $(this).data('dept'),

        position: $(this).data('position'),

        positionId: Number($(this).data('position-id')),

        type: type
    };

    // 참조 대상 
    if (state.searchMode === 'ref') {

        if ($(this).is(':checked')) {
            selectedState.ref.set(key, data);
        } else {
            selectedState.ref.delete(key);
        }

    } 
    // 결재 대상
    else {

        if (!selectedState.approval[state.currentEditingStep]) {
            selectedState.approval[state.currentEditingStep] = new Map();
        }

        const stepMap = selectedState.approval[state.currentEditingStep];

        // if ($(this).is(':checked')) {
        //     stepMap.set(key, data);
        // } else {
        //     stepMap.delete(key);
        // }
        
        // 체크 시 저장
        if ($(this).is(':checked')) {

            stepMap.set(key, data);

            // 사원이나 직급 목록 선택 시 최소 직급 갱신
            if (type === 'USER' || type === 'POSITION') {

                const currentMin =
                    approvalRules.minPositionByStep[
                        state.currentEditingStep
                    ] || 0;

                approvalRules.minPositionByStep[
                    state.currentEditingStep
                ] = Math.max(
                    currentMin,
                    data.positionId
                );
            }
        }
        // 체크 해제 시 삭제
        else {

            stepMap.delete(key);
        }

        recalculateStepMinPosition(state.currentEditingStep); // 결재 가능 최소 직급 재계산
    }
});
