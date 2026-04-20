import React from 'react';
import { useNavigate } from 'react-router-dom';

function MyRoadmap({ userInfo }) {
    const navigate = useNavigate();

  // 임시 데이터 (나중에 DB에서 가져올 부분)
  const steps = [
    { id: 1, title: '기초 직무 교육', status: 'completed' },
    { id: 2, title: '팀 프로젝트 1', status: 'current' },
    { id: 3, title: '실무 온보딩', status: 'upcoming' },
    { id: 4, title: '최종 평가', status: 'upcoming' },
  ];

  const containerStyle = { padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' };
  const stepCardStyle = (status) => ({
    padding: '20px',
    marginBottom: '15px',
    borderRadius: '10px',
    borderLeft: `8px solid ${status === 'completed' ? '#27ae60' : status === 'current' ? '#1877f2' : '#ddd'}`,
    backgroundColor: '#fff',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  });

    return (
        <div style={containerStyle}>
            <header style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between' }}>
                <h2>🚀 {userInfo?.userName}님의 성장 로드맵</h2>
                <button onClick={() => navigate('/welcome')} style={{ border: 'none', background: 'none', color: '#666', cursor: 'pointer' }}>뒤로가기</button>
            </header>

            <div className="roadmap-list">
                {steps.map((step) => (
                <div key={step.id} style={stepCardStyle(step.status)}>
                    <div>
                    <span style={{ fontSize: '12px', color: '#888' }}>STEP 0{step.id}</span>
                    <h3 style={{ margin: '5px 0' }}>{step.title}</h3>
                    </div>
                    <span style={{ 
                    fontWeight: 'bold', 
                    color: step.status === 'completed' ? '#27ae60' : step.status === 'current' ? '#1877f2' : '#aaa' 
                    }}>
                    {step.status === 'completed' ? '완료' : step.status === 'current' ? '진행 중' : '대기'}
                    </span>
                </div>
                ))}
            </div>
        </div>
    );
 }

export default MyRoadmap;