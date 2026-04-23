// constants/path.js
export const PATH = {
  ROOT: "/",

  AUTH: {
    LOGIN: "/auth/login",
    WELCOME: "/auth/welcome",
    USERHOME: "/auth/userhome",
  },

  ATTENDANCE: {
    ROOT: "/attendance",
    COMMUTE: "/attendance/commute",
    STATS: "/attendance/stats",
    HOLIDAYS: "/attendance/holidays",
  },

  APPROVAL: {
    ROOT: "/approval",
    NEW_SELECT: "/approval/new/select-form",
    NEW_WRITE: "/approval/new/write",
    NEW_SETLINE: "/approval/new/set-line",
    TMP: "/approval/tmpApprovals",
    PERSONAL: "/approval/personalApprovals",
    PERSONAL_DETAIL: "/approval/personalApprovals/detail",
    PENDING: "/approval/pendingApprovals",
    PENDING_DETAIL: "/approval/pendingApprovals/detail",
    UPCOMING: "/approval/upcomingApprovals",
  },

  EMPLOYEE: {
    ROOT: "/employee",
    DETAIL: "/employee/detail",
  },

  PAYROLL: {
    ROOT: "/payroll",
    ISSUE: "/payroll/issue",
  },

  AI: {
    PORTAL: "/ai-portal",
    SECRETARY: "/ai-portal/secretary",
    SECRETARY_QUICK: "/ai-portal/secretary/quick-start",
    SECRETARY_CHAT: "/ai-portal/secretary/answer-to-chat",
    CHATBOT: "/ai-portal/chatbot",
    CHATBOT_MENU: "/ai-portal/chatbot/select-menu",
    CHATBOT_RESULT: "/ai-portal/chatbot/select-menu/result",
    CHATBOT_MESSAGE: "/ai-portal/chatbot/message",
  },

  ETC: {
    ALERT: "/alert",
    CALENDAR: "/calendar",
  }
};