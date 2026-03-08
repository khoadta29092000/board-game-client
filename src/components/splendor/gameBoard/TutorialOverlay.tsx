"use client";
import { TutorialPhase, TutorialStep } from "@/src/hook/game/useTutorialSteps";
import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

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

// ─── Spotlight: dùng SVG mask để đục lỗ chính xác theo getBoundingClientRect ─
function SpotlightMask({
  rects,
  padding = 10
}: {
  rects: DOMRect[];
  padding?: number;
}) {
  // clientWidth/Height: khớp với getBoundingClientRect(), không bị scrollbar offset
  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;

  if (rects.length === 0) {
    // Không highlight element nào → chỉ dim toàn màn hình
    return (
      <svg
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none"
        }}
        viewBox={`0 0 ${vw} ${vh}`}
        preserveAspectRatio="none"
      >
        <defs>
          <mask id="spotlight-mask">
            <rect width={vw} height={vh} fill="white" />
          </mask>
        </defs>
        <rect
          width={vw}
          height={vh}
          fill="rgba(0,0,0,0.78)"
          mask="url(#spotlight-mask)"
        />
      </svg>
    );
  }

  return (
    <svg
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none"
      }}
      viewBox={`0 0 ${vw} ${vh}`}
      preserveAspectRatio="none"
    >
      <defs>
        <mask id="spotlight-mask">
          {/* Toàn màn hình trắng = bị dim */}
          <rect width={vw} height={vh} fill="white" />
          {/* Các vùng highlight = đục lỗ (đen = trong suốt) */}
          {rects.map((r, i) => (
            <rect
              key={i}
              x={r.left - padding}
              y={r.top - padding}
              width={r.width + padding * 2}
              height={r.height + padding * 2}
              rx={10}
              ry={10}
              fill="black"
            />
          ))}
        </mask>
      </defs>
      {/* Lớp dim bị cắt bởi mask */}
      <rect
        width={vw}
        height={vh}
        fill="rgba(0,0,0,0.78)"
        mask="url(#spotlight-mask)"
      />
      {/* Glow ring quanh highlight */}
      {rects.map((r, i) => (
        <rect
          key={`glow-${i}`}
          x={r.left - padding}
          y={r.top - padding}
          width={r.width + padding * 2}
          height={r.height + padding * 2}
          rx={10}
          ry={10}
          fill="none"
          stroke="rgba(250,204,21,0.6)"
          strokeWidth={2}
        />
      ))}
    </svg>
  );
}

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
  // useMemo: tính lại mỗi khi highlightRects thay đổi (không phải mỗi render)
  // Đặt box SÁT CẠNH glow ring — ưu tiên phải → trái → dưới → trên
  const boxStyle = useMemo((): React.CSSProperties => {
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;
    const boxW = Math.min(380, vw - 24);
    const boxH = 300; // thêm buffer để tính an toàn hơn
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

    // Helper: clamp một vị trí vào viewport
    const clampLeft = (l: number) =>
      Math.max(EDGE, Math.min(vw - boxW - EDGE, l));
    const clampTop = (t: number) =>
      Math.max(EDGE, Math.min(vh - boxH - EDGE, t));

    // Thử 4 hướng theo thứ tự ưu tiên: RIGHT → LEFT → BOTTOM → TOP
    // Chọn hướng đầu tiên mà box KHÔNG đè lên highlight rect

    // RIGHT: box đặt bên phải highlight
    const tryRight = () => {
      const left = gR + GAP;
      const top = clampTop(gCY - boxH / 2);
      if (left + boxW + EDGE <= vw) return { left, top };
      return null;
    };

    // LEFT: box đặt bên trái highlight
    const tryLeft = () => {
      const left = gL - GAP - boxW;
      const top = clampTop(gCY - boxH / 2);
      if (left >= EDGE) return { left, top };
      return null;
    };

    // BOTTOM: box đặt phía dưới highlight, căn giữa ngang
    const tryBottom = () => {
      const top = gB + GAP;
      const left = clampLeft(gCX - boxW / 2);
      if (top + boxH + EDGE <= vh) return { left, top };
      return null;
    };

    // TOP: box đặt phía trên highlight, căn giữa ngang
    const tryTop = () => {
      const top = gT - GAP - boxH;
      const left = clampLeft(gCX - boxW / 2);
      if (top >= EDGE) return { left, top };
      return null;
    };

    const pos =
      tryRight() ??
      tryLeft() ??
      tryBottom() ??
      tryTop() ??
      // Fallback: góc nào còn nhiều chỗ nhất
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
      <div
        style={{
          animation: shake ? "tutorialShake 0.5s ease" : undefined
        }}
      >
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
          {/* Step indicator */}
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
                borderRadius: 4,
                transition: "color 0.15s"
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
                transition: "opacity 0.15s",
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

// ─── Bot Thinking Indicator ───────────────────────────────────────────────────
function BotThinkingIndicator({ message }: { message: string }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 32,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 10002,
        background:
          "linear-gradient(135deg, rgba(17,24,39,0.97), rgba(30,27,75,0.97))",
        border: "1px solid rgba(99,102,241,0.4)",
        borderRadius: 40,
        padding: "10px 20px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: "0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1)",
        animation: "tutorialSlideUp 0.3s ease"
      }}
    >
      {/* Robot icon */}
      <span style={{ fontSize: 20 }}>🤖</span>
      {/* Dots animation */}
      <div style={{ display: "flex", gap: 4 }}>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#818cf8",
              animation: `tutorialBounce 1.2s ease-in-out ${i * 0.2}s infinite`
            }}
          />
        ))}
      </div>
      <span style={{ color: "#a5b4fc", fontSize: 13, fontWeight: 600 }}>
        {message}
      </span>
    </div>
  );
}

// ─── Free Play Modal — player tự bấm Bắt đầu ─────────────────────────────────
function FreePlayModal({ onStart }: { onStart: () => void }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10002,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(6px)",
        pointerEvents: "auto"
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a, #1e1b4b)",
          border: "2px solid rgba(74,222,128,0.4)",
          borderRadius: 24,
          padding: "40px 48px",
          textAlign: "center",
          maxWidth: 420,
          width: "calc(100vw - 48px)",
          boxShadow:
            "0 0 80px rgba(74,222,128,0.15), 0 24px 64px rgba(0,0,0,0.8)",
          animation:
            "tutorialZoomIn 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
        }}
      >
        <div style={{ fontSize: 64, marginBottom: 16, lineHeight: 1 }}>🎓</div>
        <div
          style={{
            display: "inline-block",
            background: "rgba(74,222,128,0.15)",
            border: "1px solid rgba(74,222,128,0.4)",
            color: "#4ade80",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: "uppercase",
            padding: "4px 14px",
            borderRadius: 20,
            marginBottom: 16
          }}
        >
          Hướng dẫn hoàn thành
        </div>
        <div
          style={{
            color: "white",
            fontWeight: 900,
            fontSize: 26,
            marginBottom: 10,
            letterSpacing: -0.5,
            lineHeight: 1.2
          }}
        >
          Bạn đã sẵn sàng chiến đấu!
        </div>
        <div
          style={{
            color: "#9ca3af",
            fontSize: 14,
            marginBottom: 20,
            lineHeight: 1.6
          }}
        >
          Từ giờ bạn hoàn toàn tự do — không có hướng dẫn nữa.
        </div>
        {/* Recap 4 actions */}
        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "center",
            marginBottom: 24
          }}
        >
          {[
            { icon: "💎", label: "Lấy gem", desc: "3 khác / 2 cùng" },
            { icon: "🃏", label: "Mua card", desc: "Gom bonus" },
            { icon: "📌", label: "Reserve", desc: "+1 gold" },
            { icon: "🏛️", label: "Noble", desc: "Tự đến" }
          ].map(item => (
            <div
              key={item.label}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                padding: "10px 4px",
                textAlign: "center"
              }}
            >
              <div style={{ fontSize: 18, marginBottom: 4 }}>{item.icon}</div>
              <div style={{ color: "#e5e7eb", fontSize: 10, fontWeight: 700 }}>
                {item.label}
              </div>
              <div style={{ color: "#6b7280", fontSize: 10, marginTop: 2 }}>
                {item.desc}
              </div>
            </div>
          ))}
        </div>
        <div style={{ color: "#6b7280", fontSize: 12, marginBottom: 20 }}>
          🏆 Đạt{" "}
          <span style={{ color: "#facc15", fontWeight: 700 }}>15 điểm</span>{" "}
          trước Bot để chiến thắng
        </div>
        <button
          onClick={onStart}
          style={{
            width: "100%",
            padding: "14px 0",
            background: "linear-gradient(135deg, #16a34a, #15803d)",
            color: "white",
            border: "none",
            borderRadius: 14,
            fontWeight: 800,
            fontSize: 16,
            cursor: "pointer",
            boxShadow: "0 4px 24px rgba(22,163,74,0.4)",
            letterSpacing: 0.3
          }}
        >
          ⚔️ Bắt đầu!
        </button>
      </div>
    </div>
  );
}

// ─── Bot Won Modal ─────────────────────────────────────────────────────────────
function BotWonModal({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10003,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(6px)",
        pointerEvents: "auto"
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a, #1a0a2e)",
          border: "2px solid rgba(239,68,68,0.4)",
          borderRadius: 24,
          padding: "40px 48px",
          textAlign: "center",
          maxWidth: 400,
          width: "calc(100vw - 48px)",
          boxShadow:
            "0 0 60px rgba(239,68,68,0.1), 0 24px 64px rgba(0,0,0,0.8)",
          animation:
            "tutorialZoomIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
        }}
      >
        <div style={{ fontSize: 64, marginBottom: 12, lineHeight: 1 }}>🤖</div>

        <div
          style={{
            display: "inline-block",
            background: "rgba(239,68,68,0.15)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "#f87171",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: "uppercase",
            padding: "4px 14px",
            borderRadius: 20,
            marginBottom: 16
          }}
        >
          Bot đã thắng lần này
        </div>

        <div
          style={{
            color: "white",
            fontWeight: 900,
            fontSize: 24,
            marginBottom: 10,
            letterSpacing: -0.5
          }}
        >
          Chưa tệ! Thử lại nào 💪
        </div>

        <div
          style={{
            color: "#9ca3af",
            fontSize: 14,
            marginBottom: 24,
            lineHeight: 1.6
          }}
        >
          Phase 1 hướng dẫn vẫn được giữ nguyên —<br />
          bạn sẽ bắt đầu lại từ chế độ tự do.
        </div>

        {/* Tips ngắn */}
        <div
          style={{
            background: "rgba(250,204,21,0.06)",
            border: "1px solid rgba(250,204,21,0.15)",
            borderRadius: 12,
            padding: "14px 16px",
            marginBottom: 24,
            textAlign: "left"
          }}
        >
          <div
            style={{
              color: "#facc15",
              fontSize: 11,
              fontWeight: 700,
              marginBottom: 8,
              letterSpacing: 1
            }}
          >
            💡 GỢI Ý
          </div>
          {[
            "Ưu tiên mua card lv1 để gom bonus sớm",
            "Reserve card lv2/lv3 để bot không lấy mất",
            "Để ý Noble requirements — hướng bonus theo đó"
          ].map((tip, i) => (
            <div
              key={i}
              style={{
                color: "#d1d5db",
                fontSize: 12,
                lineHeight: 1.5,
                paddingLeft: 12,
                position: "relative",
                marginBottom: i < 2 ? 6 : 0
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  top: 3,
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "#facc15",
                  display: "block"
                }}
              />
              {tip}
            </div>
          ))}
        </div>

        <button
          onClick={onRetry}
          style={{
            width: "100%",
            padding: "14px 0",
            background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
            color: "white",
            border: "none",
            borderRadius: 14,
            fontWeight: 800,
            fontSize: 16,
            cursor: "pointer",
            boxShadow: "0 4px 24px rgba(124,58,237,0.4)",
            letterSpacing: 0.3
          }}
        >
          🔄 Thử lại ngay!
        </button>
      </div>
    </div>
  );
}

// ─── Skip Confirm Modal ────────────────────────────────────────────────────────
function SkipConfirmModal({
  onConfirm,
  onCancel
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10003,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.6)",
        pointerEvents: "auto"
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #111827, #1e1b4b)",
          border: "1px solid rgba(250,204,21,0.2)",
          borderRadius: 16,
          padding: "28px 32px",
          textAlign: "center",
          maxWidth: 320,
          boxShadow: "0 20px 60px rgba(0,0,0,0.7)"
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 12 }}>🤔</div>
        <div
          style={{
            color: "white",
            fontWeight: 800,
            fontSize: 17,
            marginBottom: 8
          }}
        >
          Bỏ qua hướng dẫn?
        </div>
        <div
          style={{
            color: "#9ca3af",
            fontSize: 13,
            marginBottom: 20,
            lineHeight: 1.5
          }}
        >
          Bạn sẽ chuyển thẳng sang chế độ tự chơi với Bot.
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "10px 0",
              background: "rgba(55,65,81,0.8)",
              color: "white",
              border: "1px solid #374151",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer"
            }}
          >
            Tiếp tục học
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "10px 0",
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              color: "white",
              border: "none",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer"
            }}
          >
            Bỏ qua
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CSS Animations injected once ─────────────────────────────────────────────
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
  from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}
@keyframes tutorialGlowPulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(250,204,21,0.4); }
  50% { box-shadow: 0 0 0 8px rgba(250,204,21,0); }
}
`;

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
  const [showFreePlayBanner, setShowFreePlayBanner] = useState(false);
  const [svgKey, setSvgKey] = useState(0);

  // Poll cho đến khi animation-portal xuất hiện trong DOM
  // useEffect([]) không đủ vì AnimationLayer tạo portal async sau khi mount
  useEffect(() => {
    const el = document.getElementById("animation-portal");
    if (el) {
      setPortalEl(el);
      return;
    }
    // Portal chưa có → poll bằng requestAnimationFrame
    let frameId: number;
    const poll = () => {
      const found = document.getElementById("animation-portal");
      if (found) {
        setPortalEl(found);
      } else {
        frameId = requestAnimationFrame(poll);
      }
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

  useEffect(() => {
    if (phase === "TRANSITION") setShowFreePlayBanner(true);
  }, [phase]);

  if (!portalEl) return null;

  // Bot won modal — hiện trên tất cả, kể cả FREE_PLAY
  if (showBotWon) {
    return createPortal(<BotWonModal onRetry={onRetry} />, portalEl);
  }

  // Không hiện gì khi FREE_PLAY bình thường (chỉ hiện bot thinking nếu có)
  if (phase === "FREE_PLAY" || phase === "DONE") {
    if (!isBotThinking) return null;
    return createPortal(
      <BotThinkingIndicator message={botThinkingMessage} />,
      portalEl
    );
  }

  // TRANSITION phase
  if (phase === "TRANSITION") {
    return createPortal(
      <>
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            background: "rgba(0,0,0,0.5)",
            pointerEvents: "auto"
          }}
        />
        <FreePlayModal
          onStart={() => {
            setShowFreePlayBanner(false);
            onStartFreePlay();
          }}
        />
      </>,
      portalEl
    );
  }

  // GUIDED phase
  if (!step) return null;

  // dùng clientWidth/Height khớp getBoundingClientRect()
  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;
  const pad = step.highlight.type === "NONE" ? 0 : 3.5;

  return createPortal(
    <>
      {/*
        Dùng 1 SVG fullscreen cho cả 3 việc:
        1. Dim overlay với đục lỗ spotlight (mask)
        2. Glow ring quanh highlight
        3. Click blocker với lỗ thủng ở vùng spotlight (clipPath + fillRule evenodd)

        Lý do dùng SVG clipPath thay vì div cutout:
        - Portal có pointerEvents:none → div con pointerEvents:auto KHÔNG hoạt động
          (CSS pointer-events:auto chỉ override được khi parent là auto/all, không phải none)
        - SVG clipPath + fillRule:evenodd "đục lỗ" trực tiếp trên rect blocker
          → vùng spotlight không có rect → event xuyên thẳng xuống game UI
      */}

      {!isBotThinking ? (
        <>
          {" "}
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
              {/* Mask đục lỗ spotlight cho dim layer */}
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

              {/*
            ClipPath cho click blocker:
            fillRule="evenodd" → rect trong rect = đục lỗ
            → vùng spotlight bị "cắt ra" khỏi blocker → event xuyên qua
          */}
              <clipPath id="tut-block-clip" clipPathUnits="userSpaceOnUse">
                <path
                  fillRule="evenodd"
                  d={[
                    `M0,0 L${vw},0 L${vw},${vh} L0,${vh} Z`,
                    ...highlightRects.map(
                      r =>
                        `M${r.left - pad},${r.top - pad} ` +
                        `L${r.right + pad},${r.top - pad} ` +
                        `L${r.right + pad},${r.bottom + pad} ` +
                        `L${r.left - pad},${r.bottom + pad} Z`
                    )
                  ].join(" ")}
                />
              </clipPath>
            </defs>

            {/* Dim layer — pointer-events none, chỉ visual */}
            <rect
              width={vw}
              height={vh}
              fill="rgba(0,0,0,0.78)"
              mask="url(#tut-dim-mask)"
              style={{ pointerEvents: "none" }}
            />

            {/* Glow ring */}
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
          {/* Message box — HTML thuần, zIndex trên SVG */}
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
          />{" "}
        </>
      ) : (
        <BotThinkingIndicator message={botThinkingMessage} />
      )}

      {showSkipConfirm && (
        <SkipConfirmModal
          onConfirm={() => {
            setShowSkipConfirm(false);
            onSkip();
          }}
          onCancel={() => setShowSkipConfirm(false)}
        />
      )}
    </>,
    portalEl
  );
}
