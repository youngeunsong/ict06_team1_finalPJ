/**
 * @FileName : createTemplate.js
 * @Description : 동적으로 전자결재 서식의 필드를 추가하는 코드입니다. 전자결재 수정에서도 addField() 메서드 사용 중
 * @Author : 송영은
 * @Date : 2026. 04. 29
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.29    송영은       최초 생성
 * @ 2026.05.04    송영은       서식 수정 오류 해결
*/

let fields = [];

function formatKrwAmount(value) {
    const digits = String(value ?? '').replace(/[^\d]/g, '');
    if (!digits) return '';
    return Number(digits).toLocaleString('ko-KR') + ' 원';
}

function unformatKrwAmount(value) {
    return String(value ?? '').replace(/[^\d]/g, '');
}

// 1. 필드 동적 추가 로직
function addField(type, label = '', placeholder = '', description = '') {
    const container = document.getElementById('dynamicFields');
    const fieldId = 'field_' + Date.now();
    const fieldNameId = fieldId + '_name';

    const now = new Date().toTimeString().slice(0, 5);
    const today = new Date().toISOString().slice(0, 10);

    // class에 field-label 있어야 editForm.html의 서식 수정 로직 정상 작동
    const fieldName = `
        <div class="flex-grow-1">
            <input type="text"
                class="form-control border-0 shadow-none field-label"
                placeholder="⭐항목명을 작성해주세요"
                id="${fieldNameId}"
                required
                value="${label || ''}">
            <input type="text"
                class="form-control form-control-sm border-0 shadow-none text-muted field-description"
                placeholder="이 필드에 입력할 내용을 안내해주세요"
                value="${description || ''}">
        </div>
    `;

    // class에 field-placeholder 있어야 editForm.html의 서식 수정 로직 정상 작동
    let inputHtml = '';
    if (type === 'text') inputHtml += `<input type="text" class="form-control field-placeholder" placeholder="${placeholder || ''}">`;
    if (type === 'number') inputHtml += `<input type="number" class="form-control field-placeholder" placeholder="0">`;
    if (type === 'date') inputHtml += `<input type="date" class="form-control field-placeholder" value="${today}">`;
    if (type === 'time') inputHtml += `<input type="time" class="form-control field-placeholder" value="${now}">`;
    if (type === 'amount') inputHtml += `<input type="text" class="form-control field-placeholder amount-input" inputmode="numeric" placeholder="0 원" value="${formatKrwAmount(placeholder)}">`;

    // class에 field-item 있어야 editForm.html의 서식 수정 로직 정상 작동
    const fieldHtml = `
        <div class="input-group mb-3 border-0 p-2 position-relative gap-3 field-item align-items-start"
            id="${fieldId}"
            data-id="${fieldId}"
            data-type="${type}">
            ${fieldName}
            ${inputHtml}
            <button type="button" class="btn btn-sm btn-danger top-0 end-0" onclick="removeField('${fieldId}')">X</button>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', fieldHtml);

    // DB에 저장할 최종 서식 배열에 저장
    fields.push({
        id: fieldId,
        nameId: fieldNameId,
        type: type,
        placeholder: placeholder,
        description: description,
        required: false
    });
}

// 2. 필드 삭제 함수
function removeField(fieldId) {
    // 1) 화면에서 제거
    document.getElementById(fieldId).remove();
    // 2) 배열에서 제거
    fields = fields.filter(f => f.id !== fieldId);
}

// 3. submit 버튼 누르면 DB에 저장할 최종 json 도출 후 컨트롤러에 전달
$(document).on('input', '.amount-input', function () {
    this.value = formatKrwAmount(this.value);
});

$('#formEditor').on('submit', function (e) {
    e.preventDefault();

    // 서식 제목, 첨부파일 필수 여부 설정 가져오기
    let formData = {
        title: $('#formTitle').val(),
        fields: [],
        fileRequired: $('#isFileRequired').val() === 'yes'
    };

    // 동적으로 추가된 인풋 태그 정보 json화
    for (let field of fields) {
        const $field = $(`#${field.id}`);
        formData.fields.push({
             id: field.id,                                  // input 태그 id
                        type: field.type,                   // input 태그 type
                        label: $(`#${field.nameId}`).val(), // input 태그와 연결될 label의 필드명
            placeholder: field.type === 'amount'
                ? unformatKrwAmount($field.find('.field-placeholder').val())
                : field.placeholder,                        // // input 태그 placeholder
            description: $field.find('.field-description').val()
        });
    }

    // Ajax 방식으로 보내기
    $.ajax({
        url: '/admin/approval/createAppForm/action',
        type: 'POST',
        contentType: 'application/json; charset=UTF-8',
        data: JSON.stringify({
            formName: formData.title,
            template: JSON.stringify(formData)  // DB에는 문자열로 저장
        }),
        success: function (res) {
            console.log('저장 성공:', res);
            alert('저장되었습니다.');
            window.location.href = "/admin/approval/appFormList"; // DB 저장 성공 시 서식 목록으로 돌아가기
        },
        error: function (err) {
            console.error('에러:', err);
            alert('오류가 발생했습니다.');
        }
    });
});
