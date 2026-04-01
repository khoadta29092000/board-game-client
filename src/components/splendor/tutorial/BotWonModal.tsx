"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "@/src/i18n/navigation";
import { useTranslations } from "next-intl";

type Props = {
  visible: boolean;
};

export default function BotWonModal({ visible }: Props) {
  const t = useTranslations();
  const [portalEl, setPortalEl] = useState<Element | null>(null);
  const router = useRouter();

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
          border: "2px solid rgba(139,92,246,0.4)",
          borderRadius: 24,
          padding: "40px 48px",
          textAlign: "center",
          maxWidth: 400,
          width: "calc(100vw - 48px)",
          boxShadow:
            "0 0 60px rgba(139,92,246,0.1), 0 24px 64px rgba(0,0,0,0.8)",
          animation:
            "tutorialZoomIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
        }}
      >
        <div style={{ fontSize: 64, marginBottom: 12, lineHeight: 1 }}>🎓</div>
        <div
          style={{
            display: "inline-block",
            background: "rgba(139,92,246,0.15)",
            border: "1px solid rgba(139,92,246,0.3)",
            color: "#a78bfa",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: "uppercase",
            padding: "4px 14px",
            borderRadius: 20,
            marginBottom: 16
          }}
        >
          {t("botwon_tag")}
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
          {t("botwon_title")}
        </div>
        <div
          style={{
            color: "#9ca3af",
            fontSize: 14,
            marginBottom: 24,
            lineHeight: 1.6
          }}
          dangerouslySetInnerHTML={{ __html: t("botwon_desc") }}
        />
        <div
          style={{
            background: "rgba(139,92,246,0.06)",
            border: "1px solid rgba(139,92,246,0.15)",
            borderRadius: 12,
            padding: "14px 16px",
            marginBottom: 24,
            textAlign: "left"
          }}
        >
          <div
            style={{
              color: "#a78bfa",
              fontSize: 11,
              fontWeight: 700,
              marginBottom: 8,
              letterSpacing: 1
            }}
          >
            {t("botwon_learned")}
          </div>
          {[
            t("botwon_learn1"),
            t("botwon_learn2"),
            t("botwon_learn3")
          ].map((item, i) => (
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
                  background: "#a78bfa",
                  display: "block"
                }}
              />
              {item}
            </div>
          ))}
        </div>
        <button
          onClick={() => router.push("/lobby")}
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
          {t("botwon_button")}
        </button>
      </div>
    </div>,
    portalEl
  );
}
