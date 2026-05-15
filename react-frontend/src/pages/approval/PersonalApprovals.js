import React, { useEffect, useMemo, useState } from 'react';
import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CFormSelect,
  CPagination,
  CPaginationItem,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react';
import { useNavigate, useOutletContext } from 'react-router-dom';

import axiosInstance from 'src/api/axiosInstance';
import { PATH } from 'src/constants/path';
import { containerStyle } from 'src/styles/js/demoPageStyle';

const PAGE_SIZE = 10;

const BOX_TYPES = [
  { key: 'mine', label: '내가 상신한 문서', apiPath: PATH.API.APPROVAL.MY_DOCUMENTS },
  { key: 'referenced', label: '참조 문서', apiPath: PATH.API.APPROVAL.REFERENCED_DOCUMENTS },
];

const STATUS_OPTIONS = [
  { value: '', label: '전체' },
  { value: 'IN_PROGRESS', label: '진행중' },
  { value: 'COMPLETED', label: '완료' },
  { value: 'REJECTED', label: '반려' },
  { value: 'CANCELED', label: '취소' },
];

const STATUS_BADGE = {
  DRAFT: 'secondary',
  PENDING: 'warning',
  IN_PROGRESS: 'primary',
  COMPLETED: 'success',
  REJECTED: 'danger',
  CANCELED: 'dark',
};

const formatDateTime = (value) => {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// [전자결재] 개인문서함
const PersonalApprovals = () => {
  const [userInfo] = useOutletContext();
  const navigate = useNavigate();

  const [boxType, setBoxType] = useState('mine');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [documents, setDocuments] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const currentBox = useMemo(
    () => BOX_TYPES.find((item) => item.key === boxType) || BOX_TYPES[0],
    [boxType]
  );

  useEffect(() => {
    setPage(0);
  }, [boxType, status]);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        setErrorMessage('');

        const response = await axiosInstance.get(currentBox.apiPath, {
          params: {
            page,
            size: PAGE_SIZE,
            status: status || undefined,
          },
        });

        setDocuments(response.data?.content || []);
        setTotalPages(Math.max(1, response.data?.totalPages || 1));
      } catch (error) {
        console.error('개인 문서함 조회 실패:', error);
        setErrorMessage('문서 목록을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [currentBox.apiPath, page, status]);

  const openDetail = (approvalId) => {
    navigate(PATH.APPROVAL.PERSONAL_DETAIL_WITH_ID(approvalId), {
      state: { from: currentBox.key },
    });
  };

  return (
    <div style={containerStyle}>
      <header className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">개인문서함</h2>
          <div className="text-body-secondary">
            {userInfo?.name ? `${userInfo.name}님의 결재 문서` : '전자결재 문서 목록'}
          </div>
        </div>
        <CButton color="primary" onClick={() => navigate(PATH.APPROVAL.NEW_SELECT)}>
          새 결재 작성
        </CButton>
      </header>

      <CCard className="mb-4">
        <CCardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div className="d-flex gap-2">
            {BOX_TYPES.map((item) => (
              <CButton
                color={boxType === item.key ? 'primary' : 'secondary'}
                variant={boxType === item.key ? undefined : 'outline'}
                key={item.key}
                onClick={() => setBoxType(item.key)}
              >
                {item.label}
              </CButton>
            ))}
          </div>
          <CFormSelect
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            style={{ maxWidth: '180px' }}
          >
            {STATUS_OPTIONS.map((option) => (
              <option value={option.value} key={option.value}>
                {option.label}
              </option>
            ))}
          </CFormSelect>
        </CCardHeader>
        <CCardBody>
          {errorMessage && <CAlert color="danger">{errorMessage}</CAlert>}

          {loading ? (
            <div className="py-5 text-center">
              <CSpinner size="sm" className="me-2" />
              문서 목록을 불러오는 중입니다.
            </div>
          ) : (
            <CTable hover responsive align="middle">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell style={{ width: '90px' }}>상태</CTableHeaderCell>
                  <CTableHeaderCell>문서 제목</CTableHeaderCell>
                  <CTableHeaderCell>서식</CTableHeaderCell>
                  <CTableHeaderCell>작성자</CTableHeaderCell>
                  <CTableHeaderCell>현재 결재자</CTableHeaderCell>
                  <CTableHeaderCell>진행</CTableHeaderCell>
                  <CTableHeaderCell>작성일</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {documents.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan={7} className="text-center text-body-secondary py-5">
                      조회된 문서가 없습니다.
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  documents.map((document) => (
                    <CTableRow
                      key={document.approvalId}
                      role="button"
                      onClick={() => openDetail(document.approvalId)}
                    >
                      <CTableDataCell>
                        <CBadge color={STATUS_BADGE[document.status] || 'secondary'}>
                          {document.statusLabel || document.status}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        <strong>{document.title}</strong>
                      </CTableDataCell>
                      <CTableDataCell>{document.formName || '-'}</CTableDataCell>
                      <CTableDataCell>{document.writerName || document.writerNo || '-'}</CTableDataCell>
                      <CTableDataCell>
                        {document.currentApproverName || document.currentApproverNo || '-'}
                      </CTableDataCell>
                      <CTableDataCell>
                        {Number(document.maxStep) > 0
                          ? `${document.currentStep || 0} / ${document.maxStep}`
                          : '-'}
                      </CTableDataCell>
                      <CTableDataCell>{formatDateTime(document.createdAt)}</CTableDataCell>
                    </CTableRow>
                  ))
                )}
              </CTableBody>
            </CTable>
          )}

          <div className="d-flex justify-content-end">
            <CPagination className="mb-0">
              <CPaginationItem
                disabled={page === 0}
                onClick={() => setPage((prev) => Math.max(0, prev - 1))}
              >
                이전
              </CPaginationItem>
              {Array.from({ length: totalPages }, (_, index) => index).map((pageNumber) => (
                <CPaginationItem
                  active={pageNumber === page}
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber + 1}
                </CPaginationItem>
              ))}
              <CPaginationItem
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
              >
                다음
              </CPaginationItem>
            </CPagination>
          </div>
        </CCardBody>
      </CCard>
    </div>
  );
};

export default PersonalApprovals;
