/*
 * create.js
 *
 * 사원 등록 화면 전용 JavaScript
 *
 * 담당 기능:
 * 1. 서버에서 전달된 에러 메시지 출력
 * 2. 본부 선택 시 팀 목록 동적 조회
 * 3. 프로필 / 서명 이미지 미리보기
 * 4. 입사일 기준 사번 자동 생성
 * 5. 이름 기준 로그인 아이디 자동 생성
 * 6. 이메일 직접 입력 처리
 * 7. 연락처 자동 하이픈 처리
 * 8. 계좌번호 입력 제한
 * 9. 등록 전 필수값 / 형식 검사
 */
document.addEventListener("DOMContentLoaded", function () {

    /*
     * 서버에서 전달한 에러 메시지 처리
     *
     * Controller에서 model.addAttribute("errorMessage", ...)
     * model.addAttribute("errorField", ...)로 넘긴 값을
     * create.html의 hidden input에서 읽는다.
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

    // 이메일 관련 요소
    const emailDomainSelect = document.getElementById("emailDomain");
    const customEmailDomainInput = document.getElementById("customEmailDomain");

    // 연락처 / 계좌번호
    const phoneInput = document.getElementById("phone");
    const accountNoInput = document.getElementById("accountNo");

    // 입사일
    const hireDateInput = document.getElementById("hireDate");
    const hireDateBtn = document.getElementById("hireDateBtn");

    // 이미지 관련 요소
    const profileImgFile = document.getElementById("profileImgFile");
    const profilePreview = document.getElementById("profilePreview");

    const signImgFile = document.getElementById("signImgFile");
    const signPreview = document.getElementById("signPreview");

    /*
     * 본부 / 팀 select 요소
     *
     * parentDeptId = 본부
     * deptId = 팀
     *
     * 실제 EMPLOYEE 테이블에 저장되는 값은 팀 ID인 deptId이다.
     */
    const parentDeptSelect = document.getElementById("parentDeptId");
    const deptSelect = document.getElementById("deptId");

    /*
     * 본부 선택 시 하위 팀 목록 불러오기
     *
     * 요청 주소:
     * /admin/employees/departments/{parentDeptId}/teams
     */
    async function loadTeams(parentDeptId, selectedDeptId) {
        deptSelect.innerHTML = '<option value="">팀 선택</option>';

        if (!parentDeptId) {
            return;
        }

        const response = await fetch(`/admin/employees/departments/${parentDeptId}/teams`);

        if (!response.ok) {
            alert("팀 목록을 불러오지 못했습니다.");
            return;
        }

        const teams = await response.json();

        teams.forEach(function (team) {
            const option = document.createElement("option");
            option.value = team.id;
            option.textContent = team.name;

            if (selectedDeptId && String(selectedDeptId) === String(team.id)) {
                option.selected = true;
            }

            deptSelect.appendChild(option);
        });
    }

    // 본부 변경 시 팀 목록 갱신
    if (parentDeptSelect && deptSelect) {
        parentDeptSelect.addEventListener("change", function () {
            loadTeams(parentDeptSelect.value, null);
        });

        /*
         * 등록 실패 후 다시 create.html로 돌아온 경우
         * 기존 선택 팀을 유지하기 위한 처리
         */
        if (parentDeptSelect.value) {
            loadTeams(parentDeptSelect.value, deptSelect.dataset.selectedDeptId);
        }
    }

    /*
     * 이미지 미리보기 함수
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

    // 프로필 이미지 미리보기
    profileImgFile.addEventListener("change", function () {
        previewImage(profileImgFile, profilePreview);
    });

    // 서명 이미지 미리보기
    signImgFile.addEventListener("change", function () {
        previewImage(signImgFile, signPreview);
    });

    /*
     * 입사일 기본값 설정
     *
     * 비어 있으면 오늘 날짜를 기본값으로 넣는다.
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
     * 입사일을 기준으로 서버에서 사번을 생성한다.
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

    // 사번 자동 생성 버튼
    generateEmpNoBtn.addEventListener("click", generateEmpNo);

    // 입사일 변경 시 사번도 다시 생성
    hireDateInput.addEventListener("change", generateEmpNo);

    // 화면 처음 진입 시 사번이 비어 있으면 자동 생성
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

    // 아이디 자동 생성 버튼
    generateEmpIdBtn.addEventListener("click", generateEmpId);

    // 이름 입력 후 아이디가 비어 있으면 자동 생성
    nameInput.addEventListener("blur", function () {
        if (nameInput.value.trim() && !empIdInput.value.trim()) {
            generateEmpId();
        }
    });

    /*
     * 이메일 도메인 직접 입력 처리
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

    /*
     * 계좌번호는 숫자와 하이픈만 입력 가능
     */
    accountNoInput.addEventListener("input", function () {
        accountNoInput.value = accountNoInput.value.replace(/[^0-9-]/g, "");
    });

    /*
     * 등록 전 최종 검증
     */
    form.addEventListener("submit", function (event) {

        // 이메일 직접 입력 선택 시 직접 입력한 도메인을 select 값으로 바꾼다.
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