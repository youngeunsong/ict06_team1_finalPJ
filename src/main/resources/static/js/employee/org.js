/*
 * org.js
 *
 * 조직도 탭 전용 JavaScript
 *
 * 역할:
 * 1. 조직도 탭이 열리면 부서 트리를 API로 조회한다.
 * 2. 왼쪽에 부서 트리를 계층 구조로 출력한다.
 * 3. 부서를 클릭하면 해당 부서의 사원 목록을 API로 조회한다.
 * 4. 조회된 사원 목록을 직급별로 그룹핑해서 오른쪽에 출력한다.
 * 5. 오른쪽 사원 목록은 이름/사번으로 내부 검색할 수 있다.
 * 6. 선택한 부서와 펼침 상태를 화면에서 유지한다.
 */

document.addEventListener("DOMContentLoaded", function () {
    const departmentTree = document.getElementById("departmentTree");

    /*
     * 조직도 영역이 없는 페이지에서는 실행하지 않는다.
     *
     * 이 처리를 해두면 다른 페이지에서 org.js가 로드되어도 오류가 나지 않는다.
     */
    if (!departmentTree) {
        return;
    }

    const searchInput = document.getElementById("orgEmployeeSearchInput");

    /*
     * 조직도 오른쪽 사원 검색 이벤트
     *
     * API를 다시 호출하지 않고,
     * 현재 선택한 부서의 사원 목록 배열에서 이름/사번을 기준으로 필터링한다.
     */
    if (searchInput) {
        searchInput.addEventListener("input", function () {
            filterOrgEmployees(searchInput.value);
        });
    }

    loadDepartmentTree();
});

/*
 * 현재 선택된 부서 버튼
 *
 * 부서를 클릭했을 때 선택 표시를 바꾸기 위해 사용한다.
 */
let selectedDeptNode = null;

/*
 * 현재 선택된 부서 ID
 *
 * 트리 리렌더링이나 검색 이후에도 선택 상태를 유지하기 위해 사용한다.
 */
let selectedDeptId = null;

/*
 * 현재 선택된 부서명
 */
let selectedDeptName = "";

/*
 * 현재 선택한 부서의 전체 사원 목록
 *
 * 검색할 때 API를 다시 호출하지 않고 이 배열에서 필터링한다.
 */
let currentOrgEmployees = [];

/*
 * 현재 열려 있는 최상위 본부 ID
 *
 * 조직도 왼쪽은 아코디언 방식으로 동작한다.
 *
 * - 처음에는 모든 본부가 접혀 있다.
 * - 본부를 클릭하면 해당 본부만 열린다.
 * - 다른 본부를 클릭하면 기존 본부는 자동으로 닫힌다.
 * - 같은 본부를 다시 클릭해도 접히지 않는다.
 */
let openedRootDeptId = null;

/*
 * 직급 출력 순서
 *
 * DB에 저장된 직급명과 맞춰야 한다.
 * 여기에 없는 직급은 가장 아래쪽에 표시된다.
 */
const positionOrder = [
    "수석",
    "주임",
    "선임",
    "책임",
    "사원"
];

/*
 * 조직도 트리 조회
 *
 * 호출 API:
 * GET /api/organization/departments/tree
 */
function loadDepartmentTree() {
    fetch("/api/organization/departments/tree")
        .then(response => {
            /*
             * 403, 404, 500 같은 오류가 발생했을 때
             * response.json()으로 바로 넘어가지 않도록 처리한다.
             */
            if (!response.ok) {
                throw new Error("조직도 API 호출 실패: " + response.status);
            }

            return response.json();
        })
        .then(data => {
            /*
             * 정상 응답은 배열이어야 한다.
             *
             * 예:
             * [
             *   { deptId: 1, deptName: "경영본부", children: [...] }
             * ]
             */
            if (!Array.isArray(data)) {
                throw new Error("조직도 응답 데이터가 배열이 아닙니다.");
            }

            const departmentTree = document.getElementById("departmentTree");
            departmentTree.innerHTML = "";

            if (data.length === 0) {
                departmentTree.innerHTML =
                    "<div class='org-empty-message'>등록된 부서가 없습니다.</div>";
                return;
            }

            const treeElement = createDepartmentTree(data, 0);
            departmentTree.appendChild(treeElement);

            /*
             * 이전에 선택한 부서가 있으면 선택 상태 복원
             */
            restoreSelectedDepartment();
        })
        .catch(error => {
            console.error(error);
            document.getElementById("departmentTree").innerHTML =
                "<div class='text-danger'>조직도 정보를 불러오지 못했습니다.</div>";
        });
}

/*
 * 부서 트리 HTML 생성
 *
 * departments:
 * - 현재 단계의 부서 목록
 *
 * depth:
 * - 현재 트리 깊이
 * - 0이면 최상위 부서
 * - 1 이상이면 하위 부서
 *
 * 변경 사항:
 * - 처음에는 모든 본부가 접힌 상태로 표시된다.
 * - 최상위 본부는 아코디언 방식으로 동작한다.
 * - 본부 클릭 시 해당 본부만 열리고 다른 본부는 닫힌다.
 * - 팀 클릭 시 해당 팀 사원 목록만 조회한다.
 */
function createDepartmentTree(departments, depth) {
    const wrapper = document.createElement("div");

    departments.forEach(dept => {
        const item = document.createElement("div");
        item.className = "dept-tree-item";

        const hasChildren = dept.children && dept.children.length > 0;
        const isRoot = depth === 0;
        const isOpened = isRoot && openedRootDeptId === dept.deptId;

        const button = document.createElement("button");
        button.type = "button";

        /*
         * 최상위 부서와 하위 부서의 스타일을 다르게 주기 위해
         * depth 값에 따라 클래스를 나눠준다.
         */
        button.className = isRoot
            ? "dept-node root-dept"
            : "dept-node child-dept";

        button.dataset.deptId = dept.deptId;
        button.dataset.deptName = dept.deptName;
        button.dataset.depth = depth;

        /*
         * 아이콘/UI
         *
         * 하위 부서가 있으면 ▶ / ▼ 표시
         * 하위 부서가 없으면 • 표시
         */
        const iconText = hasChildren
            ? (isOpened ? "▼" : "▶")
            : "•";

        const iconClass = hasChildren
            ? "dept-toggle-icon"
            : "dept-toggle-empty";

        button.innerHTML = `
            <span class="${iconClass}">${iconText}</span>
            <span class="dept-label">${escapeHtml(dept.deptName)}</span>
        `;

        item.appendChild(button);

        let childrenWrapper = null;

        /*
         * 하위 부서가 있으면 childrenWrapper를 만든다.
         *
         * 최상위 본부:
         * - openedRootDeptId와 일치할 때만 열린 상태
         *
         * 하위 단계:
         * - 현재 구조에서는 본부 아래 팀까지만 사용하지만,
         *   추후 3단계 부서가 생길 경우를 위해 하위 단계는 기본 열린 구조로 둔다.
         */
        if (hasChildren) {
            childrenWrapper = document.createElement("div");

            const shouldOpen = isRoot
                ? openedRootDeptId === dept.deptId
                : true;

            childrenWrapper.className = shouldOpen
                ? "dept-tree-children open"
                : "dept-tree-children closed";

            childrenWrapper.appendChild(createDepartmentTree(dept.children, depth + 1));

            item.appendChild(childrenWrapper);
        }

        /*
         * 부서 클릭 시:
         * 1. 선택 표시 변경
         * 2. 오른쪽 사원 목록 조회
         * 3. 최상위 본부면 아코디언 방식으로 열기
         */
        button.addEventListener("click", function () {
            selectDepartment(button, dept.deptId, dept.deptName);

            if (hasChildren && childrenWrapper && isRoot) {
                openRootDepartment(dept.deptId);
            }
        });

        wrapper.appendChild(item);
    });

    return wrapper;
}

/*
 * 최상위 본부 열기
 *
 * 아코디언 방식:
 * - 새 본부를 클릭하면 기존에 열려 있던 본부를 닫고 새 본부만 연다.
 * - 같은 본부를 다시 클릭해도 닫히지 않는다.
 *
 * 구현 방식:
 * - openedRootDeptId 값을 변경한 뒤
 * - 조직도 트리만 다시 렌더링한다.
 */
function openRootDepartment(deptId) {
    if (openedRootDeptId === deptId) {
        return;
    }

    openedRootDeptId = deptId;

    loadDepartmentTree();
}

/*
 * 부서 선택 처리
 *
 * 선택된 부서를 파란색으로 표시하고
 * 해당 부서의 사원 목록을 조회한다.
 */
function selectDepartment(button, deptId, deptName) {
    if (selectedDeptNode) {
        selectedDeptNode.classList.remove("active");
    }

    selectedDeptNode = button;
    selectedDeptId = deptId;
    selectedDeptName = deptName;

    selectedDeptNode.classList.add("active");

    document.getElementById("orgEmployeeTitle").textContent =
        deptName + " 사원 목록";

    /*
     * 부서를 선택하면 검색 input 활성화
     */
    const searchInput = document.getElementById("orgEmployeeSearchInput");

    if (searchInput) {
        searchInput.disabled = false;
        searchInput.value = "";
    }

    loadEmployeesByDepartment(deptId, deptName);
}

/*
 * 선택 상태 복원
 *
 * 트리를 다시 그린 후에도 이전에 선택했던 부서가 있으면
 * 해당 부서 버튼에 active 클래스를 다시 붙인다.
 */
function restoreSelectedDepartment() {
    if (!selectedDeptId) {
        return;
    }

    const button = document.querySelector(
        `.dept-node[data-dept-id="${selectedDeptId}"]`
    );

    if (button) {
        selectedDeptNode = button;
        selectedDeptNode.classList.add("active");
    }
}

/*
 * 부서별 사원 목록 조회
 *
 * 호출 API:
 * GET /api/organization/employees?deptId=1
 *
 * 백엔드 조회 기준:
 * - 본부를 클릭하면 해당 본부 아래 팀들의 사원 전체 조회
 * - 팀을 클릭하면 해당 팀 사원만 조회
 */
function loadEmployeesByDepartment(deptId, deptName) {
    fetch("/api/organization/employees?deptId=" + encodeURIComponent(deptId))
        .then(response => {
            if (!response.ok) {
                throw new Error("사원 목록 API 호출 실패: " + response.status);
            }

            return response.json();
        })
        .then(employees => {
            if (!Array.isArray(employees)) {
                throw new Error("사원 목록 응답 데이터가 배열이 아닙니다.");
            }

            /*
             * 현재 선택한 부서의 전체 사원 목록을 저장한다.
             * 이후 내부 검색에서 이 배열을 기준으로 필터링한다.
             */
            currentOrgEmployees = employees;

            renderGroupedEmployees(currentOrgEmployees, deptName);
        })
        .catch(error => {
            console.error(error);
            document.getElementById("orgEmployeeArea").innerHTML =
                "<div class='text-danger'>사원 정보를 불러오지 못했습니다.</div>";
        });
}

/*
 * 조직도 오른쪽 내부 검색
 *
 * 이름 또는 사번에 검색어가 포함된 사원만 화면에 다시 출력한다.
 */
function filterOrgEmployees(keyword) {
    const trimmedKeyword = keyword.trim().toLowerCase();

    if (!selectedDeptId) {
        return;
    }

    if (!trimmedKeyword) {
        renderGroupedEmployees(currentOrgEmployees, selectedDeptName);
        return;
    }

    const filteredEmployees = currentOrgEmployees.filter(emp => {
        const empNo = String(emp.empNo || "").toLowerCase();
        const name = String(emp.name || "").toLowerCase();

        return empNo.includes(trimmedKeyword) || name.includes(trimmedKeyword);
    });

    renderGroupedEmployees(filteredEmployees, selectedDeptName);
}

/*
 * 사원 목록을 직급별로 그룹핑해서 출력
 *
 * 오른쪽 영역 구성:
 * - 상단: 선택 부서명 + 총 인원
 * - 하단: 직급별 그룹 박스
 */
function renderGroupedEmployees(employees, deptName) {
    const area = document.getElementById("orgEmployeeArea");
    area.innerHTML = "";

    /*
     * 상단 요약 영역
     */
    const summary = document.createElement("div");
    summary.className = "org-summary";

    summary.innerHTML = `
        <h5 class="org-summary-title">${escapeHtml(deptName)} 사원 목록</h5>
        <span class="badge bg-primary org-total-badge">총 ${employees.length}명</span>
    `;

    area.appendChild(summary);

    /*
     * 사원이 없는 경우
     */
    if (!employees || employees.length === 0) {
        const empty = document.createElement("div");
        empty.className = "org-empty-message";
        empty.textContent = "조건에 맞는 사원이 없습니다.";

        area.appendChild(empty);
        return;
    }

    /*
     * 직급 순서 + 이름순 정렬
     *
     * 1순위: positionOrder 배열 순서
     * 2순위: 같은 직급이면 이름순
     */
    employees.sort((a, b) => {
        const indexA = positionOrder.indexOf(a.positionName);
        const indexB = positionOrder.indexOf(b.positionName);

        const orderA = indexA === -1 ? 999 : indexA;
        const orderB = indexB === -1 ? 999 : indexB;

        if (orderA !== orderB) {
            return orderA - orderB;
        }

        return String(a.name || "").localeCompare(String(b.name || ""));
    });

    /*
     * 직급별 그룹핑
     */
    const grouped = groupByPosition(employees);
    const sortedPositions = sortPositions(Object.keys(grouped));

    /*
     * 직급별 그룹 박스 출력
     */
    sortedPositions.forEach(positionName => {
        const list = grouped[positionName];

        const groupCard = document.createElement("div");
        groupCard.className = "position-group-card";

        const groupHeader = document.createElement("div");
        groupHeader.className = "position-group-header";

        groupHeader.innerHTML = `
            <span>${escapeHtml(positionName)}</span>
            <span class="badge bg-secondary">${list.length}명</span>
        `;

        groupCard.appendChild(groupHeader);

        const tableWrapper = document.createElement("div");
        tableWrapper.className = "table-responsive";

        const table = document.createElement("table");
        table.className = "table table-sm table-hover align-middle";

        /*
         * 이미 직급별로 그룹핑했기 때문에
         * 테이블 컬럼에서는 직급 컬럼을 제거했다.
         */
        table.innerHTML = `
            <thead class="table-light">
                <tr>
                    <th style="width: 130px;">사번</th>
                    <th style="width: 120px;">이름</th>
                    <th style="width: 90px;">상태</th>
                    <th>이메일</th>
                    <th style="width: 160px;">연락처</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        const tbody = table.querySelector("tbody");

        list.forEach(emp => {
            const tr = document.createElement("tr");

            /*
             * 이름 클릭 시 기존 사원 상세 화면으로 이동한다.
             *
             * 기존 list.html과 동일하게:
             * /admin/employees/{empNo}
             */
            tr.innerHTML = `
                <td>${escapeHtml(emp.empNo || "-")}</td>
                <td>
                    <a href="/admin/employees/${encodeURIComponent(emp.empNo)}"
                       class="text-decoration-none fw-semibold">
                        ${escapeHtml(emp.name || "-")}
                    </a>
                </td>
                <td>${createStatusBadge(emp.status)}</td>
                <td>${escapeHtml(emp.email || "-")}</td>
                <td>${escapeHtml(emp.phone || "-")}</td>
            `;

            tbody.appendChild(tr);
        });

        tableWrapper.appendChild(table);
        groupCard.appendChild(tableWrapper);
        area.appendChild(groupCard);
    });
}

/*
 * 직급별 그룹핑
 *
 * 예:
 * {
 *   "팀장": [사원1],
 *   "대리": [사원2, 사원3],
 *   "사원": [사원4]
 * }
 */
function groupByPosition(employees) {
    return employees.reduce((acc, emp) => {
        const key = emp.positionName || "직급 없음";

        if (!acc[key]) {
            acc[key] = [];
        }

        acc[key].push(emp);
        return acc;
    }, {});
}

/*
 * 직급 순서 정렬
 *
 * positionOrder 배열에 있는 순서대로 정렬한다.
 * 배열에 없는 직급명은 가장 아래쪽에 표시한다.
 */
function sortPositions(positionNames) {
    return positionNames.sort((a, b) => {
        const indexA = positionOrder.indexOf(a);
        const indexB = positionOrder.indexOf(b);

        const orderA = indexA === -1 ? 999 : indexA;
        const orderB = indexB === -1 ? 999 : indexB;

        return orderA - orderB;
    });
}

/*
 * 상태 뱃지 생성
 *
 * 기존 사원 목록 테이블과 비슷한 색상으로 맞춘다.
 */
function createStatusBadge(status) {
    if (status === "재직") {
        return "<span class='badge bg-success'>재직</span>";
    }

    if (status === "휴직") {
        return "<span class='badge bg-warning text-dark'>휴직</span>";
    }

    if (status === "퇴사") {
        return "<span class='badge bg-secondary'>퇴사</span>";
    }

    return "<span class='badge bg-light text-dark'>" + escapeHtml(status || "-") + "</span>";
}

/*
 * HTML 문자열 이스케이프 처리
 *
 * API에서 받은 문자열을 innerHTML에 넣을 때
 * 예상하지 못한 HTML이 실행되지 않도록 방지한다.
 */
function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;")
        .replaceAll("'", "&#039;");
}