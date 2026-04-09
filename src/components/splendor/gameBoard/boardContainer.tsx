"use client";
import React, { useMemo } from "react";
import { GemColor, SplendorGameState } from "@/src/types/splendor";
import CardsBoard from "./cards";
import GemsCard from "./gems";
import { LastRoundBanner } from "./lastRoundBanner";
import { TutorialStep } from "@/src/hook/game/useTutorialSteps";

type TProps = {
  gameId?: string;
  gameState: SplendorGameState | null;
  isConnected?: boolean;
  isMyTurn: boolean;
  isLandscape?: boolean;
  baseH?: number;
  onPurchase?: (cardId: string) => void;
  onReserve?: (cardId?: string, level?: number) => void;
  onReserveFromDeck?: (level: number) => void;
  onCollectGem?: (gems: Record<GemColor, number>) => void;
  currentStep: TutorialStep | null;
};

export default function BoardContainer({
  gameState,
  onPurchase,
  onReserve,
  onReserveFromDeck,
  onCollectGem,
  isMyTurn,
  isLandscape = true,
  currentStep
}: TProps) {
  const bankGemsMemo = useMemo(
    () => gameState?.board?.gemBank ?? null,
    [gameState]
  );
  const cardsDataMemo = useMemo(
    () => gameState?.board?.visibleCards ?? null,
    [gameState]
  );
  const cardsNobles = useMemo(
    () => gameState?.board?.nobles ?? null,
    [gameState]
  );
  const cardsDeck = useMemo(
    () => gameState?.board?.cardDecks ?? null,
    [gameState]
  );

  // Scroll chỉ khi baseH < 500 (màn rất ngắn)
  const allowScroll = false;

  // Landscape: gems column 110px | Portrait: gems row auto height
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: isLandscape ? "row" : "column",
        gap: 8,
        padding: 8,
        overflow: allowScroll ? "auto" : "hidden",
        background: "#13131B"
      }}
      className="md:border-r-3"
    >
      {/* Gems panel */}
      <div
        style={{
          flexShrink: 0,
          width: isLandscape ? 110 : "100%",
          height: isLandscape ? "100%" : "auto"
        }}
      >
        <GemsCard
          bankGems={bankGemsMemo}
          isMyTurn={isMyTurn}
          isLandscape={isLandscape}
          onConfirm={gems => onCollectGem?.(gems)}
          currentStep={currentStep}
        />
      </div>

      {/* ✅ Divider */}
      <div
        style={{
          background: "#1C1C26",
          borderRadius: 999,
          width: isLandscape ? 2 : "100%",
          height: isLandscape ? "100%" : 2,
          flexShrink: 0
        }}
      />

      {/* Cards */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          overflow: allowScroll ? "auto" : "hidden"
        }}
      >
        <CardsBoard
          currentStep={currentStep}
          cardsNobles={cardsNobles}
          dataCards={cardsDataMemo}
          cardDecks={cardsDeck ?? {}}
          isMyTurn={isMyTurn}
          onPurchase={cardId => onPurchase?.(cardId)}
          onReserve={cardId => onReserve?.(cardId)}
          onReserveFromDeck={level => {
            if (onReserveFromDeck) onReserveFromDeck(level);
            else onReserve?.(undefined, level);
          }}
        />
      </div>
    </div>
  );
}
