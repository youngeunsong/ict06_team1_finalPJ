/**
 * @FileName : UserContext.js
 * @Description : 로그인 사용자 정보 전역 관리 Context
 * @Author : 김다솜
 * @Date : 2026. 04. 22
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.22    김다솜        최초 생성/화면 구성/로그인 계정 정보 저장 Context 구현
 * @ 2026.04.29    김다솜        새로고침 시 토큰 기반 사용자 정보 복구 로직 추가
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { PATH } from 'src/constants/path';
import axiosInstance from './axiosInstance';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [userInfo, setUserInfo] = useState(null);
    const [userLoading, setUserLoading] = useState(true);

    useEffect(() => {
        const restoreUserInfo = async() => {
            const token = localStorage.getItem('token');

            if(!token) {
                setUserLoading(false);
                return;
            }

        try {
            const response = await axiosInstance.get(PATH.API.USER_ME);

            setUserInfo(response.data);
        } catch(err) {
            console.error('사용자 정보 복구 실패:',err);
            setUserInfo(null);
        } finally {
            setUserLoading(false);
        }
    };

    restoreUserInfo();
}, []);

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
        <UserContext.Provider value={{ userInfo, setUserInfo, userLoading, login, updateUserInfo, logout }}>
            {children}
        </UserContext.Provider>
    );
};

//커스텀 hook
export const useUser = () => useContext(UserContext);