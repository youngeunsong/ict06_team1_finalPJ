import { PATH } from "../constants/path";
import AIPortalMain from "../pages/AIPortalMain";
import AiSecretary from "../pages/aiSecretary/AiSecretary";
import AiSecretaryQuickStart from "../pages/aiSecretary/AiSecretaryQuickStart";
import AiSecretaryAnswerToChat from "../pages/aiSecretary/AiSecretaryAnswerToChat";
import Chatbot from "../pages/chatbot/Chatbot";
import ChatbotSelectMenu from "../pages/chatbot/ChatbotSelectMenu";
import ChatbotSelectMenuAction from "../pages/chatbot/ChatbotSelectMenuAction";
import ChatbotWriteMessage from "../pages/chatbot/ChatbotWriteMessage";

export const aiRoutes = (userInfo) => [
  { path: PATH.AI.PORTAL, element: <AIPortalMain userInfo={userInfo} /> },

  { path: PATH.AI.SECRETARY, element: <AiSecretary userInfo={userInfo} /> },
  { path: PATH.AI.SECRETARY_QUICK, element: <AiSecretaryQuickStart userInfo={userInfo} /> },
  { path: PATH.AI.SECRETARY_CHAT, element: <AiSecretaryAnswerToChat userInfo={userInfo} /> },

  { path: PATH.AI.CHATBOT, element: <Chatbot userInfo={userInfo} /> },
  { path: PATH.AI.CHATBOT_MENU, element: <ChatbotSelectMenu userInfo={userInfo} /> },
  { path: PATH.AI.CHATBOT_RESULT, element: <ChatbotSelectMenuAction userInfo={userInfo} /> },
  { path: PATH.AI.CHATBOT_MESSAGE, element: <ChatbotWriteMessage userInfo={userInfo} /> },
];