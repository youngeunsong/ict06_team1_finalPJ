import React from 'react';
import { PATH } from "../constants/path";

// lazy loading 적용
const Payroll = React.lazy(() => import( "src/pages/payroll/Payroll"));
const PayrollIssue = React.lazy(() => import( "src/pages/payroll/PayrollIssue"));

export const payrollRoutes =  (userInfo) => [
    // 형식: { path: PATH.AI.PORTAL, element: <AIPortalMain userInfo={userInfo} /> },
    { path: PATH.PAYROLL.ROOT, element: <Payroll userInfo={userInfo} /> }, // 사원별 급여 확인 페이지
    { path: PATH.PAYROLL.ISSUE, element: <PayrollIssue userInfo={userInfo} /> }, // 사원별 급여명세서 발급 페이지

]