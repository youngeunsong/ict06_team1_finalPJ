/*
 * edit.js
 *
 * 사원 수정 화면 전용 JavaScript
 *
 * 담당 기능:
 * - 서버에서 전달한 에러 메시지 alert 출력
 * - 프로필 / 서명 이미지 미리보기
 * - 이메일 도메인 직접 입력 처리
 * - 연락처 자동 하이픈 처리
 * - 계좌번호 입력값 제한
 * - 수정 전 필수값 / 형식 검사
 * - 비밀번호를 입력한 경우에만 길이 검사
 */
document.addEventListener("DOMContentLoaded", function () {

    // Controller에서 hidden input으로 내려준 에러 메시지를 읽는다.
    const errorMessageInput = document.getElementById("errorMessage");
    const errorFieldInput = document.getElementById("errorField");

    const errorMessage = errorMessageInput ? errorMessageInput.value : "";
    const errorField = errorFieldInput ? errorFieldInput.value : "";

    // 에러 메시지가 있으면 alert 표시 후 해당 필드에 focus
    if (errorMessage && errorMessage !== "null" && errorMessage.trim() !== "") {
        alert(errorMessage);

        if (errorField && errorField !== "null") {
            const target = document.getElementById(errorField);
            if (target) {
                target.focus();
            }
        }
    }

    // 수정 form
    const form = document.getElementById("employeeUpdateForm");

    // 필수 입력 요소들
    const requiredInputs = document.querySelectorAll(".required-input");

    // 이메일 도메인 직접 입력 관련 요소
    const emailDomainSelect = document.getElementById("emailDomain");
    const customEmailDomainInput = document.getElementById("customEmailDomain");

    // 연락처 / 계좌번호 / 비밀번호
    const phoneInput = document.getElementById("phone");
    const accountNoInput = document.getElementById("accountNo");
    const passwordInput = document.getElementById("password");

    // 이미지 업로드 관련 요소
    const profileImgFile = document.getElementById("profileImgFile");
    const profilePreview = document.getElementById("profilePreview");
    const signImgFile = document.getElementById("signImgFile");
    const signPreview = document.getElementById("signPreview");

    /*
     * 이미지 미리보기 함수
     *
     * 수정 화면은 기존 이미지가 이미 보일 수 있으므로
     * 파일 선택을 취소해도 기존 이미지를 지우지 않는다.
     */
    function previewImage(fileInput, previewImg) {
        const file = fileInput.files[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            alert("이미지 파일만 선택할 수 있습니다.");
            fileInput.value = "";
            return;
        }

        previewImg.src = URL.createObjectURL(file);
        previewImg.style.display = "block";
    }

    // 프로필 이미지 선택 시 미리보기
    profileImgFile.addEventListener("change", function () {
        previewImage(profileImgFile, profilePreview);
    });

    // 서명 이미지 선택 시 미리보기
    signImgFile.addEventListener("change", function () {
        previewImage(signImgFile, signPreview);
    });

    // 이메일 도메인 직접 입력 처리
    emailDomainSelect.addEventListener("change", function () {
        if (emailDomainSelect.value === "custom") {
            customEmailDomainInput.classList.remove("d-none");
            customEmailDomainInput.focus();
        } else {
            customEmailDomainInput.classList.add("d-none");
            customEmailDomainInput.value = "";
        }
    });

    // 연락처 자동 하이픈 처리
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
     * 수정 submit 전 최종 검증
     */
    form.addEventListener("submit", function (event) {

        // 이메일 직접 입력 선택 시 select 값을 직접 입력한 도메인으로 교체
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

        // 수정 화면은 비밀번호를 입력한 경우에만 길이 검사
        if (passwordInput.value.trim() !== "" && passwordInput.value.length < 4) {
            event.preventDefault();
            alert("비밀번호는 4자 이상 입력하세요.");
            passwordInput.focus();
            return;
        }

        // 수정 확인
        const result = confirm("사원 정보를 수정하시겠습니까?");
        if (!result) {
            event.preventDefault();
        }
    });
});
