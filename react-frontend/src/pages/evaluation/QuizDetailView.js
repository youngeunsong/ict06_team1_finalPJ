/**
 * @FileName : QuizDetailView.js
 * @Description : 평가 결과 상세 조회 화면
 *                - 특정 카테고리의 질문, 사용자 답변, 정답 및 AI 피드백 표시
 *                - URL 파라미터(categoryName)를 통한 상세 데이터 로드
 * @Author : 김다솜
 * @Date : 2026. 05. 06
 * @Modification_History
 * @
 * @ 수정일          수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.05.06    김다솜        useParams 기반의 상세 데이터 조회 로직 구현 및 AI 피드백 UI 추가
 */

import React, { useEffect, useState } from 'react';
import axiosInstance from 'src/api/axiosInstance';
import { evalResultStyles } from 'src/styles/js/evaluation/QuizStyle';
import { useUser } from 'src/api/UserContext';
import { PATH } from 'src/constants/path';
import { useParams } from 'react-router-dom';

const QuizDetailView = () => {
    const { userInfo } = useUser();
    const { categoryName } = useParams(); // URL에서 empNo와 categoryName 추출
    const decodedCategory = decodeURIComponent(categoryName); // URL 인코딩된 카테고리 이름 디코딩
    const [detail, setDetail] = useState(null);

    useEffect(() => {
        if(!userInfo?.empNo || !categoryName) return;

        // 특정 결과의 상세 질문/답변 데이터 가져오는 API 호출
        const fetchDetail = async () => {
            try {
                const apiUrl = PATH.API.EVALUATION.QUIZ_DETAIL(userInfo.empNo, decodedCategory);
                console.log("[QuizDetailView] API 요청 URL:", apiUrl);
                const res = await axiosInstance.get(apiUrl);
                setDetail(res.data);
            } catch(err) {
                console.error("상세 결과 조회 실패", err);
            }
        };
        fetchDetail();
    }, [userInfo?.empNo, categoryName]);

    if(!detail) return <p>상세 결과를 불러오는 중...</p>

    return (
        <div>
            <h4 style={{ marginBottom: '20px' }}>📝 {detail.categoryName} 상세 결과</h4>
            {detail.questions.map((item, idx) => (
                <div key={idx} style={evalResultStyles.detailCard}>
                    <div style={evalResultStyles.questionText}>Q{idx + 1}. {item.questionText}</div>
                    <div style={evalResultStyles.answerBox}>
                        <p><strong>내 답변:</strong> {item.userAnswer}</p>
                        <p><strong>정답:</strong> {item.correctAnswer}</p>

                        {/* 5. AI 피드백 표시 */}
                        {item.aiFeedback && (
                            <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                                <small>🤖 <strong>AI 피드백:</strong> {item.aiFeedback}</small>
                            </div>
                        )}

                        <p style={{ 
                            color: item.isCorrect ? '#28a745' : '#dc3545', 
                            fontWeight: 'bold', 
                            marginTop: '8px' 
                        }}>
                            {item.isCorrect === true
                                ? '✨ 정답입니다!'
                                : item.isCorrect === false
                                    ? '❌ 오답입니다.'
                                    : '🤖 AI 평가 완료'}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default QuizDetailView;