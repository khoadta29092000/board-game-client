export type GemColor = "White" | "Blue" | "Green" | "Red" | "Black" | "Gold";

export type GemSet = Record<GemColor, number>;

/* ---------------- Turn ---------------- */
export interface ITurnState {
  currentPlayer: string;
  currentPlayerIndex: number;
  phase: "WaitingForAction" | string;
  turnNumber: number;
  isLastRound: boolean;
  lastActionTime?: string;
}

export interface ICardCost {
  [color: string]: number;
}

/* ---------------- Cards ---------------- */
export interface SplendorCard {
  cardId: string;
  level: 1 | 2 | 3;
  points: number;
  bonusColor: Exclude<GemColor, "Gold">;
  cost: Partial<Record<Exclude<GemColor, "Gold">, number>>;
}

/* ---------------- Nobles ---------------- */
export interface SplendorNoble {
  nobleId: string;
  points: number;
  requirements: Partial<Record<Exclude<GemColor, "Gold">, number>>;
}

/* ---------------- Player ---------------- */
export interface PlayerState {
  playerId: string;
  name: string;
  points: number;
  gems: GemSet;
  bonuses: Omit<GemSet, "Gold">; // nobles không có Gold bonus
  reservedCards: SplendorCard[];
  totalOwnedCards: number;
}

/* ---------------- Board ---------------- */
export interface VisibleCards {
  level1: SplendorCard[];
  level2: SplendorCard[];
  level3: SplendorCard[];
}

/* ---------------- DeckTotal ---------------- */
export interface ITotalDeck {
  level1: number;
  level2: number;
  level3: number;
}

export const fakeDataCards: VisibleCards = {
  level1: [
    {
      cardId: "L1-1",
      level: 1,
      points: 0,
      bonusColor: "Green",
      cost: { Red: 3 }
    },
    {
      cardId: "L1-2",
      level: 1,
      points: 1,
      bonusColor: "Red",
      cost: { Blue: 4 }
    },
    {
      cardId: "L1-3",
      level: 1,
      points: 0,
      bonusColor: "Black",
      cost: { Blue: 1, Green: 1, Red: 3 }
    },
    {
      cardId: "L1-4",
      level: 1,
      points: 0,
      bonusColor: "Blue",
      cost: { White: 2, Green: 2, Black: 2 }
    }
  ],
  level2: [
    {
      cardId: "L2-1",
      level: 2,
      points: 1,
      bonusColor: "Red",
      cost: { Blue: 2, Green: 3, Red: 2 }
    },
    {
      cardId: "L2-2",
      level: 2,
      points: 3,
      bonusColor: "Red",
      cost: { Red: 6 }
    },
    {
      cardId: "L2-3",
      level: 2,
      points: 1,
      bonusColor: "Blue",
      cost: { Blue: 2, Green: 3, Black: 3 }
    },
    {
      cardId: "L2-4",
      level: 2,
      points: 1,
      bonusColor: "Green",
      cost: { White: 3, Green: 2, Red: 2 }
    }
  ],
  level3: [
    {
      cardId: "L3-1",
      level: 3,
      points: 4,
      bonusColor: "Black",
      cost: { Green: 6, Red: 3, Black: 3, Blue: 1 }
    },
    {
      cardId: "L3-2",
      level: 3,
      points: 5,
      bonusColor: "Blue",
      cost: { Blue: 3, Black: 7 }
    },
    {
      cardId: "L3-3",
      level: 3,
      points: 4,
      bonusColor: "White",
      cost: { Red: 7 }
    },
    {
      cardId: "L3-4",
      level: 3,
      points: 3,
      bonusColor: "Green",
      cost: { Blue: 5, Green: 3, Red: 3, Black: 3 }
    }
  ]
};

export const fakeNobles: SplendorNoble[] = [
  {
    nobleId: "b5bf0533-d961-43ee-84c6-b9acb9e8b531",
    points: 3,
    requirements: { Black: 3, Red: 3, White: 3 }
  },
  {
    nobleId: "b5bf0533-d961-43ee-84c6-b9acb9e8b532",
    points: 3,
    requirements: { Black: 3, Red: 3, White: 3 }
  },
  {
    nobleId: "b5bf0533-d961-43ee-84c6-b9acb9e8b533",
    points: 3,
    requirements: { Black: 3, Red: 3, White: 3 }
  },
  {
    nobleId: "15236959-3106-4546-b718-7355256e4201",
    points: 3,
    requirements: { White: 3, Blue: 3, Green: 3 }
  },
  {
    nobleId: "87f82569-646f-45fd-802c-842e52948f80",
    points: 3,
    requirements: { White: 3, Blue: 3, Black: 3 }
  }
];

export const cardDecks = {
  level1: 34,
  level2: 26,
  level3: 16
};

export type GemsBankType = Record<GemColor, number>;

export const initialBankGems: GemsBankType = {
  White: 7,
  Blue: 7,
  Green: 7,
  Red: 7,
  Black: 7,
  Gold: 5
};

export interface GameInfo {
  gameId: string;
  state: "InProgress" | "Completed" | string;
  currentTurn: number;
  players: string[];
  createdAt: string;
  startedAt?: string;
  completedAt?: string | null;
  winnerId?: string | null;
}

export interface BoardState {
  gemBank: GemSet;
  visibleCards: VisibleCards;
  cardDecks: {
    level1: number;
    level2: number;
    level3: number;
  };
  nobles: SplendorNoble[];
}

export interface SplendorGameState {
  info: GameInfo;
  players: Record<string, PlayerState>;
  board: BoardState;
  turn: ITurnState;
  cardDecks: ITotalDeck;
}

export type DiscardGemData = {
  currentGems: GemSet;
  excessCount: number;
};

export type SelectNobleData = {
  eligibleNobles: string[]; // list Guid
};

