// =====================================================================
// src/hooks/useGameDiff.ts
// =====================================================================
import { AnimationEventType } from "@/src/redux/animation/slice";
import { GemColor, SplendorGameState } from "@/src/types/splendor";

export function diffGameState(
  oldState: SplendorGameState,
  newState: SplendorGameState
): AnimationEventType[] {
  const events: AnimationEventType[] = [];
  if (!oldState || !newState) return events;

  for (const [playerId, newPlayer] of Object.entries(newState.players)) {
    const oldPlayer = oldState.players[playerId];
    if (!oldPlayer) continue;

    // ── PURCHASE CARD: check trước để biết gems giảm do mua card ───
    let didPurchase = false;

    if (newPlayer.totalOwnedCards > oldPlayer.totalOwnedCards) {
      const oldReservedIds = new Set(
        oldPlayer.reservedCards.map(c => c.cardId)
      );
      const newReservedIds = new Set(
        newPlayer.reservedCards.map(c => c.cardId)
      );
      const purchasedFromReserved = [...oldReservedIds].filter(
        id => !newReservedIds.has(id)
      );

      const oldBoardCardIds = new Set([
        ...oldState.board.visibleCards.level1.map(c => c.cardId),
        ...oldState.board.visibleCards.level2.map(c => c.cardId),
        ...oldState.board.visibleCards.level3.map(c => c.cardId)
      ]);
      const newBoardCardIds = new Set([
        ...newState.board.visibleCards.level1.map(c => c.cardId),
        ...newState.board.visibleCards.level2.map(c => c.cardId),
        ...newState.board.visibleCards.level3.map(c => c.cardId)
      ]);
      const purchasedFromBoard = [...oldBoardCardIds].filter(
        id => !newBoardCardIds.has(id)
      );
      const purchasedCardId = purchasedFromReserved[0] ?? purchasedFromBoard[0];

      // Tìm bonusColor của card để animate đúng màu
      const allOldCards = [
        ...oldState.board.visibleCards.level1,
        ...oldState.board.visibleCards.level2,
        ...oldState.board.visibleCards.level3,
        ...oldPlayer.reservedCards
      ];
      const purchasedCard = allOldCards.find(c => c.cardId === purchasedCardId);

      // Gems giảm = gems trả về bank khi mua card
      const gemsReturned: { color: string; amount: number }[] = [];
      for (const color of Object.keys(newPlayer.gems) as GemColor[]) {
        const delta =
          (newPlayer.gems[color] ?? 0) - (oldPlayer.gems[color] ?? 0);
        if (delta < 0) {
          for (let i = 0; i < Math.abs(delta); i++)
            gemsReturned.push({ color, amount: 1 });
        }
      }

      if (purchasedCardId) {
        didPurchase = true;
        events.push({
          type: "PURCHASE_CARD",
          cardId: purchasedCardId,
          fromPlayerId: playerId,
          bonusColor: purchasedCard?.bonusColor ?? "Blue",
          gemsReturned
        });
      }
    }

    // ── COLLECT GEM: gems tăng → bank → player ─────────────────────
    const gemsCollected: { color: string; amount: number }[] = [];
    for (const color of Object.keys(newPlayer.gems) as GemColor[]) {
      const delta = (newPlayer.gems[color] ?? 0) - (oldPlayer.gems[color] ?? 0);
      if (delta > 0) {
        for (let i = 0; i < delta; i++)
          gemsCollected.push({ color, amount: 1 });
      }
    }
    if (gemsCollected.length > 0) {
      events.push({
        type: "COLLECT_GEM",
        gems: gemsCollected,
        toPlayerId: playerId
      });
    }

    // ── RETURN GEM: gems giảm mà KHÔNG do purchase (vd: discard) ───
    if (!didPurchase) {
      const gemsReturned: { color: string; amount: number }[] = [];
      for (const color of Object.keys(newPlayer.gems) as GemColor[]) {
        const delta =
          (newPlayer.gems[color] ?? 0) - (oldPlayer.gems[color] ?? 0);
        if (delta < 0) {
          for (let i = 0; i < Math.abs(delta); i++)
            gemsReturned.push({ color, amount: 1 });
        }
      }
      if (gemsReturned.length > 0) {
        events.push({
          type: "RETURN_GEM",
          gems: gemsReturned,
          fromPlayerId: playerId
        });
      }
    }

    // ── RESERVE CARD ───────────────────────────────────────────────
    const oldReservedIds = new Set(oldPlayer.reservedCards.map(c => c.cardId));
    const newlyReserved = newPlayer.reservedCards.filter(
      c => !oldReservedIds.has(c.cardId)
    );
    for (const card of newlyReserved) {
      const gotGold =
        (newPlayer.gems["Gold"] ?? 0) > (oldPlayer.gems["Gold"] ?? 0);
      events.push({
        type: "RESERVE_CARD",
        cardId: card.cardId,
        toPlayerId: playerId,
        gotGold
      });
    }
  }

  // ── NOBLE VISIT ────────────────────────────────────────────────
  const oldNobleIds = new Set(oldState.board.nobles.map(n => n.nobleId));
  const newNobleIds = new Set(newState.board.nobles.map(n => n.nobleId));
  for (const nobleId of oldNobleIds) {
    if (!newNobleIds.has(nobleId)) {
      for (const [playerId, newPlayer] of Object.entries(newState.players)) {
        const oldPlayer = oldState.players[playerId];
        if (!oldPlayer) continue;
        const pointsDelta = newPlayer.points - oldPlayer.points;
        const cardsDelta =
          newPlayer.totalOwnedCards - oldPlayer.totalOwnedCards;
        if (pointsDelta >= 3 && cardsDelta === 0) {
          events.push({ type: "NOBLE_VISIT", nobleId, toPlayerId: playerId });
          break;
        }
      }
    }
  }

  return events;
}
