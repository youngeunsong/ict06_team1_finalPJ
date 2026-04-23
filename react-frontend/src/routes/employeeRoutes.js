import React from 'react';
import { PATH } from "../constants/path";

// lazy loading 적용
const Employee = React.lazy(() => import( "src/pages/employee/Employee"));
const EmployeeDetail = React.lazy(() => import( "src/pages/employee/EmployeeDetail"));

export const employeeRoutes = (userInfo) => [
    // 형식: { path: PATH.AI.PORTAL, element: <AIPortalMain userInfo={userInfo} /> },
    { path: PATH.EMPLOYEE.ROOT, element: <Employee userInfo= {userInfo} /> },// 인사관리 메인 페이지
    { path: PATH.EMPLOYEE.DETAIL, element: <EmployeeDetail userInfo= {userInfo} /> }, // 인사관리 상세 페이지

]; 
