"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";

type Props = {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function SkipConfirmModal({
  visible,
  onConfirm,
  onCancel
}: Props) {
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
          {t("skip_title")}
        </div>
        <div
          style={{
            color: "#9ca3af",
            fontSize: 13,
            marginBottom: 20,
            lineHeight: 1.5
          }}
        >
          {t("skip_desc")}
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
            {t("skip_continue")}
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
            {t("skip_confirm")}
          </button>
        </div>
      </div>
    </div>,
    portalEl
  );
}
