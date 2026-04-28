/**
 * @FileName : UserContext.js
 * @Description : 로그인 시 계정 정보 저장을 위한 API
 * @Author : 김다솜
 * @Date : 2026. 04. 22
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.22    김다솜        최초 생성/화면 구성
 */

import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [userInfo, setUserInfo] = useState(null);

    //로그인 시 호출
    const login = (basicInfo, token) => {
        localStorage.setItem('token', token);
        setUserInfo(basicInfo);
    };

    //상세 정보 업데이트
    const updateUserInfo = (detailInfo) => {
        setUserInfo(prev => ({ ...prev, ...detailInfo }));
    };

    //로그아웃
    const logout = () => {
        localStorage.removeItem('token');
        setUserInfo(null);
    };

    return (
        <UserContext.Provider value={{ userInfo, login, updateUserInfo, logout }}>
            {children}
        </UserContext.Provider>
    );
};

//커스텀 hook
export const useUser = () => useContext(UserContext);