/**
 * @FileName : ProtectedRoute.js
 * @Description : 사용자 홈 화면 (날씨/뉴스 크롤링 및 업무 현황 요약 등)
 * @Author : 김다솜
 * @Date : 2026. 04. 22
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.22    김다솜        최초 생성/권한 제어 위한 isAllowed 설정
 */

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ isAllowed, redirectPath = '/login', children }) => {
    //isAllowed: 로그인 여부 or 권한 체크 결과(true/false)
    if(!isAllowed) {
        alert("로그인이 필요한 서비스입니다.");
        return <Navigate to={redirectPath} replace />;
    }

    //조건 만족 시 자식컴포넌트(페이지) 렌더링
    return children ? children : <Outlet />;
};

export default ProtectedRoute;