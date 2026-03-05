export type TParamHistory = {
  playerId: string;
  gameName: string;
  limit: number;
};
export type TParamHistoryByGame = {
  gameName: string;
  limit: number;
  skip: number;
};

export type GetByGameId = {
  gameId: string;
};

export type GetByPlayerId = {
  playerId: string;
  gameId: string;
};

// =====================================================================
// src/types/history.ts
// TypeScript types matching C# GameHistory domain model
// =====================================================================

export type GamePlayerInfo = {
  playerId: string;
  name: string;
  rank: number;
  score: number;
  isWinner: boolean;
  stats: Record<string, unknown>; // BsonDocument — flexible per game
};

export type GameHistory = {
  id: string;
  gameId: string;
  gameName: string;
  state: string;
  winnerId: string | null;
  winnerName: string | null;
  playerOrder: string[];
  players: Record<string, GamePlayerInfo>;
  totalTurns: number;
  durationSeconds: number;
  createdAt: string;
  startedAt: string | null;
  completedAt: string;
  gameData: Record<string, unknown>; // BsonDocument — flexible per game
};

// API response wrappers
export type HistoryListResponse = {
  statusCode: number;
  message: string;
  data: GameHistory[];
  count: number;
};

export type HistoryDetailResponse = {
  statusCode: number;
  message: string;
  data: GameHistory;
};

// Splendor-specific stats shape (inside GamePlayerInfo.stats)
export type SplendorPlayerStats = {
  cardsOwned?: number;
  noblesVisited?: number;
  gemsCollected?: number;
  turnsPlayed?: number;
};
