
let fields = [];

// 1. 필드 동적 추가 로직
function addField(type, label = '새 필드', placeholder = '') {
    const container = document.getElementById('dynamicFields');
    const fieldId = 'field_' + Date.now();
    const fieldNameId = fieldId + '_name';

    const now = new Date().toTimeString().slice(0, 5);// 현재 시각
    const today = new Date().toISOString().slice(0, 10);// 현재 날짜

    let fieldName = `<input type="text" class="form-control border-0 shadow-none" placeholder="⭐항목 명을 작성해주세요" id="${fieldNameId}" required>`; // 반드시 필드명 작성해야 제출 가능
    let inputHtml = '';
    if(type === 'text') inputHtml += `<input type="text" class="form-control" placeholder="${placeholder}">`;
    if(type === 'number') inputHtml += `<input type="number" class="form-control" placeholder="0">`;
    if(type === 'date') inputHtml += `<input type="date" class="form-control" value="${today}">`; // 기본값: 오늘
    if(type === 'time') inputHtml += `<input type="time" value="${now}">`; // 기본값: 현재 시각
    if(type === 'amount') inputHtml += `<input type="number" class="form-control" placeholder="0">`;

    const fieldHtml = `
        <div class="input-group mb-3 border-0 p-2 position-relative gap-3" id="${fieldId}">
            ${fieldName}
            ${inputHtml}
            <button type="button" class="btn btn-sm btn-danger  top-0 end-0" onclick="removeField('${fieldId}')">X</button>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', fieldHtml);

    // DB에 저장할 최종 서식 배열에 저장
    fields.push({
        id: fieldId,
        nameId: fieldNameId,
        type: type,
        placeholder: placeholder,
        required: false
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

// 3. submit 버튼 누르면 DB에 저장할 최종 html 도출 후 컨트롤러에 전달 (기존)
// 3. submit 버튼 누르면 DB에 저장할 최종 json 도출 후 컨트롤러에 전달
$('#formEditor').on('submit', function (e) {
    e.preventDefault(); // 🔥 기본 submit 막기

    // 서식 제목, 첨부파일 필수 여부 설정 가져오기
    let formData = {
        title: $('#formTitle').val(),
        fields: [],
        fileRequired: $('#isFileRequired').val() === 'yes'
    };

    // 동적으로 추가된 인풋 태그 정보 json화
    for(let field of fields){
        formData.fields.push({
            id: field.id,                       // input 태그 id
            type: field.type,                   // input 태그 type
            label: $(`#${field.nameId}`).val(), // input 태그와 연결될 label의 필드명
            placeholder: field.placeholder      // input 태그 placeholder
        });
    }

    // Ajax 방식으로 보내기
    $.ajax({
        url: '/admin/approval/addTemplate',
        type: 'POST',
        contentType: 'application/json; charset=UTF-8',
        data: JSON.stringify({
            formName: formData.title,
            template: JSON.stringify(formData)
        }),

        success: function (res) {
            console.log('저장 성공:', res);
            alert('저장되었습니다.');
            window.location.href = "/admin/approval/templateList"; // DB 저장 성공 시 서식 목록으로 돌아가기
        },
        error: function (err) {
            console.error('에러:', err);
            alert('오류가 발생했습니다.');
        }
    });
});