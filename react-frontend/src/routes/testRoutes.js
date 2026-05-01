/**
 * @author : 송영은
 * description : 학습을 위한 테스트 JSX와 PATH에서 정의한 경로를 연결하는 코드 
 * ========================================
 * DATE         AUTHOR      NOTE
 * 2026-04-29   송영은       최초 생성
 **/

import React from 'react';

// 경로 상수 
import { PATH } from "../constants/path";

// lazy loading 적용
const TestList = React.lazy(() => import('src/pages/test/TestList')); 

export const testRoutes = (userInfo) => [
    { path: PATH.TEST.LIST, element: <TestList userInfo={userInfo} /> }, // 학습용 예제 
];