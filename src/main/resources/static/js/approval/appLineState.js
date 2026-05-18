/**
 * @Description : 전자결재선 서식 생성&수정 시 상태만 관리
 * @Author : 송영은
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.05.08    송영은       최초 생성
*/

// 참조/결재 대상 조회를 위한 상태 정보 저장
const state = {
    searchMode: 'ref',      // 조회 모드: ref(참조) | app(결재)
    targetType: 'user',     // 대상 유형: user(개인) | dept(부서) | position(직급)
    approvalStep: 0,        // 전체 결재 단계 수
    currentEditingStep: null // 현재 수정 중인 결재 단계
};

// 선택 상태 저장 구조
const selectedState = {
    ref: new Map(),     // 참조 대상
    approval: {}        // 단계별 결재 대상
};

// 결재 단계별 최소 직급 정보
const approvalRules = {
    minPositionByStep: {}
};