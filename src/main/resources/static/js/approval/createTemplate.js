// 1. 필드 동적 추가 로직
function addField(type, label = '새 필드', placeholder = '') {
    const container = document.getElementById('dynamicFields');
    const fieldId = 'field_' + Date.now();

    let inputHtml = `<input type="text" class="form-control border-0 shadow-none" placeholder="필드 명을 작성해주세요">`;
    if(type === 'text') inputHtml += `<input type="text" class="form-control" placeholder="${placeholder}">`;
    if(type === 'date') inputHtml += `<input type="date" class="form-control">`;
    if(type === 'number') inputHtml += `<input type="number" class="form-control" placeholder="0">`;
    if(type === 'time') inputHtml += `<input type="time">`;

    const fieldHtml = `
        <div class="mb-3 border p-2 position-relative" id="${fieldId}">
            ${inputHtml}
            <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0" onclick="document.getElementById('${fieldId}').remove()">X</button>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', fieldHtml);
}

// 2. 프리셋 템플릿 로직 (조퇴, 연차, 지출)
function applyTemplate(type) {
    const container = document.getElementById('dynamicFields');
    container.innerHTML = ''; // 초기화

    if(type === 'leave') {
        addField('date', '연차 시작일');
        addField('date', '연차 종료일');
        addField('text', '사유', '개인 사정 등');
    } else if(type === 'early') {
        addField('date', '조퇴 일자');
        addField('text', '조퇴 시간', '14:00');
        addField('text', '사유');
    } else if(type === 'expense') {
        addField('date', '지출 일자');
        addField('text', '내역', '식비, 교통비 등');
        addField('number', '금액');
    }
}