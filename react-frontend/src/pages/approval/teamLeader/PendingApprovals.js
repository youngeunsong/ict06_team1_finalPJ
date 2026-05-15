import React, { useEffect, useState } from 'react';
import {
  CAlert,
  CBadge,
  CCard,
  CCardBody,
  CCardHeader,
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

const STATUS_BADGE = {
  IN_PROGRESS: 'primary',
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

// [전자결재] 결재대기문서함
const PendingApprovals = () => {
  const [userInfo] = useOutletContext();
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchPendingDocuments = async () => {
      try {
        setLoading(true);
        setErrorMessage('');

        const response = await axiosInstance.get(PATH.API.APPROVAL.PENDING_DOCUMENTS, {
          params: {
            page,
            size: PAGE_SIZE,
          },
        });

        setDocuments(response.data?.content || []);
        setTotalPages(Math.max(1, response.data?.totalPages || 1));
      } catch (error) {
        console.error('결재 대기 문서함 조회 실패:', error);
        setErrorMessage('결재 대기 문서 목록을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingDocuments();
  }, [page]);

  // 결재 대기 상세 화면에서는 승인/반려 처리를 해야 하므로 approvalId를 query string으로 넘깁니다.
  const openDetail = (approvalId) => {
    navigate(PATH.APPROVAL.PENDING_DETAIL_WITH_ID(approvalId));
  };

  return (
    <div style={containerStyle}>
      <header className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">결재 대기 문서함</h2>
          <div className="text-body-secondary">
            {userInfo?.name ? `${userInfo.name}님이 지금 결재해야 하는 문서입니다.` : '현재 결재 순서인 문서입니다.'}
          </div>
        </div>
      </header>

      <CCard className="mb-4">
        <CCardHeader>
          <strong>결재 대기 문서</strong>
        </CCardHeader>
        <CCardBody>
          {errorMessage && <CAlert color="danger">{errorMessage}</CAlert>}

          {loading ? (
            <div className="py-5 text-center">
              <CSpinner size="sm" className="me-2" />
              결재 대기 문서를 불러오는 중입니다.
            </div>
          ) : (
            <CTable hover responsive align="middle">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell style={{ width: '90px' }}>상태</CTableHeaderCell>
                  <CTableHeaderCell>문서 제목</CTableHeaderCell>
                  <CTableHeaderCell>서식</CTableHeaderCell>
                  <CTableHeaderCell>작성자</CTableHeaderCell>
                  <CTableHeaderCell>진행</CTableHeaderCell>
                  <CTableHeaderCell>상신일</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {documents.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan={6} className="text-center text-body-secondary py-5">
                      지금 결재할 문서가 없습니다.
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

export default PendingApprovals;
