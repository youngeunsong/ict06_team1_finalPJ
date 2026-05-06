/**
 * @FileName : checklistStyle.js
 * @Description : 온보딩 체크리스트 관련 스타일 정의
 *                - 체크리스트 목록 UI 스타일
 *                - 체크리스트 미리보기 카드 스타일
 *                - 로드맵 화면 위젯 스타일
 * @Author : 김다솜
 * @Date : 2026. 04. 29
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.29    김다솜        최초 생성 및 체크리스트 스타일 분리
 */

// ===== 공통 =====
export const checklistContainer = {
    padding: '20px'
};

// ===== 버튼(공통) =====
export const actionButton = {
    padding: '4px 10px',
    fontSize: '12px',
    borderRadius: '20px',
    border: '1px solid #dee2e6',
    background: '#f8f9fa',
    color: '#495057',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
};

export const actionButtonPrimary = {
    ...actionButton,
    border: '1px solid #0d6efd',
    color: '#0d6efd',
    background: '#f1f7ff'
};

export const actionButtonSuccess = {
    ...actionButton,
    border: '1px solid #198754',
    color: '#ffffff',
    background: '#198754'
};

export const actionButtonCompleted = {
    ...actionButton,
    border: '1px solid #198754',
    color: '#198754',
    background: '#e9f7ef'
};

export const actionButtonPending = {
    ...actionButton,
    border: '1px solid #adb5bd',
    color: '#6c757d',
    background: '#f8f9fa'
};

// ===== Preview (MyRoadmap에서 쓰는 카드) =====
export const previewWrapper = {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '20px'
};

export const previewCard = {
    width: '420px',
    padding: '16px',
    background: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e9ecef',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    cursor: 'pointer'
};

export const previewHeader = {
    fontWeight: 700,
    color: '#212529'
};

export const previewHeaderRow = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px'
};

export const previewTextArea = {
    minWidth: 0,
    flex: 1
};

export const previewSubText = {
    fontSize: '13px',
    color: '#868e96',
    marginTop: '4px',
    whiteSpace: 'normal'
};

export const previewLink = {
    fontSize: '13px',
    whiteSpace: 'nowrap',
    flexShrink: 0
};

export const previewList = {
    fontSize: '13px',
    color: '#6c757d',
    marginTop: '12px',
    lineHeight: '1.6'
};

// ===== Checklist (전체 페이지) =====
export const checklistTitle = {
    fontWeight: 600,
    fontSize: '14px',
    color: '#212529'
};

export const checklistCategory = {
    fontSize: '12px',
    color: '#868e96',
    marginTop: '3px'
};

export const checklistGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '12px'
};

export const checklistItem = {
    padding: '14px',
    background: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #edf0f2',
    minHeight: '92px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
};

export const checklistItemCompleted = {
    ...checklistItem,
    opacity: 0.55,
    background: '#f8f9fa',
    cursor: 'default'
};

export const checklistItemMandatory = {
    ...checklistItem,
    background: '#fff7e6',
    border: '1px solid #ffe8cc',
    boxShadow: '0 4px 12px rgba(255, 193, 7, 0.08)'
};

export const mandatoryBadge = {
    fontSize: '11px',
    padding: '2px 7px',
    borderRadius: '12px',
    background: '#fff3cd',
    color: '#b45309',
    marginLeft: '6px'
};

export const optionalBadge = {
    ...mandatoryBadge,
    background: '#f1f3f5',
    color: '#6c757d'
};

export const checkTodoIcon = {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#adb5bd',
    display: 'inline-block',
    marginRight: '10px',
    flexShrink: 0
};

export const checkDoneIcon = {
    ...checkTodoIcon,
    background: '#198754'
};

export const checklistActionRow = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '12px'
};