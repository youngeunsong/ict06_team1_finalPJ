/**
 * @FileName : SummaryView.js
 * @Description : 평가 결과 요약 및 목록 화면
 *                - 카테고리별 평가 결과(점수, 통과 여부)를 카드 형태로 표시
 *                - 전체 카테고리 중 통과한 개수 요약 정보 제공
 *                - 통과한 항목에 대한 상세 보기 이동 기능
 * @Author : 김다솜
 * @Date : 2026. 05. 06
 * @Modification_History
 * @
 * @ 수정일          수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.05.06    김다솜        최초 생성 및 카테고리별 결과 카드 그리드 구현
 */

import { CBadge, CCard, CCardBody } from '@coreui/react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from 'src/api/UserContext';
import { PATH } from 'src/constants/path';

const SummaryView = ({ results, userName, styles }) => {
    const { userInfo } = useUser();
    const navigate = useNavigate();
    const passedCount = results.filter(r => r.passed).length;
    const totalCount = results.length;

    if(!styles) return null;

    return (
        <div>
        {/* 상단 요약 섹션 */}
            <div style={styles.summaryHeader}>
                <div>
                    <h4 style={{ margin: 0, fontWeight: 700 }}>📊 나의 평가 결과</h4>
                    <p style={{ margin: '6px 0 0', color: '#6c757d' }}>
                        {userName}님의 카테고리별 퀴즈 평가 결과입니다.
                    </p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: '#321fdb' }}>
                        {passedCount} / {totalCount}
                    </div>
                    <div style={{ fontSize: '13px', color: '#6c757d' }}>카테고리 통과</div>
                </div>
            </div>

            {/* 결과 목록 섹션 */}
            {results.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>
                    📭 아직 응시한 평가가 없습니다.
                </div>
            ) : (
                <div style={styles.grid}>
                    {results.map((result, idx) => (
                        <CCard key={idx} style={{
                            borderRadius: '12px',
                            border: result.passed ? '1px solid #c3e6cb' : '1px solid #f5c6cb',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}>
                            <CCardBody>
                                <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '12px' }}>
                                    📚 {result.categoryName}
                                </div>

                                {/* 점수 바 */}
                                <div style={{ marginBottom: '12px' }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: '13px',
                                        color: '#6c757d',
                                        marginBottom: '4px'
                                    }}>
                                        <span>점수</span>
                                        <span>{result.totalScore} / {result.maxScore}</span>
                                    </div>
                                    <div style={{
                                        height: '8px',
                                        background: '#e9ecef',
                                        borderRadius: '4px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: `${result.maxScore > 0 ? (result.totalScore / result.maxScore) * 100 : 0}%`,
                                            height: '100%',
                                            background: result.passed ? '#28a745' : '#dc3545',
                                            borderRadius: '4px',
                                            transition: 'width 0.4s ease'
                                        }} />
                                    </div>
                                </div>

                                {/* 결과 상태 배지 */}
                                <CBadge
                                    color={result.passed ? 'success' : 'danger'}
                                    shape="rounded-pill"
                                    style={{ padding: '6px 14px', fontSize: '13px' }}
                                >
                                    {result.passed ? '✅ 통과' : '❌ 미통과'}
                                </CBadge>

                                {/* 상세 보기 버튼 추가 */}
                                {result.passed && (
                                    <button
                                        onClick={() => navigate(PATH.EVALUATION.QUIZ_DETAIL(userInfo.empNo, result.categoryName))}
                                        className="btn btn-sm btn-outline-primary"
                                        style={{ marginTop: '12px', width: '100%' }}
                                    >
                                        상세 결과 보기
                                    </button>
                                )}
                            </CCardBody>
                        </CCard>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SummaryView;