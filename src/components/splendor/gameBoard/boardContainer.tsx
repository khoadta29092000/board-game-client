/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useMemo, useRef } from "react";
import { GemColor, SplendorGameState } from "@/src/types/splendor";
import CardsBoard from "./cards";
import GemsCard from "./gems";
import { useAuth } from "@/src/redux/global/selectors";

type TProps = {
  gameId?: string;
  gameState: SplendorGameState | null;
  isConnected?: boolean;
  isMyTurn: boolean;
  onPurchase?: (cardId: string) => void;
  // onReserve can be either reserving a specific card or reserving from deck (level)
  onReserve?: (cardId?: string, level?: number) => void;
  onReserveFromDeck?: (level: number) => void;
  // onCollectGem receives the gem counts, e.g. { Red: 1, Blue: 2, ... }
  onCollectGem?: (gems: Record<GemColor, number>) => void;
};

export default function BoardContainer({
  gameState,
  onPurchase,
  onReserve,
  onReserveFromDeck,
  onCollectGem,
  isMyTurn
}: TProps) {
  const { id: userId } = useAuth();
  const toastShownRef = useRef(new Set<string>());

  // memoize derived props passed to heavy children
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

  return (
    <div
      className="
      w-full 
      flex flex-col lg:flex-row
      gap-2 p-2
      bg-gradient-to-br from-purple-900 to-slate-900
    "
    >
      {/* Gems / bank */}
      <div className="flex-shrink-0 overflow-x-auto p-2 sm:p-4">
        <GemsCard
          bankGems={bankGemsMemo}
          isMyTurn={isMyTurn}
          onConfirm={gems => onCollectGem?.(gems)}
        />
      </div>

      {/* Cards */}
      <div className="flex-1 flex flex-col">
        <CardsBoard
          cardsNobles={cardsNobles}
          dataCards={cardsDataMemo}
          cardDecks={cardsDeck ?? {}}
          isMyTurn={isMyTurn}
          onPurchase={cardId => onPurchase?.(cardId)}
          onReserve={cardId => onReserve?.(cardId)}
          onReserveFromDeck={level => {
            if (onReserveFromDeck) {
              onReserveFromDeck(level);
            } else {
              onReserve?.(undefined, level);
            }
          }}
        />
      </div>
    </div>
  );
}
