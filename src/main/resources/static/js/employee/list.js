/*
 * list.js
 *
 * 사원 목록 화면 전용 JavaScript
 *
 * 담당 기능:
 * - 사원 목록 검색 form 기본 동작
 * - 본부 선택 시 해당 본부의 팀 목록을 Ajax로 조회
 * - 팀 select box를 동적으로 갱신
 *
 * 검색 자체는 form의 GET 요청으로 Controller에 전달된다.
 */
document.addEventListener("DOMContentLoaded", function () {
    /*
     * 사원 목록 검색 form
     *
     * 현재 검색은 form submit으로 처리한다.
     */
    const searchForm = document.getElementById("employeeSearchForm");

    /*
     * 본부 select
     *
     * list.html 검색 영역에 있어야 하는 id:
     * id="parentDeptSelect"
     */
    const parentDeptSelect = document.getElementById("parentDeptSelect");

    /*
     * 팀 select
     *
     * list.html 검색 영역에 있어야 하는 id:
     * id="teamDeptSelect"
     */
    const teamDeptSelect = document.getElementById("teamDeptSelect");

    /*
     * 본부/팀 select가 없는 화면이라면
     * 아래 로직을 실행하지 않는다.
     *
     * 예:
     * 같은 list.js를 다른 화면에서 재사용할 가능성 방어
     */
    if (!parentDeptSelect || !teamDeptSelect) {
        return;
    }

    /*
     * 본부 선택 변경 이벤트
     *
     * 사용자가 본부를 선택하면
     * /admin/employees/departments/{parentDeptId}/teams API를 호출해서
     * 해당 본부 아래 팀 목록을 가져온다.
     */
    parentDeptSelect.addEventListener("change", function () {
        const parentDeptId = parentDeptSelect.value;

        /*
         * 본부를 전체 본부로 바꾼 경우
         * 팀 select도 전체 팀만 남기고 초기화한다.
         */
        if (!parentDeptId) {
            resetTeamSelect();
            return;
        }

        /*
         * 본부를 선택한 경우
         * 해당 본부 아래 팀 목록을 Ajax로 조회한다.
         */
        fetchTeamsByParentDeptId(parentDeptId);
    });

    /*
     * 팀 select 초기화
     *
     * 전체 본부 선택 시 또는 Ajax 오류 시 사용한다.
     */
    function resetTeamSelect() {
        teamDeptSelect.innerHTML = "";

        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "전체 팀";

        teamDeptSelect.appendChild(defaultOption);
    }

    /*
     * 특정 본부의 팀 목록 조회
     *
     * 요청 예:
     * GET /admin/employees/departments/1/teams
     *
     * 응답 예:
     * [
     *   { "id": 2, "name": "개발1팀(BE)" },
     *   { "id": 3, "name": "개발2팀(FE)" }
     * ]
     */
    function fetchTeamsByParentDeptId(parentDeptId) {
        /*
         * Ajax 요청 전에 먼저 팀 select를 초기화한다.
         * 이전 본부의 팀 목록이 잠깐이라도 남아있지 않게 하기 위함이다.
         */
        resetTeamSelect();

        fetch("/admin/employees/departments/" + parentDeptId + "/teams")
            .then(function (response) {
                if (!response.ok) {
                    throw new Error("팀 목록을 불러오지 못했습니다.");
                }

                return response.json();
            })
            .then(function (teams) {
                /*
                 * 조회된 팀 목록을 select option으로 추가한다.
                 */
                teams.forEach(function (team) {
                    const option = document.createElement("option");
                    option.value = team.id;
                    option.textContent = team.name;

                    teamDeptSelect.appendChild(option);
                });
            })
            .catch(function (error) {
                console.error(error);

                /*
                 * 오류가 발생해도 화면이 깨지지 않도록
                 * 팀 select는 전체 팀 상태로 유지한다.
                 */
                resetTeamSelect();
            });
    }
});