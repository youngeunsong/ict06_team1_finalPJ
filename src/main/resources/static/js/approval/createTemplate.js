let fields = [];

function formatKrwAmount(value) {
    const digits = String(value ?? '').replace(/[^\d]/g, '');
    if (!digits) return '';
    return Number(digits).toLocaleString('ko-KR') + ' 원';
}

function unformatKrwAmount(value) {
    return String(value ?? '').replace(/[^\d]/g, '');
}

function addField(type, label = '', placeholder = '', description = '') {
    const container = document.getElementById('dynamicFields');
    const fieldId = 'field_' + Date.now();
    const fieldNameId = fieldId + '_name';

    const now = new Date().toTimeString().slice(0, 5);
    const today = new Date().toISOString().slice(0, 10);

    const fieldName = `
        <div class="flex-grow-1">
            <input type="text"
                class="form-control border-0 shadow-none field-label"
                placeholder="항목명을 작성해주세요"
                id="${fieldNameId}"
                required
                value="${label || ''}">
            <input type="text"
                class="form-control form-control-sm border-0 shadow-none text-muted field-description"
                placeholder="이 필드에 입력할 내용을 안내해주세요"
                value="${description || ''}">
        </div>
    `;

    let inputHtml = '';
    if (type === 'text') inputHtml += `<input type="text" class="form-control field-placeholder" placeholder="${placeholder || ''}">`;
    if (type === 'number') inputHtml += `<input type="number" class="form-control field-placeholder" placeholder="0">`;
    if (type === 'date') inputHtml += `<input type="date" class="form-control field-placeholder" value="${today}">`;
    if (type === 'time') inputHtml += `<input type="time" class="form-control field-placeholder" value="${now}">`;
    if (type === 'amount') inputHtml += `<input type="text" class="form-control field-placeholder amount-input" inputmode="numeric" placeholder="0 원" value="${formatKrwAmount(placeholder)}">`;

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

    fields.push({
        id: fieldId,
        nameId: fieldNameId,
        type: type,
        placeholder: placeholder,
        description: description,
        required: false
    });
}

function removeField(fieldId) {
    document.getElementById(fieldId).remove();
    fields = fields.filter(f => f.id !== fieldId);
}

$(document).on('input', '.amount-input', function () {
    this.value = formatKrwAmount(this.value);
});

$('#formEditor').on('submit', function (e) {
    e.preventDefault();

    let formData = {
        title: $('#formTitle').val(),
        fields: [],
        fileRequired: $('#isFileRequired').val() === 'yes'
    };

    for (let field of fields) {
        const $field = $(`#${field.id}`);
        formData.fields.push({
            id: field.id,
            type: field.type,
            label: $(`#${field.nameId}`).val(),
            placeholder: field.type === 'amount'
                ? unformatKrwAmount($field.find('.field-placeholder').val())
                : field.placeholder,
            description: $field.find('.field-description').val()
        });
    }

    $.ajax({
        url: '/admin/approval/createAppForm/action',
        type: 'POST',
        contentType: 'application/json; charset=UTF-8',
        data: JSON.stringify({
            formName: formData.title,
            template: JSON.stringify(formData)
        }),
        success: function (res) {
            console.log('저장 성공:', res);
            alert('저장되었습니다.');
            window.location.href = "/admin/approval/appFormList";
        },
        error: function (err) {
            console.error('에러:', err);
            alert('오류가 발생했습니다.');
        }
    });
});
