"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";

/**
 * Responsive BASE_W:
 *   mobile  < 768px  → BASE_W = 560  → iPhone SE 375px: scale=0.67x (to, rõ)
 *   tablet  768-1099 → BASE_W = 900
 *   desktop ≥ 1100   → BASE_W = 1200
 *
 * baseH = vh / scale → dùng để tính player info height & detect portrait/landscape
 */

function getBaseW(vw: number) {
  const vh = window.innerHeight;
  const ratio = vw / vh;

  if (vw < 600) {
    if (ratio < 0.55) return 560;
    return 680;
  }
  if (vw < 900) return 940;
  if (vw < 1000) return 1000;
  if (vw < 1100) {
    if (ratio < 0.85) return 900;
    return 1000;
  }
  if (vw < 1500) return 1200;
  return 1600;
}

type Ctx = {
  baseW: number;
  baseH: number;
  vw: number;
  vh: number;
  scale: number;
  isMobile: boolean; // vw < 768
  isTablet: boolean; // 768–1099
  isDesktop: boolean; // ≥ 1100
};

const defaultCtx: Ctx = {
  baseW: 1200,
  baseH: 400,
  vw: 1440,
  vh: 800,
  scale: 1,
  isMobile: false,
  isTablet: false,
  isDesktop: true
};

const CanvasCtx = createContext<Ctx>(defaultCtx);
export const useCanvas = () => useContext(CanvasCtx);

export function ScaleWrapper({ children }: { children: React.ReactNode }) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [ctx, setCtx] = useState<Ctx>(defaultCtx);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      if (!innerRef.current) return;
      const vw = document.documentElement.clientWidth; // ← thay window.innerWidth
      const vh = document.documentElement.clientHeight; // ← thay window.innerHeight
      const baseW = getBaseW(vw);
      const scale = vw / baseW;
      const baseH = Math.round(vh / scale);

      innerRef.current.style.width = `${baseW}px`;
      innerRef.current.style.height = `${baseH}px`;
      innerRef.current.style.position = "absolute";
      innerRef.current.style.left = "0px";
      innerRef.current.style.top = "0px";
      innerRef.current.style.transformOrigin = "top left";
      innerRef.current.style.transform = `scale(${scale})`;
      innerRef.current.style.willChange = "transform";

      setCtx({
        baseW,
        baseH,
        vw,
        vh,
        scale,
        isMobile: vw < 640,
        isTablet: vw >= 640 && vw < 1100,
        isDesktop: vw >= 1100
      });
    };

    const onResize = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      style={{
        width: "100%",
        overflow: "hidden",
        position: "fixed",
        inset: 0,
        background: "#0f0a1e"
      }}
    >
      <CanvasCtx.Provider value={ctx}>
        <div ref={innerRef} style={{ overflow: "hidden", minHeight: 600 }}>
          {children}
        </div>
      </CanvasCtx.Provider>
    </div>
  );
}

// Kept for backward compat
export const BASE_W = 1200;
