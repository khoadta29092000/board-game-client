"use client";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch } from "react-redux";
import { animate } from "framer-motion";
import { gemIconMap } from "@/src/utils";
import Image from "next/image";
import {
  useCurrentAnimationEvent,
  useIsAnimating
} from "@/src/redux/animation/selectors";
import { setIsAnimating, shiftEvent } from "@/src/redux/animation/slice";
import {
  getCardBoardRect,
  getCardReservedRect,
  getCardSlotRect,
  getGemBankRect,
  getGemPlayerRect,
  getNoblePlayerRect,
  getNobleRect
} from "@/src/redux/animation/Animationrefs";
import { playSound } from "@/src/sounds.ts/splendorSounds";

// Màu background card theo bonusColor — giống SplendorCardUI
const CARD_BG: Record<string, string> = {
  White: "#475569",
  Blue: "#1e3a8a",
  Green: "#14532d",
  Red: "#7f1d1d",
  Black: "#1e1b4b"
};

// ─── Flying Gem — clone nguyên circle từ bank ─────────────────────────────────
function FlyingGem({
  color,
  fromRect,
  toRect,
  delay,
  sizeRect,
  onComplete
}: {
  color: string;
  fromRect: DOMRect;
  toRect: DOMRect;
  delay: number;
  sizeRect?: DOMRect; // dùng size của rect này (vd: bank rect khi RETURN từ pill nhỏ)
  onComplete: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const done = useRef(false);

  const size = (sizeRect ?? fromRect).width;
  const startX = fromRect.left + fromRect.width / 2 - size / 2;
  const startY = fromRect.top + fromRect.height / 2 - size / 2;
  const endCX = toRect.left + toRect.width / 2;
  const endCY = toRect.top + toRect.height / 2;
  const startCX = fromRect.left + fromRect.width / 2;
  const startCY = fromRect.top + fromRect.height / 2;

  useEffect(() => {
    if (!ref.current) return;
    const dx = endCX - startCX;
    const dy = endCY - startCY;
    animate(
      ref.current,
      {
        x: [0, dx * 0.4, dx],
        y: [0, dy * 0.4 - 50, dy],
        scale: [1, 1.2, 0.9],
        opacity: [1, 1, 0]
      },
      {
        duration: 0.55,
        delay,
        ease: "easeInOut",
        onComplete: () => {
          if (!done.current) {
            done.current = true;
            onComplete();
          }
        }
      }
    );
  }, []);

  return (
    // Clone nguyên gem circle — border + background + icon giống hệt bank
    <div
      ref={ref}
      style={{
        position: "absolute",
        left: startX,
        top: startY,
        // width: size,
        // height: size,
        borderRadius: "50%",
        border: "2px solid #ef4444", // border đỏ như khi selected
        background: "#1f2937",
        boxShadow: "0 0 16px rgba(239,68,68,0.6)",
        pointerEvents: "none",
        overflow: "hidden",
        padding: 6,
        boxSizing: "border-box"
      }}
    >
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <Image
          src={gemIconMap[color as keyof typeof gemIconMap]}
          alt={color}
          fill
          className="object-contain"
        />
      </div>
    </div>
  );
}

// ─── Flying Card — clone card UI thật ────────────────────────────────────────
function FlyingCard({
  fromRect,
  toRect,
  bonusColor,
  delay,
  onComplete
}: {
  fromRect: DOMRect;
  toRect: DOMRect;
  bonusColor: string;
  delay: number;
  onComplete: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const done = useRef(false);

  useEffect(() => {
    if (!ref.current) return;
    animate(
      ref.current,
      {
        x: [0, toRect.left - fromRect.left],
        y: [0, toRect.top - fromRect.top],
        scale: [1, 1.08, 0.85],
        rotate: [0, 5, -3, 0],
        opacity: [1, 1, 1, 0]
      },
      {
        duration: 0.6,
        delay,
        ease: "easeInOut",
        onComplete: () => {
          if (!done.current) {
            done.current = true;
            onComplete();
          }
        }
      }
    );
  }, []);

  return (
    // Clone card UI: màu bg đúng theo bonusColor + border vàng + gem icon góc phải
    <div
      ref={ref}
      style={{
        position: "absolute",
        left: fromRect.left,
        top: fromRect.top,
        width: fromRect.width,
        height: fromRect.height,
        borderRadius: 8,
        background: CARD_BG[bonusColor] ?? "#1f2937",
        border: "2px solid #facc15",
        boxShadow: "0 0 20px rgba(250,204,21,0.5), 0 4px 20px rgba(0,0,0,0.4)",
        pointerEvents: "none",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "flex-end",
        padding: 8
      }}
    >
      {/* Gem bonus icon góc phải trên — giống SplendorCardUI */}
      <div style={{ position: "relative", width: 36, height: 36 }}>
        <Image
          src={gemIconMap[bonusColor as keyof typeof gemIconMap]}
          alt={bonusColor}
          fill
          className="object-contain"
        />
      </div>
    </div>
  );
}

// ─── Flying Noble ─────────────────────────────────────────────────────────────
function FlyingNoble({
  fromRect,
  toRect,
  delay,
  onComplete
}: {
  fromRect: DOMRect;
  toRect: DOMRect;
  delay: number;
  onComplete: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const done = useRef(false);

  useEffect(() => {
    if (!ref.current) return;
    animate(
      ref.current,
      {
        x: [0, toRect.left - fromRect.left],
        y: [0, toRect.top - fromRect.top - 30, toRect.top - fromRect.top],
        scale: [1, 1.2, 0.9],
        opacity: [1, 1, 0]
      },
      {
        duration: 0.8,
        delay,
        ease: "easeInOut",
        onComplete: () => {
          if (!done.current) {
            done.current = true;
            onComplete();
          }
        }
      }
    );
  }, []);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        left: fromRect.left,
        top: fromRect.top,
        width: fromRect.width,
        height: fromRect.height,
        pointerEvents: "none",
        borderRadius: 8,
        background: "rgba(126,34,206,0.6)",
        border: "2px solid #a855f7",
        boxShadow: "0 0 24px rgba(168,85,247,0.6)"
      }}
    />
  );
}

// ─── Gems Return After Purchase ───────────────────────────────────────────────
// Sau khi card bay xong, gems bay từ player về bank
function GemsReturnGroup({
  gems,
  fromPlayerId,
  onComplete
}: {
  gems: { color: string; amount: number }[];
  fromPlayerId: string;
  onComplete: () => void;
}) {
  const total = gems.length;
  const count = useRef(0);

  const handleOne = () => {
    if (++count.current >= total) onComplete();
  };

  const bankRect0 = getGemBankRect(gems[0]?.color);

  return (
    <>
      {gems.map(({ color }, i) => {
        const from = getGemPlayerRect(fromPlayerId, color);
        const to = getGemBankRect(color);
        if (!from || !to) {
          handleOne();
          return null;
        }
        return (
          <FlyingGem
            key={`ret-${color}-${i}`}
            color={color}
            fromRect={from}
            toRect={to}
            delay={i * 0.07}
            sizeRect={to} // dùng bank size vì from là pill nhỏ
            onComplete={() => {
              playSound("gemReturn");
              handleOne();
            }}
          />
        );
      })}
    </>
  );
}

// ─── Main AnimationLayer ──────────────────────────────────────────────────────
export default function AnimationLayer() {
  const dispatch = useDispatch();
  const currentEvent = useCurrentAnimationEvent();
  const isAnimating = useIsAnimating();
  const [portalEl, setPortalEl] = useState<Element | null>(null);
  // Phase cho PURCHASE_CARD: "card" → card bay trước, "gems" → gems bay sau
  const [purchasePhase, setPurchasePhase] = useState<"card" | "gems">("card");

  useEffect(() => {
    setPortalEl(document.getElementById("animation-portal"));
  }, []);

  useEffect(() => {
    if (currentEvent && !isAnimating) {
      dispatch(setIsAnimating(true));
      // Reset phase khi event mới vào
      if (currentEvent.type === "PURCHASE_CARD") setPurchasePhase("card");
    }
  }, [currentEvent?.type, isAnimating]);

  if (!currentEvent || !isAnimating || !portalEl) return null;

  const done = () => {
    dispatch(setIsAnimating(false));
    dispatch(shiftEvent());
  };

  // ── COLLECT GEM ───────────────────────────────────────────────────────────
  if (currentEvent.type === "COLLECT_GEM") {
    const { gems, toPlayerId } = currentEvent;
    let count = 0;
    const elements = gems.flatMap(({ color }, i) => {
      const from = getGemBankRect(color);
      const to = getGemPlayerRect(toPlayerId, color);
      if (!from || !to) return [];
      return (
        <FlyingGem
          key={`cg-${color}-${i}`}
          color={color}
          fromRect={from}
          toRect={to}
          delay={i * 0.1}
          onComplete={() => {
            playSound("gemCollect");
            if (++count >= gems.length) done();
          }}
        />
      );
    });
    if (elements.length === 0) {
      done();
      return null;
    }
    return createPortal(<>{elements}</>, portalEl);
  }

  // ── RETURN GEM (discard) ──────────────────────────────────────────────────
  if (currentEvent.type === "RETURN_GEM") {
    const { gems, fromPlayerId } = currentEvent;
    let count = 0;
    const elements = gems.flatMap(({ color }, i) => {
      const from = getGemPlayerRect(fromPlayerId, color);
      const to = getGemBankRect(color);
      if (!from || !to) return [];
      return (
        <FlyingGem
          key={`rg-${color}-${i}`}
          color={color}
          fromRect={from}
          toRect={to}
          delay={i * 0.07}
          sizeRect={to}
          onComplete={() => {
            playSound("gemReturn");
            if (++count >= gems.length) done();
          }}
        />
      );
    });
    if (elements.length === 0) {
      done();
      return null;
    }
    return createPortal(<>{elements}</>, portalEl);
  }

  // ── PURCHASE CARD: phase "card" → card bay, phase "gems" → gems trả về ────
  if (currentEvent.type === "PURCHASE_CARD") {
    const { cardId, fromPlayerId, bonusColor, gemsReturned } = currentEvent;

    if (purchasePhase === "card") {
      const from = getCardBoardRect(cardId) ?? getCardReservedRect(cardId);
      const to = getCardSlotRect(fromPlayerId);
      if (!from || !to) {
        // Không có rect → skip thẳng sang gems nếu có
        if (gemsReturned.length > 0) {
          setPurchasePhase("gems");
          return null;
        }
        done();
        return null;
      }
      return createPortal(
        <FlyingCard
          fromRect={from}
          toRect={to}
          bonusColor={bonusColor}
          delay={0}
          onComplete={() => {
            playSound("cardPurchase");
            if (gemsReturned.length > 0) {
              setPurchasePhase("gems"); // → chuyển sang phase gems
            } else {
              done();
            }
          }}
        />,
        portalEl
      );
    }

    if (purchasePhase === "gems") {
      return createPortal(
        <GemsReturnGroup
          gems={gemsReturned}
          fromPlayerId={fromPlayerId}
          onComplete={done}
        />,
        portalEl
      );
    }
  }

  // ── RESERVE CARD ──────────────────────────────────────────────────────────
  if (currentEvent.type === "RESERVE_CARD") {
    const { cardId, toPlayerId } = currentEvent;
    const from = getCardBoardRect(cardId);
    const to = getCardSlotRect(toPlayerId);
    if (!from || !to) {
      done();
      return null;
    }
    return createPortal(
      <FlyingCard
        fromRect={from}
        toRect={to}
        bonusColor="Blue"
        delay={0}
        onComplete={() => {
          playSound("cardReserve");
          done();
        }}
      />,
      portalEl
    );
  }

  // ── NOBLE VISIT ───────────────────────────────────────────────────────────
  if (currentEvent.type === "NOBLE_VISIT") {
    const { nobleId, toPlayerId } = currentEvent;
    const from = getNobleRect(nobleId);
    const to = getNoblePlayerRect(toPlayerId);
    if (!from || !to) {
      done();
      return null;
    }
    return createPortal(
      <FlyingNoble
        fromRect={from}
        toRect={to}
        delay={0}
        onComplete={() => {
          playSound("nobleClaim");
          done();
        }}
      />,
      portalEl
    );
  }

  return null;
}
