/**
 * @FileName : Quiz.js
 * @Description : AI 평가 퀴즈 화면
 *                - 학습 카테고리별 퀴즈 문항 조회
 *                - 객관식 답안 선택 및 전체 제출
 *                - 채점 결과 및 해설 표시
 * @Author : 김다솜
 * @Date : 2026. 04. 30
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.30    김다솜        최초 생성 및 퀴즈 조회/응시 기능 구현/스타일 코드 분리(QuizStyle.js)
 * @ 2026.05.01    김다솜        콘텐츠별 제출 구조에서 카테고리별 일괄 제출 구조로 수정
 * @                            사이드바 진입 시 평가 현황 카드 화면 표시 구조 추가/퀴즈 전체 제출 및 결과 요약 표시
 */

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from 'src/api/axiosInstance';
import { useUser } from 'src/api/UserContext';
import { PATH } from 'src/constants/path';
import {
    answerCountText,
    categoryText,
    disabledButton,
    explanationText,
    failText,
    optionInput,
    optionLabel,
    passText,
    questionCard,
    questionGrid,
    questionTitle,
    quizContainer,
    quizHeader,
    resultBox,
    resultText,
    statusButton,
    statusCard,
    statusGrid,
    statusSubText,
    statusTitle,
    submitArea,
    submitButton,
    summaryBox,
    summaryTitle
} from 'src/styles/js/evaluation/QuizStyle';

const Quiz = () => {
    const { userInfo } = useUser();
    const location = useLocation();
    const navigate = useNavigate();

    const params = new URLSearchParams(location.search);
    const categoryName = params.get("categoryName");
    const isDirectQuizMode = !!categoryName;

    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [results, setResults] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitResult, setSubmitResult] = useState(null);
    const [evaluationResults, setEvaluationResults] = useState([]);
    const [selfScore, setSelfScore] = useState(50);

    // 퀴즈 조회
    useEffect(() => {
        if (!categoryName) {
            setLoading(false);
            return;
        }

        const fetchQuiz = async () => {
            try {
                console.log("[Quiz] categoryName:", categoryName);

                const res = await axiosInstance.get(
                    PATH.API.EVALUATION.QUIZ_QUESTIONS(categoryName)
                );
                console.log("[Quiz] fetched questions:", res.data);

                if(Array.isArray(res.data)) {
                    setQuestions(res.data);
                } else if(Array.isArray(res.data.questions)) {
                    setQuestions(res.data.questions);
                } else {
                    console.warn("[Quiz] 퀴즈 응답이 배열이 아님:", res.data);
                    setQuestions([]);
                }
            } catch (err) {
                console.error("퀴즈 조회 실패", err);
            } finally {
                setLoading(false);
            }
        };

        fetchQuiz();
    }, [categoryName]);

    // 객관식 답변 입력
    const handleSelect = (questionId, selectedNo) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: {
                questionId,
                selectedNo,
                answerText: null
            }
        }));
    };

    // 주관식(단답형/서술형) 답변 입력
    const handleTextAnswer = (questionId, text) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: {
                questionId,
                selectedNo: null,
                answerText: text
            }
        }));
    };

    // 응답 제출 가능 조건
    const isAllAnswered = () => {
        return questions.every((q) => {
            const answer = answers[q.questionId];

            if(!answer) return false;
            if(q.questionType === 'MULTIPLE_CHOICE') {
                return answer.selectedNo !== null && answer.selectedNo !== undefined;
            }

            return answer.answerText && answer.answerText.trim() !== '';
        });
    };

    // 응답 전체 제출
    const handleSubmit = async () => {
        const payload = {
            empNo: userInfo.empNo,
            categoryName,
            answers: Object.values(answers)
        };

        console.log("[Quiz] submit payload:", payload);

        try {
            const res = await axiosInstance.post(PATH.API.EVALUATION.QUIZ_SUBMIT, payload);

            console.log("[Quiz] submit response:", res.data);

            setSubmitResult(res.data);

            const resultMap = {};
            res.data.results.forEach(r => {
                resultMap[r.questionId] = r;
            });

            setResults(resultMap);
        } catch (err) {
            console.error("퀴즈 제출 실패", err);
        }
    };

    // 평가 결과 조회
    useEffect(() => {
        if(isDirectQuizMode || !userInfo?.empNo)
            return;

        const fetchEvaluationResults = async () => {
            try {
                const res = await axiosInstance.get(
                    PATH.API.EVALUATION.QUIZ_RESULT(userInfo.empNo)
                );

                console.log("[Evaluation] result:", res.data);
                setEvaluationResults(res.data);
            } catch(err) {
                console.error("평가 결과 조회 실패", err);
            }
        };

        fetchEvaluationResults();
    }, [isDirectQuizMode, userInfo?.empNo]);

    if (loading)
        return <div>Loading...</div>;

    // 사이드바 진입 화면: 평가 현황
    if (!isDirectQuizMode) {
        const categories = [
            '필수이수교육',
            '직무교육 (백엔드)',
            '직무교육 (프론트엔드)',
            '심화교육',
            'AI 활용 교육',
        ];

        return (
            <div style={quizContainer}>
                <div style={quizHeader}>
                    <h2>📝 AI 퀴즈 및 평가</h2>
                    <p style={categoryText}>
                        로드맵에서 학습을 완료한 카테고리의 퀴즈를 응시할 수 있습니다.
                    </p>
                </div>

                <div style={statusGrid}>
                    {categories.map((category) => {
                        const result = evaluationResults.find(
                            (item) => item.categoryName === category
                        );
                        
                        return (
                            <div key={category} style={statusCard}>
                                <div>
                                    <div style={statusTitle}>{category}</div>
                                    <div style={statusSubText}>
                                        {result?.submitted
                                        ? `총점 ${result.totalScore} / ${result.maxScore}`
                                        : '평가 미응시'
                                    }
                                    </div>
                                </div>

                                <button
                                    style={statusButton}
                                    onClick={() =>
                                        navigate(`${PATH.EVALUATION.QUIZ}?categoryName=${category}`)
                                    }
                                    disabled={result?.passed}
                                >
                                    {result?.passed
                                        ? '통과 완료'
                                        : result?.submitted
                                            ? '재응시 필요'
                                            : '응시하기'}
                                </button>
                            </div>
                        )
                    })}
                </div>
            </div>
        );
    }

    // 로드맵 > 퀴즈 응시 화면
    return (
        <div style={quizContainer}>
            <div style={quizHeader}>
                <h2>📝 AI 온보딩 평가</h2>
                <div style={categoryText}>카테고리: {categoryName}</div>
            </div>
            {!Array.isArray(questions) || questions.length === 0 ? (
                <div>등록된 퀴즈가 없습니다.</div>
            ) : (
                <>
                    <div style={questionGrid}>
                        {questions.map((q, index) => (
                            <div key={q.questionId} style={questionCard}>
                                <div style={questionTitle}>
                                    {index + 1}. {q.questionText}
                                </div>

                                {/* 문항 타입 분기(주관식-단답형/서술형) */}
                                {q.questionType === 'SHORT_ANSWER' || q.questionType === 'ESSAY' ? (
                                    <textarea
                                        value={answers[q.questionId]?.answerText || ''}
                                        onChange={(e) =>
                                            handleTextAnswer(q.questionId, e.target.value)
                                        }
                                        style={{
                                            width: '100%',
                                            height: '80px',
                                            marginTop: '10px'
                                        }}
                                        placeholder='답변을 입력하세요'
                                     />
                                ) : (
                                    [1, 2, 3, 4].map((no) => {
                                        const option = q[`option${no}`];

                                        if(!option) return null;

                                        return (
                                            <label key={no} style={optionLabel}>
                                                <input
                                                    type='radio'
                                                    name={`question-${q.questionId}`}
                                                    value={no}
                                                    checked={answers[q.questionId]?.selectedNo === no}
                                                    onChange={() => handleSelect(q.questionId, no)}
                                                    style={optionInput}
                                                />
                                                {option}
                                            </label>
                                        );
                                    })
                                )}

                                {results[q.questionId] && (
                                    <div style={resultBox}>
                                        {results[q.questionId].isCorrect ? (
                                            <span className='badge bg-success'>정답</span>
                                        ) : (
                                            <span className='badge bg-danger'>오답</span>
                                        )}

                                        <div style={resultText}>
                                            점수: {results[q.questionId].score}점
                                        </div>

                                        {results[q.questionId].explanation && (
                                            <div style={explanationText}>
                                                해설: {results[q.questionId].explanation}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div style={submitArea}>
                        <button
                            style={
                                !isAllAnswered() || submitResult !== null
                                    ? disabledButton
                                    : submitButton
                            }
                            disabled={!isAllAnswered() || submitResult !== null}
                            onClick={handleSubmit}
                        >
                            전체 제출
                        </button>

                        <div style={answerCountText}>
                            {Object.keys(answers).length} / {questions.length} 문항 응답 완료
                        </div>
                    </div>

                    {/* 평가 결과 영역 */}
                    {submitResult && (
                        <div style={summaryBox}>
                            <div style={summaryTitle}>평가 결과</div>

                            <div>
                                총점: {submitResult.totalScore} / {submitResult.maxScore}
                            </div>

                            <div style={submitResult.passed ? passText : failText}>
                                결과: {submitResult.passed ? "✅ 통과" : "❌ 미통과"}
                            </div>

                            <div style={{ marginTop: '20px' }}>
                                <div style={{ fontWeight: 600, marginBottom: '8px' }}>
                                    🧠 나의 이해도 (자기 평가)
                                </div>

                                <input
                                    type='range'
                                    min='0'
                                    max='100'
                                    value={selfScore}
                                    onChange={(e) => setSelfScore(e.target.value)}
                                    style={{ width: '100%' }}
                                 />

                                 <div style={{ textAlign: 'right', marginTop: '5px' }}>
                                    {selfScore}점
                                 </div>
                            </div>

                            {/* 비교 결과 */}
                            <div style={{ marginTop: '20px' }}>
                                <div style={{ fontWeight: 600 }}>결과 분석</div>

                                <div style={{ marginTop: '8px' }}>
                                    ✔ 자기 평가: {selfScore}점
                                </div>
                                <div>
                                    ✔ 실제 점수: {submitResult.totalScore} / {submitResult.maxScore}
                                </div>

                                <div style={{ marginTop: '10px', fontWeight: 500 }}>
                                    {selfScore > submitResult.totalScore
                                        ? '📉 실제 이해도가 예상보다 낮습니다. 복습이 필요합니다.'
                                        : '📈 학습 효과가 좋습니다! 잘 이해하고 있습니다.'
                                    }
                                </div>
                            </div>

                            {!submitResult.passed && (
                                <button
                                    style={{ ...submitButton, marginTop: '12px' }}
                                    onClick={() => {
                                        setAnswers({});
                                        setResults({});
                                        setSubmitResult(null);
                                    }}
                                >
                                    다시 풀기
                                </button>
                            )}
                        </div>
                    )}
                </>
            )
            }
        </div >
    );
};

export default Quiz;