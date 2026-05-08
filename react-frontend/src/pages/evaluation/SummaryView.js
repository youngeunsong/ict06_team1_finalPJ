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

const SummaryView = ({ results, roadmapGroups, userName, styles }) => {
    const { userInfo } = useUser();
    const navigate = useNavigate();
    if (!styles) return null;

    // 평가 통과 카테고리 수
    const passedCount = results.filter((result) => result.passed).length;

    // 로드맵에서 학습 완료된 카테고리 목록
    const completedCategories = roadmapGroups
        .filter((group) =>
            group.items.every((item) => item.status === 'COMPLETED')
        )
        .map((group) => group.category_name);

    // 진행할 평가 목록
    // - 학습은 완료했지만 아직 미응시 / 응시했지만 미통과한 평가
    const pendingEvaluations = completedCategories
        .map((category) => {
            const result = results.find((item) => item.categoryName === category);

            return {
                categoryName: category,
                submitted: result?.submitted || false,
                passed: result?.passed || false,
                totalScore: result?.totalScore || 0,
                maxScore: result?.maxScore || 0
            };
        })
        .filter((item) => !item.passed);

    // 완료된 평가 목록
    const completedEvaluations = results.filter((result) => result.passed);

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
                        {passedCount} / {completedCategories.length}
                    </div>
                    <div style={{ fontSize: '13px', color: '#6c757d' }}>
                        완료 가능 평가 중 통과
                    </div>
                </div>
            </div>

            {/* 진행할 평가 목록 */}
            <div style={{ marginTop: '24px' }}>
                <h5 style={{ fontWeight: 700 }}>⏳ 진행할 평가</h5>

                {pendingEvaluations.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#999', padding: '24px 0' }}>
                        진행할 평가가 없습니다.
                    </div>
                ) : (
                    <div style={styles.grid}>
                        {pendingEvaluations.map((item) => (
                            <CCard
                                key={item.categoryName}
                                style={{
                                    borderRadius: '12px',
                                    border: item.submitted ? '1px solid #ffe8a1' : '1px solid #dee2e6',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                    background: item.submitted ? '#fff3f3' : '#f8f9fa'
                                }}
                            >
                                <CCardBody>
                                    <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '8px' }}>
                                        📚 {item.categoryName}
                                    </div>

                                    <div style={{ fontSize: '13px', color: '#6c757d', marginBottom: '12px' }}>
                                        {item.submitted ? `재응시 필요 · ${item.totalScore} / ${item.maxScore}` : '학습 완료 · 평가 미응시'}
                                    </div>

                                    <CBadge
                                        color={item.submitted ? 'warning' : 'secondary'}
                                        shape='rounded-pill'
                                        style={{ padding: '6px 14px', fontSize: '13px' }}
                                    >
                                        {item.submitted ? '⚠️ 재응시 필요' : '⏳ 평가 대기'}
                                    </CBadge>

                                    <button
                                        onClick={() =>
                                            navigate(PATH.EVALUATION.QUIZ(item.categoryName))
                                        }
                                        className='btn btn-sm btn-primary'
                                        style={{ marginTop: '12px', width: '100%' }}
                                    >
                                        {item.submitted ? '다시 응시하기' : '평가 응시하기'}
                                    </button>
                                </CCardBody>
                            </CCard>
                        ))}
                    </div>
                )}
            </div>

            {/* 완료된 평가 목록 */}
            <div style={{ marginTop: '28px' }}>
                <h5 style={{ fontWeight: 700 }}>✅ 완료된 평가</h5>

                {completedEvaluations.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#999', padding: '24px 0' }}>
                        완료된 평가가 없습니다.
                    </div>
                ) : (
                    <div style={styles.grid}>
                        {completedEvaluations.map((result, idx) => {
                            const scoreRate =
                                result.maxScore > 0
                                    ? (result.totalScore / result.maxScore) * 100
                                    : 0;

                            return (
                                <CCard
                                    key={`${result.categoryName}-${idx}`}
                                    style={{
                                        borderRadius: '12px',
                                        border: '1px solid #c3e6cb',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                                    }}
                                >
                                    <CCardBody>
                                        <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '12px' }}>
                                            📚 {result.categoryName}
                                        </div>

                                        {/* 점수 바 */}
                                        <div style={{ marginBottom: '12px' }}>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    fontSize: '13px',
                                                    color: '#6c757d',
                                                    marginBottom: '4px'
                                                }}
                                            >
                                                <span>점수</span>
                                                <span>{result.totalScore} / {result.maxScore}</span>
                                            </div>

                                            <div
                                                style={{
                                                    height: '8px',
                                                    background: '#e9ecef',
                                                    borderRadius: '4px',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: `${scoreRate}%`,
                                                        height: '100%',
                                                        background: '#28a745',
                                                        borderRadius: '4px',
                                                        transition: 'width 0.4s ease'
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <CBadge
                                            color='success'
                                            shape='rounded-pill'
                                            style={{ padding: '6px 14px', fontSize: '13px' }}
                                        >
                                            ✅ 통과
                                        </CBadge>

                                        <button
                                            onClick={() => navigate(PATH.EVALUATION.QUIZ_DETAIL(userInfo.empNo, result.categoryName))}
                                            className='btn btn-sm btn-outline-primary'
                                            style={{ marginTop: '12px', width: '100%' }}
                                        >
                                            상세 결과 보기
                                        </button>
                                    </CCardBody>
                                </CCard>
                            );
                        })}
                    </div>

                )}
            </div>
        </div>
    );
};

export default SummaryView;