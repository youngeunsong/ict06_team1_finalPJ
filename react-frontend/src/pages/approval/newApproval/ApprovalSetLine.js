import React, { useEffect, useMemo, useState } from 'react';
import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CFormInput,
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
import { useLocation, useNavigate } from 'react-router-dom';

import axiosInstance from 'src/api/axiosInstance';
import { PATH } from 'src/constants/path';
import { containerStyle } from 'src/styles/js/demoPageStyle';

const CANDIDATE_PAGE_SIZE = 5;

const EMPLOYEE_SIGN_MISSING_MESSAGE =
  '해당 결재자의 인감 이미지가 아직 등록되지 않았습니다. 추후 관리자에게 등록을 요청해주세요.';

const buildResourceUrl = (path) => {
  if (!path) {
    return '';
  }

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  return `${PATH.API.BASE.replace(/\/api$/, '')}${path}`;
};

const createRequestPart = (payload, files) => {
  if (!files || files.length === 0) {
    return { body: payload };
  }

  const formData = new FormData();
  formData.append(
    'request',
    new Blob([JSON.stringify(payload)], { type: 'application/json' })
  );
  files.forEach((file) => formData.append('files', file));

  return { body: formData };
};

// 결재선 서식의 stepOrder를 기준으로 결재 단계와 참조 단계를 분리합니다.
// stepOrder=0은 참조 대상, 1 이상은 실제 결재 단계입니다.
const buildGroupsFromTemplate = (lineTemplate) => {
  const steps = Array.isArray(lineTemplate?.steps) ? lineTemplate.steps : [];

  const approvalGroups = steps
    .filter((step) => Number(step.stepOrder) > 0)
    .sort((a, b) => Number(a.stepOrder) - Number(b.stepOrder));

  const referenceGroups = steps
    .filter((step) => Number(step.stepOrder) === 0);

  return {
    approvalGroups: approvalGroups.length > 0
      ? approvalGroups
      : [{ stepOrder: 1, targets: [] }],
    referenceGroups,
  };
};

const getGroupKey = (kind, stepOrder) => `${kind}-${stepOrder}`;

const getSelectedEmployees = (selectedMap, groupKey) => selectedMap[groupKey] || [];

const hasSelectedEmployeeInGroupKind = (selectedMap, groupKind, empNo) =>
  Object.entries(selectedMap).some(([key, employees]) =>
    key.startsWith(`${groupKind}-`)
    && employees.some((employee) => employee.empNo === empNo)
  );

const toggleEmployee = (selectedMap, groupKey, employee) => {
  const selectedEmployees = getSelectedEmployees(selectedMap, groupKey);
  const exists = selectedEmployees.some((item) => item.empNo === employee.empNo);

  return {
    ...selectedMap,
    [groupKey]: exists
      ? selectedEmployees.filter((item) => item.empNo !== employee.empNo)
      : [...selectedEmployees, employee],
  };
};

const createUserCandidates = (targets, keyword) => {
  const normalizedKeyword = keyword.trim().toLowerCase();

  return (targets || [])
    .filter((target) => target.type === 'USER' && target.id)
    .map((target) => ({
      empNo: target.id,
      name: target.name || '',
      deptName: target.dept || '',
      positionName: target.position || '',
      positionId: target.positionId,
    }))
    .filter((employee) => {
      if (!normalizedKeyword) {
        return true;
      }

      return [employee.empNo, employee.name, employee.deptName, employee.positionName]
        .some((value) => String(value || '').toLowerCase().includes(normalizedKeyword));
    });
};

const lineToEmployee = (line) => ({
  empNo: line.approverNo,
  name: line.approverName || line.approverNo || '',
  deptName: line.approverDeptName || '',
  positionName: line.approverPositionName || '',
});

// DEPT/POSITION 타입 결재선 서식은 기존 직원 검색 API의 필터 파라미터로 변환합니다.
// 여러 조건이 섞인 복잡한 결재선은 우선 키워드 검색과 수동 선택이 가능하도록 넓게 조회합니다.
const buildCandidateSearchParams = (targets, page, keyword) => {
  const params = {
    page,
    size: CANDIDATE_PAGE_SIZE,
    keyword,
  };

  const deptTargets = (targets || []).filter((target) => target.type === 'DEPT' && target.id);
  const positionTargets = (targets || []).filter((target) => target.type === 'POSITION' && target.id);

  if (deptTargets.length === 1 && positionTargets.length === 0) {
    params.deptId = deptTargets[0].id;
  }

  if (positionTargets.length === 1 && deptTargets.length === 0) {
    /*
     * 결재선 서식의 POSITION 대상은 "해당 직급의 결재 후보자"를 의미합니다.
     * 직원 검색 API의 minPositionId는 p.positionId > minPositionId 조건이라서
     * 책임 단계에서 수석이 조회되는 문제가 생기므로, 정확히 같은 직급을 찾는 positionId를 사용합니다.
     */
    params.positionId = positionTargets[0].id;
  }

  return params;
};

const EmployeeCandidatePicker = ({
  title,
  description,
  groupKey,
  stepOrder,
  targets = [],
  selectedMap,
  onToggle,
}) => {
  const userOnlyGroup = targets.length > 0 && targets.every((target) => target.type === 'USER');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setPage(0);
  }, [keyword, groupKey]);

  useEffect(() => {
    const fetchCandidates = async () => {
      if (userOnlyGroup) {
        const filteredUsers = createUserCandidates(targets, keyword);
        const nextTotalPages = Math.max(1, Math.ceil(filteredUsers.length / CANDIDATE_PAGE_SIZE));
        setEmployees(filteredUsers.slice(page * CANDIDATE_PAGE_SIZE, (page + 1) * CANDIDATE_PAGE_SIZE));
        setTotalPages(nextTotalPages);
        setErrorMessage('');
        return;
      }

      try {
        setLoading(true);
        setErrorMessage('');
        const response = await axiosInstance.get(PATH.API.APPROVAL.EMPLOYEES, {
          params: buildCandidateSearchParams(targets, page, keyword),
        });
        setEmployees(response.data?.content || []);
        setTotalPages(Math.max(1, response.data?.totalPages || 1));
      } catch (error) {
        console.error('결재 후보자 조회 실패:', error);
        setErrorMessage('후보자 목록을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [groupKey, keyword, page, targets, userOnlyGroup]);

  const selectedEmployees = getSelectedEmployees(selectedMap, groupKey);

  return (
    <CCard className="mb-4">
      <CCardHeader className="d-flex justify-content-between align-items-center gap-3">
        <div>
          <strong>{title}</strong>
          {description && <div className="small text-body-secondary">{description}</div>}
        </div>
        <CFormInput
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="사번, 이름 검색"
          style={{ maxWidth: '320px' }}
        />
      </CCardHeader>
      <CCardBody>
        {errorMessage && <CAlert color="danger">{errorMessage}</CAlert>}

        <div className="mb-3">
          {selectedEmployees.length === 0 ? (
            <span className="text-body-secondary small">선택된 대상이 없습니다.</span>
          ) : (
            selectedEmployees.map((employee) => (
              <CBadge color={stepOrder === 0 ? 'info' : 'primary'} className="me-2 mb-2" key={employee.empNo}>
                {employee.name}({employee.empNo})
              </CBadge>
            ))
          )}
        </div>

        {stepOrder > 0 && selectedEmployees.some((employee) => employee.signImg) && (
          <div className="d-flex flex-wrap gap-3 mb-3">
            {selectedEmployees
              .filter((employee) => employee.signImg)
              .map((employee) => (
                <div
                  className="border rounded bg-light p-2 text-center"
                  style={{ width: '120px' }}
                  key={`${employee.empNo}-sign`}
                >
                  <img
                    src={buildResourceUrl(employee.signImg)}
                    alt={`${employee.name} 인감`}
                    style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                  />
                  <div className="small text-truncate mt-1" title={employee.name}>
                    {employee.name}
                  </div>
                </div>
              ))}
          </div>
        )}

        {loading ? (
          <div className="py-4 text-center">
            <CSpinner size="sm" className="me-2" />
            후보자를 불러오는 중입니다.
          </div>
        ) : (
          <CTable hover responsive align="middle">
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell style={{ width: '70px' }}>선택</CTableHeaderCell>
                <CTableHeaderCell>사번</CTableHeaderCell>
                <CTableHeaderCell>이름</CTableHeaderCell>
                <CTableHeaderCell>부서명</CTableHeaderCell>
                <CTableHeaderCell>직급</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {employees.length === 0 ? (
                <CTableRow>
                  <CTableDataCell colSpan={5} className="text-center text-body-secondary">
                    조회된 후보자가 없습니다.
                  </CTableDataCell>
                </CTableRow>
              ) : (
                employees.map((employee) => {
                  const checked = selectedEmployees.some((item) => item.empNo === employee.empNo);

                  return (
                    <CTableRow
                      key={employee.empNo}
                      role="button"
                      onClick={() => onToggle(groupKey, employee)}
                    >
                      <CTableDataCell>
                        <input type="checkbox" checked={checked} readOnly />
                      </CTableDataCell>
                      <CTableDataCell>{employee.empNo}</CTableDataCell>
                      <CTableDataCell>{employee.name}</CTableDataCell>
                      <CTableDataCell>{employee.deptName}</CTableDataCell>
                      <CTableDataCell>{employee.positionName}</CTableDataCell>
                    </CTableRow>
                  );
                })
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
                key={pageNumber}
                active={pageNumber === page}
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
  );
};

// [전자결재] 새 결재 진행 - 결재선 설정 페이지
const ApprovalSetLine = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedForm = location.state?.selectedForm || null;
  const files = location.state?.files || [];
  const draftId = location.state?.draftId || null;
  const draftLines = useMemo(() => location.state?.draftLines || [], [location.state?.draftLines]);

  const [lineTemplate, setLineTemplate] = useState(null);
  const [selectedMap, setSelectedMap] = useState({});
  const [draftLineInitialized, setDraftLineInitialized] = useState(false);
  const [loading, setLoading] = useState(Boolean(selectedForm?.lineTemplateId));
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!selectedForm?.formId) {
      setErrorMessage('작성 중인 결재 문서 정보가 없습니다. 서식 선택부터 다시 진행해 주세요.');
      setLoading(false);
      return;
    }

    if (!selectedForm.lineTemplateId) {
      setLineTemplate({ steps: [{ stepOrder: 1, targets: [] }] });
      setLoading(false);
      return;
    }

    const fetchLineTemplate = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(
          PATH.API.APPROVAL.LINE_TEMPLATE_DETAIL(selectedForm.lineTemplateId)
        );
        setLineTemplate(response.data);
      } catch (error) {
        console.error('결재선 서식 상세 조회 실패:', error);
        setErrorMessage('결재선 정보를 불러오지 못했습니다. 기본 1단계 결재선으로 진행합니다.');
        setLineTemplate({ steps: [{ stepOrder: 1, targets: [] }] });
      } finally {
        setLoading(false);
      }
    };

    fetchLineTemplate();
  }, [selectedForm?.formId, selectedForm?.lineTemplateId]);

  const { approvalGroups, referenceGroups } = useMemo(
    () => buildGroupsFromTemplate(lineTemplate),
    [lineTemplate]
  );

  useEffect(() => {
    if (draftLineInitialized || draftLines.length === 0 || loading) {
      return;
    }

    const nextSelectedMap = {};
    draftLines.forEach((line) => {
      const stepOrder = Number(line.stepOrder);
      const groupKey = stepOrder > 0
        ? getGroupKey('approval', stepOrder)
        : getGroupKey('reference', 0);

      nextSelectedMap[groupKey] = [
        ...(nextSelectedMap[groupKey] || []),
        lineToEmployee(line),
      ];
    });

    setSelectedMap(nextSelectedMap);
    setDraftLineInitialized(true);
  }, [draftLineInitialized, draftLines, loading]);

  const approvalLines = useMemo(() => {
    const approvalSelected = approvalGroups.flatMap((group) =>
      getSelectedEmployees(selectedMap, getGroupKey('approval', group.stepOrder))
        .map((employee) => ({
          approverNo: employee.empNo,
          stepOrder: Number(group.stepOrder),
        }))
    );

    const referenceSelected = referenceGroups.flatMap((group) =>
      getSelectedEmployees(selectedMap, getGroupKey('reference', group.stepOrder))
        .map((employee) => ({
          approverNo: employee.empNo,
          stepOrder: 0,
        }))
    );

    return [...approvalSelected, ...referenceSelected];
  }, [approvalGroups, referenceGroups, selectedMap]);

  const requestPayload = useMemo(() => ({
    formId: selectedForm?.formId,
    title: location.state?.documentTitle || selectedForm?.formName || '',
    content: location.state?.content || '',
    approvalLines,
  }), [approvalLines, location.state?.content, location.state?.documentTitle, selectedForm?.formId, selectedForm?.formName]);

  const toggleSelection = (groupKey, employee) => {
    const selectedEmployees = getSelectedEmployees(selectedMap, groupKey);
    const alreadySelected = selectedEmployees.some((item) => item.empNo === employee.empNo);
    const isApprovalGroup = groupKey.startsWith('approval-');
    const isReferenceGroup = groupKey.startsWith('reference-');

    if (alreadySelected) {
      setSelectedMap((prev) => toggleEmployee(prev, groupKey, employee));
      return;
    }

    /*
     * 같은 사람이 결재자이면서 참조자가 되면 권한 의미가 섞입니다.
     * 결재자는 처리 책임이 있고 참조자는 열람 권한만 있으므로, 상신 전 화면에서 중복 지정을 차단합니다.
     */
    if (isApprovalGroup && hasSelectedEmployeeInGroupKind(selectedMap, 'reference', employee.empNo)) {
      alert('참조 대상으로 선택된 직원은 결재자로 중복 지정할 수 없습니다.');
      return;
    }

    if (isReferenceGroup && hasSelectedEmployeeInGroupKind(selectedMap, 'approval', employee.empNo)) {
      alert('결재자로 선택된 직원은 참조 대상으로 중복 지정할 수 없습니다.');
      return;
    }

    if (!isApprovalGroup) {
      setSelectedMap((prev) => toggleEmployee(prev, groupKey, employee));
      return;
    }

    /*
     * 실제 결재자를 새로 선택할 때 인감 이미지 경로를 함께 조회합니다.
     * 이 경로는 현재 화면의 미리보기뿐 아니라 향후 PDF 출력에서 결재자 도장 이미지를 구성하는 기준 데이터가 됩니다.
     */
    axiosInstance.get(PATH.API.APPROVAL.EMPLOYEE_SIGN(employee.empNo))
      .then((response) => {
        const employeeWithSign = {
          ...employee,
          signImg: response.data?.signImg || '',
        };

        if (!employeeWithSign.signImg) {
          alert(EMPLOYEE_SIGN_MISSING_MESSAGE);
        }

        setSelectedMap((prev) => toggleEmployee(prev, groupKey, employeeWithSign));
      })
      .catch((error) => {
        console.error('결재자 인감 이미지 조회 실패:', error);
        alert('결재자 인감 이미지 정보를 확인하지 못했습니다.');
        setSelectedMap((prev) => toggleEmployee(prev, groupKey, employee));
      });
  };

  const validateLines = (forSubmit) => {
    if (!selectedForm?.formId || !requestPayload.title || !requestPayload.content) {
      setErrorMessage('작성 중인 결재 문서 정보가 없습니다. 작성 화면부터 다시 진행해 주세요.');
      return false;
    }

    if (!forSubmit) {
      setErrorMessage('');
      return true;
    }

    const hasApprover = approvalLines.some((line) => line.stepOrder > 0);
    if (!hasApprover) {
      setErrorMessage('상신하려면 참조자를 제외한 실제 결재자를 1명 이상 선택해 주세요.');
      return false;
    }

    setErrorMessage('');
    return true;
  };

  const sendApprovalRequest = async (apiPath, method = 'post') => {
    const { body } = createRequestPart(requestPayload, files);
    return axiosInstance[method](apiPath, body);
  };

  const saveDraft = async () => {
    if (!validateLines(false)) {
      return;
    }

    try {
      setSubmitting(true);
      const apiPath = draftId ? PATH.API.APPROVAL.UPDATE_DRAFT(draftId) : PATH.API.APPROVAL.DRAFTS;
      const method = draftId ? 'put' : 'post';
      await sendApprovalRequest(apiPath, method);
      alert('임시저장되었습니다.');
      navigate(PATH.APPROVAL.TMP);
    } catch (error) {
      console.error('임시저장 실패:', error);
      setErrorMessage('임시저장 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const submitApproval = async () => {
    if (!validateLines(true)) {
      return;
    }

    try {
      setSubmitting(true);
      const apiPath = draftId ? PATH.API.APPROVAL.SUBMIT_DRAFT(draftId) : PATH.API.APPROVAL.SUBMIT;
      await sendApprovalRequest(apiPath);
      alert('상신되었습니다.');
      navigate(PATH.APPROVAL.PERSONAL);
    } catch (error) {
      console.error('상신 실패:', error);
      setErrorMessage('상신 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={containerStyle}>
      <header className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">결재선 설정</h2>
          <div className="text-body-secondary">
            {selectedForm?.formName || '서식 미선택'}
          </div>
        </div>
        <CButton
          color="secondary"
          variant="outline"
          onClick={() => navigate(PATH.APPROVAL.NEW_WRITE, {
            state: {
              selectedForm,
              draftId,
              draftLines: approvalLines.map((line) => ({
                approverNo: line.approverNo,
                stepOrder: line.stepOrder,
              })),
            },
          })}
        >
          내용 수정
        </CButton>
      </header>

      {errorMessage && <CAlert color="danger">{errorMessage}</CAlert>}

      {loading ? (
        <div className="py-5 text-center">
          <CSpinner size="sm" className="me-2" />
          결재선 정보를 불러오는 중입니다.
        </div>
      ) : (
        <>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>상신 결재선</strong>
            </CCardHeader>
            <CCardBody>
              {approvalGroups.map((group) => (
                <EmployeeCandidatePicker
                  key={getGroupKey('approval', group.stepOrder)}
                  title={`${group.stepOrder}단계 결재자`}
                  description="여러 명을 선택할 수 있습니다."
                  groupKey={getGroupKey('approval', group.stepOrder)}
                  stepOrder={Number(group.stepOrder)}
                  targets={group.targets || []}
                  selectedMap={selectedMap}
                  onToggle={toggleSelection}
                />
              ))}
            </CCardBody>
          </CCard>

          <CCard className="mb-4">
            <CCardHeader>
              <strong>참조 대상 설정</strong>
            </CCardHeader>
            <CCardBody>
              {referenceGroups.length === 0 ? (
                <CAlert color="info" className="mb-0">
                  지정된 참조 대상 조건이 없습니다.
                </CAlert>
              ) : (
                referenceGroups.map((group) => (
                  <EmployeeCandidatePicker
                    key={getGroupKey('reference', group.stepOrder)}
                    title="참조 대상"
                    description="결재자는 아니지만 문서를 열람할 수 있는 대상입니다."
                    groupKey={getGroupKey('reference', group.stepOrder)}
                    stepOrder={0}
                    targets={group.targets || []}
                    selectedMap={selectedMap}
                    onToggle={toggleSelection}
                  />
                ))
              )}
            </CCardBody>
          </CCard>

          <div className="d-flex justify-content-end gap-2">
            <CButton color="secondary" variant="outline" onClick={saveDraft} disabled={submitting}>
              임시저장
            </CButton>
            <CButton color="primary" onClick={submitApproval} disabled={submitting}>
              상신
            </CButton>
          </div>
        </>
      )}
    </div>
  );
};

export default ApprovalSetLine;
