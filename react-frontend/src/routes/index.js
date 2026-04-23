// routes/index.js
import { attendanceRoutes } from "./attendanceRoutes";
import { approvalRoutes } from "./approvalRoutes";
import { aiRoutes } from "./aiRoutes";
import { authRoutes } from "./authRoutes";
import { employeeRoutes } from "./employeeRoutes";
import {evaluationRoutes} from "./evaluationRoutes";
import {payrollRoutes} from "./payrollRoutes";

export const getAppRoutes = (userInfo) => [
  ...attendanceRoutes(userInfo),
  ...approvalRoutes(userInfo),
  ...aiRoutes(userInfo),
  ...authRoutes(userInfo),
  ...employeeRoutes(userInfo),
  ...evaluationRoutes(userInfo),
  ...payrollRoutes(userInfo),
];