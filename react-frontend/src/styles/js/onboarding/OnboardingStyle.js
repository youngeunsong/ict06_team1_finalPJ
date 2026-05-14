/**
 * 온보딩 도메인 공통 디자인 시스템 (JS Style Object)
 */

export const COLORS = {
  primary: '#321fdb',
  success: '#2eb85c',
  warning: '#f9b115',
  info: '#3399ff',
  dark: '#3c4b64',
  gray: '#f8f9fa',
  border: '#ced4da',
};

export const cardCore = {
  border: 'none',
  borderTop: `4px solid ${COLORS.primary}`,
  boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)',
  borderRadius: '0.5rem',
};

export const badgeAiTag = {
  backgroundColor: '#f8f9fa',
  color: COLORS.primary,
  fontSize: '0.7rem',
  fontWeight: '800',
  padding: '0.15rem 0.4rem',
  borderRadius: '4px',
  verticalAlign: 'middle',
  border: `1px solid ${COLORS.border}`,
  display: 'inline-block',
  lineHeight: '1.2',
};

export const badgeAiSidebar = {
  backgroundColor: '#dbe4ff',
  color: '#1f2a56',
  fontSize: '0.68rem',
  fontWeight: '800',
  padding: '0.2rem 0.45rem',
  borderRadius: '999px',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  lineHeight: '1.1',
};

export const badgeStageBase = {
  fontWeight: '600',
  padding: '0.4em 0.8em',
  borderRadius: '10rem',
  color: 'white',
};