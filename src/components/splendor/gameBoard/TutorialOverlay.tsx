"use client";
import { TutorialPhase, TutorialStep } from "@/src/hook/game/useTutorialSteps";
import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import BotWonModal from "../tutorial/BotWonModal";
import FreePlayModal from "../tutorial/FreePlayModal";
import BotThinkingIndicator from "../common/BotThinkingIndicator";
import SkipConfirmModal from "../tutorial/SkipConfirmModal";

// ─── Types ────────────────────────────────────────────────────────────────────
type Props = {
  step: TutorialStep | null;
  phase: TutorialPhase;
  stepIndex: number;
  totalSteps: number;
  highlightRects: DOMRect[];
  onNext: () => void;
  onSkip: () => void;
  onStartFreePlay: () => void;
  shakeMessage: boolean;
  hintText: string | null;
  isBotThinking: boolean;
  botThinkingMessage: string;
  showBotWon: boolean;
  onRetry: () => void;
  saveTutorialStep: (index: number, phase: string) => void;
};

// ─── CSS Animations ───────────────────────────────────────────────────────────
const TUTORIAL_STYLES = `
@keyframes tutorialShake {
  0%,100% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-6px); }
  80% { transform: translateX(6px); }
}
@keyframes tutorialPulse {
  0%,100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.75); }
}
@keyframes tutorialBounce {
  0%,80%,100% { transform: translateY(0); }
  40% { transform: translateY(-8px); }
}
@keyframes tutorialFadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes tutorialSlideUp {
  from { opacity: 0; transform: translate(-50%, 16px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}
@keyframes tutorialZoomIn {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}
`;

// ─── Message Box ──────────────────────────────────────────────────────────────
function MessageBox({
  step,
  stepIndex,
  totalSteps,
  onNext,
  onSkip,
  shake,
  hintText,
  highlightRects,
  saveTutorialStep
}: {
  step: TutorialStep;
  stepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onSkip: () => void;
  shake: boolean;
  hintText: string | null;
  highlightRects: DOMRect[];
  saveTutorialStep: (index: number, phase: string) => void;
}) {
  const boxStyle = useMemo((): React.CSSProperties => {
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;
    const boxW = Math.min(380, vw - 24);
    const boxH = 300;
    const pad = 12;
    const GAP = 12;
    const EDGE = 8;

    const base = (extra: React.CSSProperties): React.CSSProperties => ({
      position: "fixed",
      zIndex: 10001,
      pointerEvents: "auto",
      width: boxW,
      ...extra
    });

    if (!highlightRects || highlightRects.length === 0)
      return base({ left: EDGE, top: EDGE });

    const gL = Math.min(...highlightRects.map(r => r.left)) - pad;
    const gR = Math.max(...highlightRects.map(r => r.right)) + pad;
    const gT = Math.min(...highlightRects.map(r => r.top)) - pad;
    const gB = Math.max(...highlightRects.map(r => r.bottom)) + pad;
    const gCX = (gL + gR) / 2;
    const gCY = (gT + gB) / 2;

    const clampLeft = (l: number) =>
      Math.max(EDGE, Math.min(vw - boxW - EDGE, l));
    const clampTop = (t: number) =>
      Math.max(EDGE, Math.min(vh - boxH - EDGE, t));

    const tryRight = () => {
      const left = gR + GAP;
      const top = clampTop(gCY - boxH / 2);
      return left + boxW + EDGE <= vw ? { left, top } : null;
    };
    const tryLeft = () => {
      const left = gL - GAP - boxW;
      const top = clampTop(gCY - boxH / 2);
      return left >= EDGE ? { left, top } : null;
    };
    const tryBottom = () => {
      const top = gB + GAP;
      const left = clampLeft(gCX - boxW / 2);
      return top + boxH + EDGE <= vh ? { left, top } : null;
    };
    const tryTop = () => {
      const top = gT - GAP - boxH;
      const left = clampLeft(gCX - boxW / 2);
      return top >= EDGE ? { left, top } : null;
    };

    const pos =
      tryRight() ??
      tryLeft() ??
      tryBottom() ??
      tryTop() ??
      (() => {
        const spaceRight = vw - gR;
        const spaceLeft = gL;
        const spaceBottom = vh - gB;
        const spaceTop = gT;
        const max = Math.max(spaceRight, spaceLeft, spaceBottom, spaceTop);
        if (max === spaceRight)
          return { left: clampLeft(gR + GAP), top: clampTop(gCY - boxH / 2) };
        if (max === spaceLeft)
          return {
            left: clampLeft(gL - GAP - boxW),
            top: clampTop(gCY - boxH / 2)
          };
        if (max === spaceBottom)
          return { left: clampLeft(gCX - boxW / 2), top: clampTop(gB + GAP) };
        return {
          left: clampLeft(gCX - boxW / 2),
          top: clampTop(gT - GAP - boxH)
        };
      })();

    return base(pos);
  }, [highlightRects]);

  const progress = ((stepIndex + 1) / totalSteps) * 100;

  return (
    <div className="tutorial-box" style={boxStyle}>
      <div style={{ animation: shake ? "tutorialShake 0.5s ease" : undefined }}>
        {/* Progress bar */}
        <div
          style={{
            height: 3,
            background: "rgba(255,255,255,0.1)",
            borderRadius: 2,
            marginBottom: 8,
            overflow: "hidden"
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "linear-gradient(90deg, #facc15, #f97316)",
              borderRadius: 2,
              transition: "width 0.4s ease"
            }}
          />
        </div>

        {/* Card */}
        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(17,24,39,0.98), rgba(30,27,75,0.98))",
            border: "1px solid rgba(250,204,21,0.3)",
            borderRadius: 16,
            padding: "18px 20px",
            boxShadow:
              "0 8px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(250,204,21,0.1)",
            backdropFilter: "blur(12px)"
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 22 }}>{step.emoji}</span>
              <span
                style={{
                  background: "rgba(250,204,21,0.15)",
                  color: "#facc15",
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 20,
                  letterSpacing: 1,
                  textTransform: "uppercase"
                }}
              >
                {stepIndex + 1} / {totalSteps}
              </span>
            </div>
            <button
              onClick={onSkip}
              style={{
                background: "none",
                border: "none",
                color: "rgba(156,163,175,0.6)",
                fontSize: 10,
                cursor: "pointer",
                padding: "2px 6px",
                borderRadius: 4
              }}
            >
              Bỏ qua
            </button>
          </div>

          {/* Title */}
          <div
            style={{
              color: "white",
              fontWeight: 800,
              fontSize: 15,
              marginBottom: 6,
              lineHeight: 1.3
            }}
          >
            {step.title}
          </div>

          {/* Message */}
          <div
            style={{
              color: "#d1d5db",
              fontSize: 13,
              lineHeight: 1.5,
              marginBottom: step.subMessage ? 4 : 12
            }}
          >
            {step.message}
          </div>

          {step.subMessage && (
            <div
              style={{
                color: "#facc15",
                fontSize: 12,
                lineHeight: 1.4,
                marginBottom: 12,
                padding: "6px 10px",
                background: "rgba(250,204,21,0.08)",
                borderRadius: 8,
                borderLeft: "2px solid #facc15"
              }}
            >
              💡 {step.subMessage}
            </div>
          )}

          {hintText && (
            <div
              style={{
                color: "#f87171",
                fontSize: 12,
                marginBottom: 10,
                padding: "6px 10px",
                background: "rgba(239,68,68,0.1)",
                borderRadius: 8,
                border: "1px solid rgba(239,68,68,0.3)",
                animation: "tutorialFadeIn 0.3s ease"
              }}
            >
              ⚠️ {hintText}
            </div>
          )}

          {step.allowNext ? (
            <button
              onClick={() => {
                saveTutorialStep(stepIndex + 1, "Guide");
                onNext();
              }}
              style={{
                width: "100%",
                padding: "10px 0",
                background: "linear-gradient(135deg, #facc15, #f59e0b)",
                color: "#111",
                border: "none",
                borderRadius: 10,
                fontWeight: 800,
                fontSize: 13,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                boxShadow: "0 4px 16px rgba(250,204,21,0.3)"
              }}
            >
              Hiểu rồi → {stepIndex === totalSteps - 1 ? "Bắt đầu!" : ""}
            </button>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                background: "rgba(99,102,241,0.1)",
                border: "1px solid rgba(99,102,241,0.3)",
                borderRadius: 10
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#818cf8",
                  animation: "tutorialPulse 1.5s ease-in-out infinite"
                }}
              />
              <span style={{ color: "#a5b4fc", fontSize: 12 }}>
                Thực hiện action trên để tiếp tục...
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main TutorialOverlay ─────────────────────────────────────────────────────
export default function TutorialOverlay({
  step,
  phase,
  stepIndex,
  totalSteps,
  highlightRects,
  onNext,
  onSkip,
  onStartFreePlay,
  shakeMessage,
  hintText,
  isBotThinking,
  botThinkingMessage,
  showBotWon,
  onRetry,
  saveTutorialStep
}: Props) {
  const [portalEl, setPortalEl] = useState<Element | null>(null);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [svgKey, setSvgKey] = useState(0);

  useEffect(() => {
    const el = document.getElementById("animation-portal");
    if (el) {
      setPortalEl(el);
      return;
    }
    let frameId: number;
    const poll = () => {
      const found = document.getElementById("animation-portal");
      if (found) setPortalEl(found);
      else frameId = requestAnimationFrame(poll);
    };
    frameId = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    if (document.getElementById("tutorial-styles")) return;
    const style = document.createElement("style");
    style.id = "tutorial-styles";
    style.textContent = TUTORIAL_STYLES;
    document.head.appendChild(style);
    return () => {
      style.remove();
    };
  }, []);

  useEffect(() => {
    setSvgKey(k => k + 1);
  }, [highlightRects.length, stepIndex]);

  // ── Modals (self-contained portal bên trong) ──
  // Các modal này tự quản lý portal, chỉ cần truyền visible
  if (showBotWon) return <BotWonModal visible />;
  if (phase === "TRANSITION")
    return <FreePlayModal visible onStart={onStartFreePlay} />;
  if (phase === "FREE_PLAY" || phase === "DONE") {
    return (
      <BotThinkingIndicator
        visible={isBotThinking}
        message={botThinkingMessage}
      />
    );
  }

  if (!step || !portalEl) return null;

  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;
  const pad = step.highlight.type === "NONE" ? 0 : 3.5;

  return createPortal(
    <>
      {!isBotThinking ? (
        <>
          {/* SVG: dim + glow + click blocker */}
          <svg
            key={svgKey}
            style={{
              position: "fixed",
              inset: 0,
              width: "100%",
              height: "100%",
              zIndex: 10000,
              overflow: "visible"
            }}
            viewBox={`0 0 ${vw} ${vh}`}
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <mask id="tut-dim-mask">
                <rect width={vw} height={vh} fill="white" />
                {highlightRects.map((r, i) => (
                  <rect
                    key={i}
                    x={r.left - pad}
                    y={r.top - pad}
                    width={r.width + pad * 2}
                    height={r.height + pad * 2}
                    rx={10}
                    fill="black"
                  />
                ))}
              </mask>
              <clipPath id="tut-block-clip" clipPathUnits="userSpaceOnUse">
                <path
                  fillRule="evenodd"
                  d={[
                    `M0,0 L${vw},0 L${vw},${vh} L0,${vh} Z`,
                    ...highlightRects.map(
                      r =>
                        `M${r.left - pad},${r.top - pad} L${r.right + pad},${r.top - pad} L${r.right + pad},${r.bottom + pad} L${r.left - pad},${r.bottom + pad} Z`
                    )
                  ].join(" ")}
                />
              </clipPath>
            </defs>

            {/* Dim layer */}
            <rect
              width={vw}
              height={vh}
              fill="rgba(0,0,0,0.78)"
              mask="url(#tut-dim-mask)"
              style={{ pointerEvents: "none" }}
            />

            {/* Glow rings */}
            {highlightRects.map((r, i) => (
              <rect
                key={`glow-${i}`}
                x={r.left - pad}
                y={r.top - pad}
                width={r.width + pad * 2}
                height={r.height + pad * 2}
                rx={10}
                fill="none"
                stroke="rgba(250,204,21,0.7)"
                strokeWidth={2}
                style={{ pointerEvents: "none" }}
              />
            ))}
          </svg>

          {/* Message box */}
          <MessageBox
            saveTutorialStep={saveTutorialStep}
            step={step}
            stepIndex={stepIndex}
            totalSteps={totalSteps}
            onNext={onNext}
            onSkip={() => setShowSkipConfirm(true)}
            shake={shakeMessage}
            hintText={hintText}
            highlightRects={highlightRects}
          />
        </>
      ) : (
        <BotThinkingIndicator
          visible={isBotThinking}
          message={botThinkingMessage}
        />
      )}

      {/* Skip confirm */}
      <SkipConfirmModal
        visible={showSkipConfirm}
        onConfirm={() => {
          setShowSkipConfirm(false);
          onSkip();
        }}
        onCancel={() => setShowSkipConfirm(false)}
      />
    </>,
    portalEl
  );
}
