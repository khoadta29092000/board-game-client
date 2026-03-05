import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type GemColor = string;

export type AnimationEventType =
  | {
      type: "COLLECT_GEM";
      gems: { color: GemColor; amount: number }[];
      toPlayerId: string;
    }
  | {
      type: "RETURN_GEM";
      gems: { color: GemColor; amount: number }[];
      fromPlayerId: string;
    }
  | {
      type: "RESERVE_CARD";
      cardId: string;
      toPlayerId: string;
      gotGold: boolean;
    }
  | {
      type: "PURCHASE_CARD";
      cardId: string;
      fromPlayerId: string;
      bonusColor: string; // ← thêm để animate đúng màu card
      gemsReturned: { color: GemColor; amount: number }[];
    }
  | { type: "NOBLE_VISIT"; nobleId: string; toPlayerId: string };

type AnimationState = { queue: AnimationEventType[]; isAnimating: boolean };

const initialState: AnimationState = { queue: [], isAnimating: false };

export const animationSlice = createSlice({
  name: "animation",
  initialState,
  reducers: {
    pushEvent: (state, action: PayloadAction<AnimationEventType>) => {
      state.queue.push(action.payload);
    },
    pushEvents: (state, action: PayloadAction<AnimationEventType[]>) => {
      state.queue.push(...action.payload);
    },
    shiftEvent: state => {
      state.queue.shift();
    },
    setIsAnimating: (state, action: PayloadAction<boolean>) => {
      state.isAnimating = action.payload;
    },
    clearQueue: state => {
      state.queue = [];
      state.isAnimating = false;
    }
  }
});

export const { pushEvent, pushEvents, shiftEvent, setIsAnimating, clearQueue } =
  animationSlice.actions;
export default animationSlice.reducer;
