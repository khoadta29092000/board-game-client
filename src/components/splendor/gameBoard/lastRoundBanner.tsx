"use client";
import { SplendorGameState } from "@/src/types/splendor";
import React, { useEffect } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ── LastRound Banner ──────────────────────────────────────────────────────────
export function LastRoundBanner({
  triggeredBy = "",
  onClose
}: {
  triggeredBy: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 6000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "linear-gradient(90deg, #dc2626, #9f1239)",
        padding: "7px 14px",
        gap: 8
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}
      >
        <span style={{ fontSize: 16, flexShrink: 0 }}>🔔</span>
        <span
          style={{
            color: "white",
            fontWeight: 700,
            fontSize: 13,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}
        >
          LAST ROUND!&nbsp;
          <span style={{ color: "#fca5a5" }}>{triggeredBy}</span>
          &nbsp;hit 15pts — one more turn each!
        </span>
      </div>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "white",
          cursor: "pointer",
          fontSize: 14,
          opacity: 0.7,
          flexShrink: 0,
          padding: 0
        }}
      >
        ✕
      </button>
    </div>
  );
}

// ── GameOver Overlay ──────────────────────────────────────────────────────────
