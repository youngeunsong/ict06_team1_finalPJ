/**
 * @FileName : LoginPage.js
 * @Description : 로그인 페이지
 *                - 사번/비밀번호 입력 및 인증 처리
 *                - 로그인 성공 시 사용자 정보 Context 저장 후 웰컴 페이지 이동
 * @Author : 김다솜
 * @Date : 2026. 04. 16
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.16    김다솜        최초 생성
 * @ 2026.04.30    김다솜        스타일 코드 분리(LoginStyle.js) 및 버튼 상태 처리 개선
 */

  import { useEffect, useState } from 'react';
  import axios from 'axios';
  import { useNavigate } from 'react-router-dom';
  import { useUser } from '../../api/UserContext';
import { cardStyle, containerStyle, inputStyle, loginButton } from 'src/styles/js/auth/LoginStyle';
import { PATH } from 'src/constants/path';
import axiosInstance from 'src/api/axiosInstance';

  function LoginPage() {
    const navigate = useNavigate();
    const { login, updateUserInfo } = useUser();

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
        const response = await axios.post(`${PATH.API.BASE}/auth/login`, {
          empNo: loginData.empNo,
          password: loginData.password
        });

        const { token, userName, role } = response.data;

        //1. 계정 기본정보 저장
        login({ name: userName, role }, token);
        console.log('로그인 성공: ', userName, role);

        //2. 토큰으로 상세정보 조회
        const empResponse = await axiosInstance.get('/user/welcome');

        //3. Context에 상세정보 업데이트
        updateUserInfo(empResponse.data);

        //4. 로그인 성공 시 메인 대시보드로 이동
        navigate('/auth/welcome'); 
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

    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          {/* 로고 영역 */}
          <h1 style={{ color: '#1877f2', marginBottom: '8px', fontSize: '28px' }}>스마트 그룹웨어</h1>
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
            <button type="submit" style={loginButton(isLoading)} disabled={isLoading}>
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
              사번/비밀번호 찾기
            </span>
          </div>
        </div>
      </div>
    );
}

  export default LoginPage;