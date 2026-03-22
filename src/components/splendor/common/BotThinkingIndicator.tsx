// BotThinkingIndicator.tsx
"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  message: string;
  visible: boolean;
};

export default function BotThinkingIndicator({ message, visible }: Props) {
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
        boxShadow: "0 4px 24px rgba(0,0,0,0.5)"
      }}
    >
      <span style={{ fontSize: 20 }}>🤖</span>
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
    </div>,
    portalEl
  );
}
