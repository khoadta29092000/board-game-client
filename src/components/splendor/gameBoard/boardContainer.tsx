"use client";
import React, { useMemo } from "react";
import { GemColor, SplendorGameState } from "@/src/types/splendor";
import CardsBoard from "./cards";
import GemsCard from "./gems";
import { LastRoundBanner } from "./lastRoundBanner";

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
};

export default function BoardContainer({
  gameState,
  onPurchase,
  onReserve,
  onReserveFromDeck,
  onCollectGem,
  isMyTurn,
  isLandscape = true
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
        background: "linear-gradient(135deg, #4a1d96, #0f172a)",
        borderRadius: 12,
        padding: 8,
        overflow: allowScroll ? "auto" : "hidden"
      }}
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
        />
      </div>

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
