
let fields = [];

// 1. 필드 동적 추가 로직
function addField(type, label = '새 필드', placeholder = '') {
    const container = document.getElementById('dynamicFields');
    const fieldId = 'field_' + Date.now();
    const fieldNameId = fieldId + '_name';

    const now = new Date().toTimeString().slice(0, 5);// 현재 시각
    const today = new Date().toISOString().slice(0, 10);// 현재 날짜

    let fieldName = `<input type="text" class="form-control border-0 shadow-none" placeholder="필드 명을 작성해주세요" id="${fieldNameId}">`;
    let inputHtml = '';
    if(type === 'text') inputHtml += `<input type="text" class="form-control" placeholder="${placeholder}">`;
    if(type === 'number') inputHtml += `<input type="number" class="form-control" placeholder="0">`;
    if(type === 'date') inputHtml += `<input type="date" class="form-control" value="${today}">`; // 기본값: 오늘
    if(type === 'time') inputHtml += `<input type="time" value="${now}">`; // 기본값: 현재 시각
    if(type === 'amount') inputHtml += `<input type="number" class="form-control" placeholder="0">`;

    const fieldHtml = `
        <div class="input-group mb-3 border-0 p-2 position-relative" id="${fieldId}">
            ${fieldName}
            ${inputHtml}
            <button type="button" class="btn btn-sm btn-danger  top-0 end-0" onclick="removeField('${fieldId}')">X</button>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', fieldHtml);

    // DB에 저장할 최종 서식 배열에 저장
//    fields.push({
//        id: fieldId,
//        html: `
//            <div class="input-group mb-3 border-0 p-2 position-relative" id="${fieldId}">
//                <label>"$('#fieldNameId').val"</label>
//                ${inputHtml}
//            </div>
//        `
//    });
    fields.push({
        id: fieldId,
        nameId: fieldNameId,
        type: type,
        inputHtml: inputHtml
    });
    console.log(fields)
}

// 2. 삭제 함수 추가
function removeField(fieldId) {
    // 1. 화면에서 제거
    document.getElementById(fieldId).remove();

    // 2. 배열에서 제거
    fields = fields.filter(f => f.id !== fieldId);
    console.log(fields)
}

// 3. submit 버튼 누르면 DB에 저장할 최종 html 도출 후 컨트롤러에 전달
$('#formEditor').on('submit', function (e) {
    e.preventDefault(); // 🔥 기본 submit 막기

    let finTemplateHtml = '';

    // 1. 서식 제목 가져오기
    const formTitle = $('#formTitle').val();
    finTemplateHtml += `
        <div class="mb-4 border-bottom pb-3 text-center">
            <h3>"${formTitle}"</h3>
        </div>`;

    // 2. fields에 저장된 html 가져오기
    for(let field of fields){
//        finTemplateHtml += field.html;
        const labelValue = $(`#${field.nameId}`).val();

        finTemplateHtml += `
            <div class="input-group mb-3 border-0 p-2 position-relative">
                <label>${labelValue}</label>
                ${field.inputHtml}
            </div>
        `;
    }

    // 3. 첨부파일 필수면 해당 UI 추가
    if($('#isFileRequired').val() === 'yes'){
        finTemplateHtml += `
            <div class="mb-3">
              <label for="formFile" class="form-label">파일을 첨부해주세요</label>
              <input class="form-control" type="file" id="formFile">
            </div>
        `
    }

    $.ajax({
        url: '/admin/approval/addTemplate',
        type: 'POST',
        contentType: 'application/json; charset=UTF-8',
        data: JSON.stringify({
            templateHtml: finTemplateHtml
        }),

        success: function (res) {
            console.log('저장 성공:', res);
            alert('저장되었습니다.');
        },
        error: function (err) {
            console.error('에러:', err);
            alert('오류 발생');
        }
    });
});