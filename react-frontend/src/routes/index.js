// routes/index.js
import { attendanceRoutes } from "./attendanceRoutes";
import { approvalRoutes } from "./approvalRoutes";
import { authRoutes } from "./authRoutes";
import { employeeRoutes } from "./employeeRoutes";
import {onboardingRoutes} from "./onboardingRoutes";
import {payrollRoutes} from "./payrollRoutes";
import { calendarRoutes } from "./calendarRoutes";
import { aiSecretaryRoutes } from "./aiSecretaryRoutes";
import { chatbotRoutes } from "./chatbotRoutes";
import { alertRoutes } from "./alertRoutes";
import { aiPortalRoutes } from "./aiPortalRoutes";
import { evaluationRoutes } from "./evaluationRoutes";
import { testRoutes } from "./testRoutes";

export const getAppRoutes = (userInfo, setUserInfo) => [
  ...testRoutes(userInfo),                // [Test 예제 연결 경로 모음]
  ...authRoutes(userInfo, setUserInfo),   // 인증/ 인가
  ...attendanceRoutes(userInfo),          // 근태
  ...calendarRoutes(userInfo),            // 캘린더 
  ...approvalRoutes(userInfo),            // 전자결재
  ...onboardingRoutes(userInfo),          // 온보딩 
  ...evaluationRoutes(userInfo),          // 인사평가
  ...employeeRoutes(userInfo),            // 인사
  ...payrollRoutes(userInfo),             // 급여
  ...aiPortalRoutes(userInfo),            // 사내 AI 포탈
  ...aiSecretaryRoutes(userInfo),         // AI 비서
  ...chatbotRoutes(userInfo),           // AI 챗봇
  ...alertRoutes(userInfo)                // 알림
];

// import getAppRoutes from './routes';