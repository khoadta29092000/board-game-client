"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";

type Props = {
  visible: boolean;
  onStart: () => void;
};

export default function FreePlayModal({ visible, onStart }: Props) {
  const t = useTranslations();
  const [portalEl, setPortalEl] = useState<Element | null>(null);

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

  if (!portalEl || !visible) return null;

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
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 10002,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
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
          <div style={{ fontSize: 64, marginBottom: 16, lineHeight: 1 }}>
            🎓
          </div>
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
            {t("freeplay_tag")}
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
            {t("freeplay_title")}
          </div>
          <div
            style={{
              color: "#9ca3af",
              fontSize: 14,
              marginBottom: 20,
              lineHeight: 1.6
            }}
          >
            {t("freeplay_desc")}
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "center",
              marginBottom: 24
            }}
          >
            {[
              { icon: "💎", label: t("freeplay_gem"), desc: t("freeplay_gem_desc") },
              { icon: "🃏", label: t("freeplay_card"), desc: t("freeplay_card_desc") },
              { icon: "📌", label: t("freeplay_reserve"), desc: t("freeplay_reserve_desc") },
              { icon: "🏛️", label: t("freeplay_noble"), desc: t("freeplay_noble_desc") }
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
                <div
                  style={{ color: "#e5e7eb", fontSize: 10, fontWeight: 700 }}
                >
                  {item.label}
                </div>
                <div style={{ color: "#6b7280", fontSize: 10, marginTop: 2 }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
          <div style={{ color: "#6b7280", fontSize: 12, marginBottom: 20 }}>
            {t("freeplay_goal1")}
            <span style={{ color: "#facc15", fontWeight: 700 }}>15 điểm</span>{" "}
            {t("freeplay_goal2")}
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
            {t("freeplay_start")}
          </button>
        </div>
      </div>
    </>,
    portalEl
  );
}
