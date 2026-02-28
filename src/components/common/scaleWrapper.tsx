// app/room/[id]/page.tsx hoặc layout wrapper

"use client";
import { useEffect, useRef } from "react";

export function ScaleWrapper({ children }: { children: React.ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      if (!innerRef.current) return;
      const scaleX = window.innerWidth / 1440;
      const scaleY = window.innerHeight / 900;
      const scale = Math.min(scaleX, scaleY);
      innerRef.current.style.transform = `scale(${scale})`;
      innerRef.current.style.transformOrigin = "top left";
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="w-screen h-screen overflow-hidden bg-gray-900"
    >
      <div
        ref={innerRef}
        style={{ width: 1440, height: 900, position: "absolute" }}
      >
        {children}
      </div>
    </div>
  );
}
