// =====================================================================
// src/store/animation/animationRefs.ts
// DOM refs không serialize được → lưu ngoài Redux dưới dạng singleton
// =====================================================================

// Dùng plain object thay vì RefObject để tránh type conflict React 19
type DivRef = { current: HTMLDivElement | null };
type RefMap = Record<string, DivRef>;
type NestedRefMap = Record<string, RefMap>;

const refs = {
  gemBank: {} as RefMap,
  gemPlayer: {} as NestedRefMap,
  cardBoard: {} as RefMap,
  cardReserved: {} as RefMap,
  noble: {} as RefMap,
  noblePlayer: {} as RefMap,
  cardSlot: {} as RefMap
};

// ─── Register helpers ──────────────────────────────────────────────────────────

export function registerGemBank(color: string, el: HTMLDivElement | null) {
  if (!refs.gemBank[color]) refs.gemBank[color] = { current: null };
  refs.gemBank[color].current = el;
}

export function registerGemPlayer(
  playerId: string,
  color: string,
  el: HTMLDivElement | null
) {
  if (!refs.gemPlayer[playerId]) refs.gemPlayer[playerId] = {};
  if (!refs.gemPlayer[playerId][color])
    refs.gemPlayer[playerId][color] = { current: null };
  refs.gemPlayer[playerId][color].current = el;
}

export function registerCardBoard(cardId: string, el: HTMLDivElement | null) {
  if (!refs.cardBoard[cardId]) refs.cardBoard[cardId] = { current: null };
  refs.cardBoard[cardId].current = el;
}

export function registerCardReserved(
  cardId: string,
  el: HTMLDivElement | null
) {
  if (!refs.cardReserved[cardId]) refs.cardReserved[cardId] = { current: null };
  refs.cardReserved[cardId].current = el;
}

export function registerNoble(nobleId: string, el: HTMLDivElement | null) {
  if (!refs.noble[nobleId]) refs.noble[nobleId] = { current: null };
  refs.noble[nobleId].current = el;
}

export function registerNoblePlayer(
  playerId: string,
  el: HTMLDivElement | null
) {
  if (!refs.noblePlayer[playerId])
    refs.noblePlayer[playerId] = { current: null };
  refs.noblePlayer[playerId].current = el;
}

export function registerCardSlot(playerId: string, el: HTMLDivElement | null) {
  if (!refs.cardSlot[playerId]) refs.cardSlot[playerId] = { current: null };
  refs.cardSlot[playerId].current = el;
}



// ─── Read helpers ──────────────────────────────────────────────────────────────

export function getGemBankRect(color: string): DOMRect | null {
  return refs.gemBank[color]?.current?.getBoundingClientRect() ?? null;
}

export function getGemPlayerRect(
  playerId: string,
  color: string
): DOMRect | null {
  return (
    refs.gemPlayer[playerId]?.[color]?.current?.getBoundingClientRect() ?? null
  );
}

export function getCardBoardRect(cardId: string): DOMRect | null {
  return refs.cardBoard[cardId]?.current?.getBoundingClientRect() ?? null;
}

export function getCardReservedRect(cardId: string): DOMRect | null {
  return refs.cardReserved[cardId]?.current?.getBoundingClientRect() ?? null;
}

export function getNobleRect(nobleId: string): DOMRect | null {
  return refs.noble[nobleId]?.current?.getBoundingClientRect() ?? null;
}

export function getNoblePlayerRect(playerId: string): DOMRect | null {
  return refs.noblePlayer[playerId]?.current?.getBoundingClientRect() ?? null;
}

export function getCardSlotRect(playerId: string): DOMRect | null {
  return refs.cardSlot[playerId]?.current?.getBoundingClientRect() ?? null;
}
