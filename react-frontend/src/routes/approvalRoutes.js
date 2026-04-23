import { PATH } from "../constants/path";
import Approval from "../pages/approval/Approval";
import ApprovalSelectForm from "../pages/approval/newApproval/ApprovalSelectForm";
import ApprovalWriteNew from "../pages/approval/newApproval/ApprovalWriteNew";
import ApprovalSetLine from "../pages/approval/newApproval/ApprovalSetLine";
import TmpApprovals from "../pages/approval/TmpApprovals";
import PersonalApprovals from "../pages/approval/PersonalApprovals";
import ApprovalsDetail from "../pages/approval/ApprovalsDetail";
import PendingApprovals from "../pages/approval/teamLeader/PendingApprovals";
import PendingApprovalDetail from "../pages/approval/teamLeader/PendingApprovalDetail";
import UpcomingApprovals from "../pages/approval/teamLeader/UpcomingApprovals";

// DefaultLayout 내부의 AppContent 자리에 렌더링될 페이지만 명시
export const approvalRoutes = (userInfo) => [
  { path: PATH.APPROVAL.ROOT, element: <Approval userInfo={userInfo} /> },
  { path: PATH.APPROVAL.NEW_SELECT, element: <ApprovalSelectForm userInfo={userInfo} /> },
  { path: PATH.APPROVAL.NEW_WRITE, element: <ApprovalWriteNew userInfo={userInfo} /> },
  { path: PATH.APPROVAL.NEW_SETLINE, element: <ApprovalSetLine userInfo={userInfo} /> },

  { path: PATH.APPROVAL.TMP, element: <TmpApprovals userInfo={userInfo} /> },
  { path: PATH.APPROVAL.PERSONAL, element: <PersonalApprovals userInfo={userInfo} /> },
  { path: PATH.APPROVAL.PERSONAL_DETAIL, element: <ApprovalsDetail userInfo={userInfo} /> },

  { path: PATH.APPROVAL.PENDING, element: <PendingApprovals userInfo={userInfo} /> },
  { path: PATH.APPROVAL.PENDING_DETAIL, element: <PendingApprovalDetail userInfo={userInfo} /> },
  { path: PATH.APPROVAL.UPCOMING, element: <UpcomingApprovals userInfo={userInfo} /> },
];