// routes/index.js
import { attendanceRoutes } from "./attendanceRoutes";
import { approvalRoutes } from "./approvalRoutes";
import { aiRoutes } from "./aiRoutes";
import { authRoutes } from "./authRoutes";
import { employeeRoutes } from "./employeeRoutes";
import {evaluationRoutes} from "./onboardingRoutes";
import {payrollRoutes} from "./payrollRoutes";

export const getAppRoutes = (userInfo, setUserInfo) => [
  ...authRoutes(userInfo, setUserInfo),
  ...attendanceRoutes(userInfo),
  ...approvalRoutes(userInfo),
  ...aiRoutes(userInfo),
];