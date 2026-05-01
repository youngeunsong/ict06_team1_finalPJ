/*
 * 사원 등록 화면 JS
 *
 * 담당 기능:
 * 1. 서버에서 넘어온 에러 메시지 alert 표시
 * 2. 프로필 / 서명 이미지 미리보기
 * 3. 입사일 기준 사번 자동 생성
 * 4. 이름 기준 로그인 아이디 자동 생성
 * 5. 이메일 직접 입력 처리
 * 6. 연락처 자동 하이픈 처리
 * 7. 계좌번호 입력 제한
 * 8. 등록 전 필수값 / 형식 검사
 */
document.addEventListener("DOMContentLoaded", function () {

    /*
     * Controller에서 model로 넘긴 에러 메시지
     *
     * create.html에서 아래 hidden input을 추가해서 쓰는 방식이 가장 안전하다.
     *
     * <input type="hidden" id="errorMessage" th:value="${errorMessage}">
     * <input type="hidden" id="errorField" th:value="${errorField}">
     */
    const errorMessageInput = document.getElementById("errorMessage");
    const errorFieldInput = document.getElementById("errorField");

    const errorMessage = errorMessageInput ? errorMessageInput.value : "";
    const errorField = errorFieldInput ? errorFieldInput.value : "";

    if (errorMessage && errorMessage !== "null" && errorMessage.trim() !== "") {
        alert(errorMessage);

        if (errorField && errorField !== "null") {
            const target = document.getElementById(errorField);
            if (target) {
                target.focus();
            }
        }
    }

    // 등록 form
    const form = document.getElementById("employeeCreateForm");

    // 필수 입력값들
    const requiredInputs = document.querySelectorAll(".required-input");

    // 사번 관련 요소
    const empNoInput = document.getElementById("empNo");
    const generateEmpNoBtn = document.getElementById("generateEmpNoBtn");

    // 이름 / 아이디 관련 요소
    const nameInput = document.getElementById("name");
    const empIdInput = document.getElementById("empId");
    const generateEmpIdBtn = document.getElementById("generateEmpIdBtn");

    // 이메일 도메인 직접 입력 관련 요소
    const emailDomainSelect = document.getElementById("emailDomain");
    const customEmailDomainInput = document.getElementById("customEmailDomain");

    // 연락처 / 계좌번호
    const phoneInput = document.getElementById("phone");
    const accountNoInput = document.getElementById("accountNo");

    // 입사일
    const hireDateInput = document.getElementById("hireDate");
    const hireDateBtn = document.getElementById("hireDateBtn");

    // 프로필 이미지
    const profileImgFile = document.getElementById("profileImgFile");
    const profilePreview = document.getElementById("profilePreview");

    // 서명 이미지
    const signImgFile = document.getElementById("signImgFile");
    const signPreview = document.getElementById("signPreview");

    /*
     * 이미지 미리보기 함수
     *
     * 파일을 선택하면 브라우저에서 임시 URL을 만들어
     * img 태그에 미리 보여준다.
     */
    function previewImage(fileInput, previewImg) {
        const file = fileInput.files[0];

        if (!file) {
            previewImg.style.display = "none";
            previewImg.src = "";
            return;
        }

        if (!file.type.startsWith("image/")) {
            alert("이미지 파일만 선택할 수 있습니다.");
            fileInput.value = "";
            previewImg.style.display = "none";
            previewImg.src = "";
            return;
        }

        previewImg.src = URL.createObjectURL(file);
        previewImg.style.display = "block";
    }

    // 프로필 사진 선택 시 미리보기
    profileImgFile.addEventListener("change", function () {
        previewImage(profileImgFile, profilePreview);
    });

    // 서명 이미지 선택 시 미리보기
    signImgFile.addEventListener("change", function () {
        previewImage(signImgFile, signPreview);
    });

    /*
     * 입사일 기본값 설정
     *
     * 입사일이 비어 있으면 오늘 날짜를 자동 입력한다.
     */
    if (!hireDateInput.value) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");

        hireDateInput.value = `${yyyy}-${mm}-${dd}`;
    }

    // 달력 버튼 클릭 시 date picker 열기
    hireDateBtn.addEventListener("click", function () {
        if (hireDateInput.showPicker) {
            hireDateInput.showPicker();
        } else {
            hireDateInput.focus();
        }
    });

    /*
     * 사번 자동 생성
     *
     * /admin/employees/generate-emp-no 로 요청을 보내서
     * 서버에서 생성한 사번을 받아온다.
     */
    async function generateEmpNo() {
        const hireDate = hireDateInput.value;

        if (!hireDate) {
            alert("입사일을 먼저 선택하세요.");
            hireDateInput.focus();
            return;
        }

        const response = await fetch(`/admin/employees/generate-emp-no?hireDate=${encodeURIComponent(hireDate)}`);

        if (!response.ok) {
            alert("사번 자동 생성에 실패했습니다.");
            return;
        }

        empNoInput.value = await response.text();
    }

    // 자동생성 버튼 클릭 시 사번 생성
    generateEmpNoBtn.addEventListener("click", generateEmpNo);

    // 입사일 변경 시 사번 다시 생성
    hireDateInput.addEventListener("change", function () {
        generateEmpNo();
    });

    // 처음 화면 진입 시 사번이 비어 있으면 자동 생성
    if (!empNoInput.value) {
        generateEmpNo();
    }

    /*
     * 로그인 아이디 자동 생성
     *
     * 이름을 기준으로 서버에서 아이디를 생성한다.
     */
    async function generateEmpId() {
        const name = nameInput.value.trim();

        if (!name) {
            alert("이름을 먼저 입력하세요.");
            nameInput.focus();
            return;
        }

        const response = await fetch(`/admin/employees/generate-emp-id?name=${encodeURIComponent(name)}`);

        if (!response.ok) {
            alert("아이디 자동 생성에 실패했습니다.");
            return;
        }

        empIdInput.value = await response.text();
    }

    // 아이디 자동생성 버튼
    generateEmpIdBtn.addEventListener("click", generateEmpId);

    // 이름 입력 후 포커스가 빠졌을 때 아이디가 비어 있으면 자동 생성
    nameInput.addEventListener("blur", function () {
        if (nameInput.value.trim() && !empIdInput.value.trim()) {
            generateEmpId();
        }
    });

    /*
     * 이메일 도메인 직접 입력 처리
     *
     * custom 선택 시 직접 입력 input을 보여준다.
     */
    emailDomainSelect.addEventListener("change", function () {
        if (emailDomainSelect.value === "custom") {
            customEmailDomainInput.classList.remove("d-none");
            customEmailDomainInput.focus();
        } else {
            customEmailDomainInput.classList.add("d-none");
            customEmailDomainInput.value = "";
        }
    });

    /*
     * 연락처 자동 하이픈 처리
     *
     * 숫자만 입력받고 010-0000-0000 형태로 바꾼다.
     */
    phoneInput.addEventListener("input", function () {
        let value = phoneInput.value.replace(/[^0-9]/g, "");

        if (value.length < 4) {
            phoneInput.value = value;
        } else if (value.length < 8) {
            phoneInput.value = value.replace(/(\d{3})(\d+)/, "$1-$2");
        } else {
            phoneInput.value = value.replace(/(\d{3})(\d{4})(\d+)/, "$1-$2-$3");
        }
    });

    // 계좌번호는 숫자와 하이픈만 입력 가능
    accountNoInput.addEventListener("input", function () {
        accountNoInput.value = accountNoInput.value.replace(/[^0-9-]/g, "");
    });

    /*
     * 등록 버튼 클릭 시 최종 검증
     *
     * 문제가 있으면 submit을 막는다.
     */
    form.addEventListener("submit", function (event) {

        // 이메일 직접 입력 처리
        if (emailDomainSelect.value === "custom") {
            const customDomain = customEmailDomainInput.value.trim();

            if (!customDomain) {
                event.preventDefault();
                alert("빈칸 없이 입력하세요.");
                customEmailDomainInput.focus();
                return;
            }

            emailDomainSelect.innerHTML = `<option value="${customDomain}" selected>${customDomain}</option>`;
        }

        // 필수값 검사
        for (const input of requiredInputs) {
            if (!input.value || input.value.trim() === "") {
                event.preventDefault();
                alert("빈칸 없이 입력하세요.");
                input.focus();
                return;
            }
        }

        // 사번 생성 여부 검사
        if (!empNoInput.value.trim()) {
            event.preventDefault();
            alert("입사일을 선택해 사번을 생성하세요.");
            hireDateInput.focus();
            return;
        }

        // 연락처 형식 검사
        const phonePattern = /^010-\d{4}-\d{4}$/;
        if (!phonePattern.test(phoneInput.value)) {
            event.preventDefault();
            alert("연락처는 010-0000-0000 형식으로 입력하세요.");
            phoneInput.focus();
            return;
        }

        // 계좌번호 형식 검사
        const accountPattern = /^[0-9-]+$/;
        if (!accountPattern.test(accountNoInput.value)) {
            event.preventDefault();
            alert("계좌번호는 숫자와 하이픈만 입력하세요.");
            accountNoInput.focus();
            return;
        }

        // 비밀번호 길이 검사
        const passwordInput = document.getElementById("password");
        if (passwordInput && passwordInput.value.length < 4) {
            event.preventDefault();
            alert("비밀번호는 4자 이상 입력하세요.");
            passwordInput.focus();
            return;
        }

        // 최종 등록 확인
        const result = confirm("사원을 등록하시겠습니까?");
        if (!result) {
            event.preventDefault();
        }
    });
});