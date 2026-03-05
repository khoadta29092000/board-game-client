// =====================================================================
// src/store/animation/animationSelectors.ts
// Selectors cho animation state — giống pattern selectors.ts của project
// =====================================================================
import { useSelector } from "react-redux";
import { AnimationEventType } from "./slice";

type AnimationSelector = {
  animation: {
    queue: AnimationEventType[];
    isAnimating: boolean;
  };
};

export const useAnimationQueue = () =>
  useSelector((state: AnimationSelector) => state.animation.queue);

export const useCurrentAnimationEvent = () =>
  useSelector((state: AnimationSelector) => state.animation.queue[0] ?? null);

export const useIsAnimating = () =>
  useSelector((state: AnimationSelector) => state.animation.isAnimating);
