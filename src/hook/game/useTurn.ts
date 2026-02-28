import { useMemo } from "react";

/* ---------------- Types ---------------- */
export type Id = string;

export interface TurnState {
  currentPlayer: Id;
  currentPlayerIndex: number;
  phase: string;
  turnNumber: number;
  isLastRound: boolean;
  lastActionTime?: string;
}

/* ---------------- Hook ---------------- */
export function useTurn(turn?: TurnState | null, userId?: Id | null) {
  const isMyTurn = useMemo(() => {
    if (!turn || !userId) return false;

    return (
      turn.currentPlayer?.toLowerCase() === userId.toLowerCase() &&
      turn.phase === "WaitingForAction"
    );
  }, [turn, userId]);

  return { isMyTurn };
}

export default useTurn;
