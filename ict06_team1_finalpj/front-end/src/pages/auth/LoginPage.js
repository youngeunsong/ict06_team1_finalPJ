  import { useEffect, useState } from 'react';
  import axios from 'axios';
  import { useNavigate } from 'react-router-dom';

  function LoginPage({ setUserInfo }) {
    const navigate = useNavigate();
    const [loginData, setLoginData] = useState({
      empNo: '',
      password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    //1. 컴포넌트가 마운트될 때(화면에 나타날 때) 입력창 초기화
    useEffect(() => {
      setLoginData({
        empNo: '',
        password: ''
      });
    }, []);

    //2. 입력값 변경 핸들러
    const handleChange = (e) => {
      setLoginData({
        ...loginData,
        [e.target.name]: e.target.value
      });
    }

    //3. 로그인 요청 핸들러
    const handleLogin = async (e) => {
      e.preventDefault();
      setIsLoading(true);
      setError('');

      try {
        //백엔드 API 호출
        //요청URL과 포트번호가 백엔드(8081)와 일치하는지 확인
        //전달하는 객체의 key값을 백엔드 DTO와 일치시킴(@Data static class LoginRequest)
        const response = await axios.post('http://localhost:8081/api/auth/login', {
          empNo: loginData.empNo,
          password: loginData.password
        });

        const { token, userName, role } = response.data;
        //JWT 토큰을 로컬스토리지에 저장(이후 요청 시 인증 Header에 포함하여 사용)
        localStorage.setItem('token', token);
        //App.js 업데이트(로그인 성공 시 사용자 정보 저장)
        setUserInfo({ userName, role });
        console.log('로그인 성공: ', userName, role);

        //로그인 성공 시 메인 대시보드로 이동
        navigate('/auth/welcome', { state: { userName, role } }); 
      } catch (err) {
        //네트워크 에러 혹은 CORS 에러 시 오류메시지 출력
          if(!err.response) {
              setError('서버에 연결할 수 없습니다.');
          } else {
              const message = err.response.data;
              setError(typeof message === 'string' ? message : '사번 또는 비밀번호를 확인해주세요.');
          }
      } finally {
        setIsLoading(false);
      }
    };

    //사번+비밀번호 찾기 핸들러
    const handleFindCredentials = () => {
      alert('임시메시지: 사번과 비밀번호 찾기 기능은 관리자에게 문의해주세요.');
    };

    //배경 및 레이아웃 스타일
    const containerStyle = {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f0f2f5',
      margin: 0,
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
    };

    const cardStyle = {
      width: '100%',
      maxWidth: '400px',
      padding: '40px',
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
      textAlign: 'center'
    }

      const inputStyle = {
      width: '100%',
      padding: '12px',
      marginBottom: '16px',
      border: '1px solid #ddd',
      borderRadius: '6px',
      fontSize: '16px',
      boxSizing: 'border-box',
      outline: 'none'
    };

    const buttonStyle = {
      width: '100%',
      padding: '14px',
      backgroundColor: isLoading ? '#a5c9e1' : '#1877f2',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: isLoading ? 'not-allowed' : 'pointer',
      transition: 'background-color 0.3s'
    };

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                {/* 로고 영역 */}
                <h1 style={{ color: '#1877f2', marginBottom: '8px', fontSize: '28px' }}>TEAM 1 FINAL Project</h1>
                <p style={{ color: '#606770', marginBottom: '32px', fontSize: '16px' }}>통합 관리 시스템 로그인</p>
            
                <form onSubmit={handleLogin}>
                    <input
                    type="text"
                    name="empNo"
                    placeholder="사번"
                    value={loginData.empNo}
                    onChange={handleChange}
                    style={inputStyle}
                    required
                    autoComplete="off"
                    />
                    <input
                    type="password"
                    name="password"
                    placeholder="비밀번호"
                    value={loginData.password}
                    onChange={handleChange}
                    style={inputStyle}
                    required
                    autoComplete="new-password"
                    />
                    {error && <p style={{ color: 'red', fontSize: '14px', marginBottom: '16px' }}>{error}</p>}
                    <button type="submit" style={buttonStyle} disabled={isLoading}>
                    {isLoading ? '로그인 중...' : '로그인'}
                    </button>
                </form>

                {/* 사번/비밀번호 찾기 */}
                <div style={{ marginTop: '24px', fontSize: '14px', color: '#8a8d91' }}>
                    <span onClick={handleFindCredentials}
                    style={{ cursor: 'pointer', fontSize: '14px', color: '#8a8d91' }}
                    onMouseOver={(e) => e.target.style.color = '#1877f2'}
                    onMouseOut={(e) => e.target.style.color = '#8a8d91'}
                    >
                    사번/비밀번호 찾기</span>
                </div>
            </div>
        </div>
    );
}

  export default LoginPage;