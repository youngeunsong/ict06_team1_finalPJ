/* AiSecretary.js 전용 (라우팅)규칙/ 계산 */
// src/pages/aiSecretary/utils/aiSecretaryRouteHelpers.js

import { PATH } from "../../../constants/path";

export const VALID_FORM_TYPES = ["report", "minutes", "approval"];

export const normalizeFormType = (type) =>
  VALID_FORM_TYPES.includes(type) ? type : "report";

export const buildAssistantDocPath = (docId) =>
  PATH.AI.ASSISTANT_DOC.replace(":docId", docId);

export const ASSISTANT_DOC_PREFIX =
  PATH.AI.ASSISTANT_DOC.replace("/:docId", "");