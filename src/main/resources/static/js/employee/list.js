/*
 * list.js
 *
 * 사원 목록 화면 전용 JavaScript
 *
 * 현재 list.html은 검색 form 제출만 사용하므로
 * 필수 JS 기능은 거의 없다.
 *
 * 그래도 파일을 분리해두면 나중에 아래 기능을 추가하기 좋다.
 * - 검색 조건 초기화 버튼
 * - 테이블 행 클릭 이벤트
 * - 페이징 처리
 * - 엑셀 다운로드
 */
document.addEventListener("DOMContentLoaded", function () {
    // 사원 목록 화면이 로드되었을 때 실행된다.
    const searchForm = document.getElementById("employeeSearchForm");

    // 현재는 별도 동작 없음.
    // 검색은 form의 GET 요청으로 Controller에 전달된다.
});
