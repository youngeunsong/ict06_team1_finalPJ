/* AiSecretary.js 전용 문장 다듬기 화면 */
// src/pages/aiSecretary/screens/CorrectionScreen.js

// CorrectionScreen: 메일 문구 교정 작업 화면
// 1) 사용자가 교정할 메일 문구를 입력하고, 톤/수정 강도/길이 등의 옵션을 조절
// 2) 원문과 교정 결과를 비교

import React from "react";
import AppButton from "../components/AppButton";
import Bubble from "../components/Bubble";
import CompareCard from "../components/CompareCard";
import OptionGroup from "../components/OptionGroup";
import { I, Icon } from "../constants/aiSecretaryIcons";
import { C, styles } from "../styles/aiSecretaryTheme";

export default function CorrectionScreen({
  correction,
  setCorrection,
  onBackHome,
}) {
  return (
    <div style={styles.page}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
        }}
      >
        <div>
          <div style={{ fontSize: 16, color: C.sub, fontWeight: 700 }}>
            문장 다듬기
          </div>
          <h1
            style={{
              margin: "6px 0 0",
              fontSize: 38,
              fontWeight: 900,
              letterSpacing: -1,
            }}
          >
            문장 다듬기
          </h1>
          <p style={{ margin: "10px 0 0", color: C.sub, fontSize: 16 }}>
            맞춤법, 톤, 길이, 표현을 조정해 문장을 더 자연스럽고 명확하게
            다듬습니다.
          </p>
        </div>

        <AppButton variant="secondary" onClick={onBackHome}>
          다른 기능 선택
        </AppButton>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "300px 260px 1fr",
          gap: 16,
        }}
      >
        <div
          style={{
            ...styles.card,
            padding: 20,
            display: "flex",
            flexDirection: "column",
            minHeight: 680,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h3 style={styles.sectionTitle}>문장 다듬기</h3>
            <Icon color={C.sub}>{I.refresh}</Icon>
          </div>

          <div style={{ display: "grid", gap: 16, marginTop: 18, flex: 1 }}>
            <Bubble
              role="ai"
              text={
                "안녕하세요! 문장을 더 정중하고 명확하게 다듬어 드릴게요.\n교정할 내용을 입력해 주세요."
              }
              time="오전 10:30"
            />
            <Bubble
              role="user"
              text={
                "아래 문장을 검토해 주시고,\n더 공손하고 명확하게 다듬어 주세요."
              }
              time="오전 10:31"
            />
            <Bubble
              role="ai"
              text={
                "네, 확인했습니다. 교정 옵션을 설정한 뒤 ‘이 옵션으로 다시 교정’을 클릭해 주세요."
              }
              time="오전 10:31"
            />
          </div>

          <div style={{ marginTop: 16 }}>
            <div
              style={{
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                padding: 12,
                minHeight: 112,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <textarea
                placeholder="메시지를 입력하세요..."
                style={{
                  flex: 1,
                  resize: "none",
                  border: "none",
                  outline: "none",
                  fontSize: 14,
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Icon color={C.sub}>{I.clip}</Icon>
                <button
                  type="button"
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    border: "none",
                    background: C.accent,
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  <Icon color="#fff">{I.send}</Icon>
                </button>
              </div>
            </div>

            <div style={{ marginTop: 10, fontSize: 12, color: C.muted }}>
              Enter로 전송, Shift+Enter로 줄바꿈
            </div>
          </div>
        </div>

        <div style={{ ...styles.card, padding: 20 }}>
          <h3 style={styles.sectionTitle}>교정 옵션</h3>

          <div style={{ display: "grid", gap: 22, marginTop: 18 }}>
            <OptionGroup
              label="톤"
              options={["공손", "중립", "설득형"]}
              selected={correction.tone}
              onChange={(v) => setCorrection((prev) => ({ ...prev, tone: v }))}
            />

            <OptionGroup
              label="수정 강도"
              options={["가볍게", "보통", "강하게"]}
              selected={correction.strength}
              onChange={(v) =>
                setCorrection((prev) => ({ ...prev, strength: v }))
              }
            />

            <OptionGroup
              label="길이 조절"
              options={["축약", "유지", "확장"]}
              selected={correction.length}
              onChange={(v) =>
                setCorrection((prev) => ({ ...prev, length: v }))
              }
            />

            <div>
              <div
                style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}
              >
                맞춤법 보정
              </div>

              <button
                type="button"
                onClick={() =>
                  setCorrection((prev) => ({
                    ...prev,
                    spellCheck: !prev.spellCheck,
                  }))
                }
                style={{
                  width: 52,
                  height: 30,
                  borderRadius: 999,
                  border: "none",
                  background: correction.spellCheck ? C.accent : "#CBD5E1",
                  position: "relative",
                  cursor: "pointer",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 3,
                    left: correction.spellCheck ? 26 : 3,
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "#fff",
                    transition: "0.15s ease",
                  }}
                />
              </button>
            </div>

            <AppButton style={{ width: "100%" }}>
              이 옵션으로 다시 교정
            </AppButton>

            <div style={{ fontSize: 13, color: C.sub, lineHeight: 1.6 }}>
              교정 옵션은 채팅 화면 안에서 바로 조절합니다.
            </div>
          </div>
        </div>

        <div style={{ ...styles.card, overflow: "hidden" }}>
          <div
            style={{
              padding: 20,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <h3 style={{ ...styles.sectionTitle, fontSize: 16 }}>
              원문 / 교정 결과 비교
            </h3>

            <div style={{ display: "flex", gap: 10 }}>
              <AppButton variant="secondary" style={{ height: 40 }}>
                <Icon>{I.copy}</Icon>
                복사
              </AppButton>
            </div>
          </div>

          <div style={{ padding: "0 20px" }}>
            <div
              style={{
                display: "flex",
                gap: 24,
                height: 58,
                alignItems: "center",
              }}
            >
              <div
                style={{
                  color: C.accent,
                  fontWeight: 800,
                  borderBottom: `3px solid ${C.accent}`,
                  paddingBottom: 13,
                }}
              >
                나란히 보기
              </div>

              <div style={{ color: C.sub, fontWeight: 700 }}>변경점 보기</div>
            </div>
          </div>

          <div
            style={{
              padding: 20,
              display: "grid",
              gridTemplateColumns: "1fr 68px 1fr",
              gap: 14,
            }}
          >
            <CompareCard
              title="원문"
              body={[
                "안녕하세요, 김지훈 대리님.",
                "요청하신 자료를 첨부와 같이 전달드립니다.",
                "자료 검토 후 의견 주시면 반영하겠습니다.",
                "감사합니다.",
                "이수진 드림",
              ]}
            />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: "#F8FAFC",
                  border: `1px solid ${C.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  color: C.sub,
                  fontWeight: 700,
                }}
              >
                비교
              </div>
            </div>

            <CompareCard
              title="교정 결과"
              accent
              body={[
                "안녕하세요, 김지훈 대리님.",
                "요청하신 자료를 첨부와 같이 전달드립니다.",
                "검토 후 의견을 주시면 반영하여 개선하겠습니다.",
                "감사합니다.",
                "이수진 드림",
              ]}
            />
          </div>

          <div
            style={{
              padding: 20,
              borderTop: `1px solid ${C.border}`,
              color: C.sub,
              fontSize: 13,
            }}
          >
            교정 결과는 참고용으로, 최종 내용은 사용자가 확인 후 사용해 주세요.
          </div>
        </div>
      </div>
    </div>
  );
}