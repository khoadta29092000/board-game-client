/* eslint-disable @typescript-eslint/no-explicit-any */
import { SplendorGameState } from "@/src/types/splendor";
import { useCallback } from "react";

export function useSkipTurn() {
  const isDeadlocked = useCallback(
    (state: SplendorGameState, playerId: string): boolean => {
      const player = state.players?.[playerId];
      const bank = state.board?.gemBank;
      if (!player || !bank) return false;

      // 1. Có lấy gem được không?
      const nonGoldBank = Object.entries(bank).filter(
        ([c, n]) => c !== "Gold" && (n as number) > 0
      );
      const canCollect3 = nonGoldBank.length >= 3;
      const canCollect2Same = nonGoldBank.some(([_, n]) => (n as number) >= 4);
      if (canCollect3 || canCollect2Same) return false;

      // 2. Có mua được card nào không? (visible + reserved)
      const allCards = [
        ...(state.board?.visibleCards?.level1 ?? []),
        ...(state.board?.visibleCards?.level2 ?? []),
        ...(state.board?.visibleCards?.level3 ?? []),
        ...(player.reservedCards ?? [])
      ];
      const gems = player.gems ?? {};
      const bonuses = player.bonuses ?? {};
      const gold = (gems as Record<string, number>)["Gold"] ?? 0;

      const canPurchase = allCards.some((card: any) => {
        if (!card?.cost) return false;
        let goldNeeded = 0;
        for (const [color, cost] of Object.entries(
          card.cost as Record<string, number>
        )) {
          if (color === "Gold") continue;
          const have =
            ((gems as Record<string, number>)[color] ?? 0) +
            ((bonuses as Record<string, number>)[color] ?? 0);
          const missing = (cost as number) - have;
          if (missing > 0) goldNeeded += missing;
        }
        return goldNeeded <= gold;
      });
      if (canPurchase) return false;

      // 3. Có reserve được không?
      const reservedCount = player.reservedCards?.length ?? 0;
      const hasVisibleCard =
        [
          ...(state.board?.visibleCards?.level1 ?? []),
          ...(state.board?.visibleCards?.level2 ?? []),
          ...(state.board?.visibleCards?.level3 ?? [])
        ].length > 0;
      if (reservedCount < 3 && hasVisibleCard) return false;

      return true;
    },
    []
  );

  return { isDeadlocked };
}

export default useSkipTurn;
