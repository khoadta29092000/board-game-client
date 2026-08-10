/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useCallback, useRef, useState, useMemo } from "react";
import { SplendorGameState, GemColor } from "@/src/types/splendor";
import {
  getGemBankRect,
  getCardBoardRect,
  getNobleRect,
  TAKE_BUTTON_KEY
} from "@/src/redux/animation/Animationrefs";
import { useTranslations } from "next-intl";

// ─── Types ────────────────────────────────────────────────────────────────────

export type HighlightTarget =
  | { type: "GEM_BANK"; colors: string[] }
  | { type: "CARD"; cardId: string }
  | { type: "NOBLE"; nobleIds: string[] }
  | { type: "NONE" };

export type TutorialAction =
  | "COLLECT_3_DIFF"
  | "COLLECT_2_SAME"
  | "READ_ONLY"
  | "PURCHASE_CARD"
  | "RESERVE_CARD"
  | "FREE";

export interface TutorialStep {
  id: number;
  title: string;
  message: string;
  subMessage?: string;
  highlight: HighlightTarget;
  requiredAction: TutorialAction;
  allowNext: boolean;
  emoji: string;
  resolveCardId?: (state: SplendorGameState, myId: string) => string | null;
}

export type TutorialPhase = "GUIDED" | "TRANSITION" | "FREE_PLAY" | "DONE";

// ─── Step definitions ─────────────────────────────────────────────────────────
//
// id 0–8 (khớp i18n tutorial_step0 … tutorial_step8):
//   0 — Chào mừng / mục tiêu (READ_ONLY, NONE)
//   1 — Lượt & 3 hành động (READ_ONLY, NONE)
//   2 — Giới thiệu card lv1 (READ_ONLY, CARD)
//   3 — COLLECT_3_DIFF (GEM_BANK)
//   4 — COLLECT_2_SAME (GEM_BANK)
//   5 — Hiểu card khi đủ gem (READ_ONLY + resolveCardId)
//   6 — PURCHASE_CARD
//   7 — RESERVE_CARD
//   8 — Nobles (READ_ONLY)
//
// id 5–6: nextStep chỉ advance đúng khi resolveCardId có card (đủ gem).

const getSteps = (t: any): TutorialStep[] => [
  {
    id: 0,
    title: t("tutorial_step0_title"),
    message: t("tutorial_step0_message"),
    subMessage: t("tutorial_step0_subMessage"),
    highlight: { type: "NONE" },
    requiredAction: "READ_ONLY",
    allowNext: true,
    emoji: "👑"
  },

  {
    id: 1,
    title: t("tutorial_step1_title"),
    message: t("tutorial_step1_message"),
    subMessage: t("tutorial_step1_subMessage"),
    highlight: { type: "NONE" },
    requiredAction: "READ_ONLY",
    allowNext: true,
    emoji: "👑"
  },

  // ── id 2: Giới thiệu card — highlight card lv1 rẻ nhất để player nhắm tới ─
  {
    id: 2,
    title: t("tutorial_step2_title"),
    message: t("tutorial_step2_message"),
    subMessage: t("tutorial_step2_subMessage"),
    highlight: { type: "CARD", cardId: "" },
    requiredAction: "READ_ONLY",
    allowNext: true,
    emoji: "🃏",
    // Highlight card lv1 có cost ít nhất (1 màu duy nhất, cost = 3)
    resolveCardId: state => {
      const lv1 = state.board?.visibleCards?.level1 ?? [];
      // Ưu tiên card cost 1 màu duy nhất (c17, c9, c25...) — dễ mua nhất
      const simple = lv1.find(c => Object.keys(c.cost ?? {}).length === 4);
      return simple?.cardId ?? lv1[0]?.cardId ?? null;
    }
  },

  // ── id 3: Lấy 3 gem khác màu ────────────────────────────────────────────────
  {
    id: 3,
    title: t("tutorial_step3_title"),
    message: t("tutorial_step3_message"),
    subMessage: t("tutorial_step3_subMessage"),
    highlight: { type: "GEM_BANK", colors: [] },
    requiredAction: "COLLECT_3_DIFF",
    allowNext: false,
    emoji: "💎"
  },

  // ── id 4: Lấy 2 gem cùng màu ────────────────────────────────────────────────
  {
    id: 4,
    title: t("tutorial_step4_title"),
    message: t("tutorial_step4_message"),
    subMessage: t("tutorial_step4_subMessage"),
    highlight: { type: "GEM_BANK", colors: [] },
    requiredAction: "COLLECT_2_SAME",
    allowNext: false,
    emoji: "💎💎"
  },

  // ── id 5: Hiểu về card — chỉ mở khi player đủ gems mua ≥1 card ─────────────
  {
    id: 5,
    title: t("tutorial_step5_title"),
    message: t("tutorial_step5_message"),
    subMessage: t("tutorial_step5_subMessage"),
    highlight: { type: "CARD", cardId: "" },
    requiredAction: "READ_ONLY",
    allowNext: true,
    emoji: "🃏",
    // Resolve card mà player đang đủ gems để mua
    resolveCardId: (state, myId) => {
      const player = state.players?.[myId];
      if (!player) return null;
      const allCards = [
        ...(state.board?.visibleCards?.level1 ?? []),
        ...(state.board?.visibleCards?.level2 ?? [])
      ];
      for (const card of allCards) {
        let canAfford = true;
        for (const [color, cost] of Object.entries(card.cost ?? {})) {
          const c = color as GemColor;
          const have =
            ((player.gems as Record<GemColor, number>)?.[c] ?? 0) +
            (c !== "Gold"
              ? ((player.bonuses as Record<string, number>)?.[c] ?? 0)
              : 0);
          if (have < (cost as number)) {
            canAfford = false;
            break;
          }
        }
        if (canAfford) return card.cardId;
      }
      return null;
    }
  },

  // ── id 6: Mua card ───────────────────────────────────────────────────────────
  {
    id: 6,
    title: t("tutorial_step6_title"),
    message: t("tutorial_step6_message"),
    subMessage: t("tutorial_step6_subMessage"),
    highlight: { type: "CARD", cardId: "" },
    requiredAction: "PURCHASE_CARD",
    allowNext: false,
    emoji: "🛒",
    resolveCardId: (state, myId) => {
      const player = state.players?.[myId];
      if (!player) return null;
      const allCards = [
        ...(state.board?.visibleCards?.level1 ?? []),
        ...(state.board?.visibleCards?.level2 ?? [])
      ];
      for (const card of allCards) {
        let canAfford = true;
        for (const [color, cost] of Object.entries(card.cost ?? {})) {
          const c = color as GemColor;
          const have =
            ((player.gems as Record<GemColor, number>)?.[c] ?? 0) +
            (c !== "Gold"
              ? ((player.bonuses as Record<string, number>)?.[c] ?? 0)
              : 0);
          if (have < (cost as number)) {
            canAfford = false;
            break;
          }
        }
        if (canAfford) return card.cardId;
      }
      return null;
    }
  },

  // ── id 7: Reserve card ───────────────────────────────────────────────────────
  {
    id: 7,
    title: t("tutorial_step7_title"),
    message: t("tutorial_step7_message"),
    subMessage: t("tutorial_step7_subMessage"),
    highlight: { type: "CARD", cardId: "" },
    requiredAction: "RESERVE_CARD",
    allowNext: false,
    emoji: "📌",
    resolveCardId: state => {
      const lv2 = state.board?.visibleCards?.level2;
      return lv2?.[0]?.cardId ?? null;
    }
  },

  // ── id 8: Noble tiles ────────────────────────────────────────────────────────
  {
    id: 8,
    title: t("tutorial_step8_title"),
    message: t("tutorial_step8_message"),
    subMessage: t("tutorial_step8_subMessage"),
    highlight: { type: "NOBLE", nobleIds: [] },
    requiredAction: "READ_ONLY",
    allowNext: true,
    emoji: "🏛️"
  }
];

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTutorialSteps(
  gameState: SplendorGameState | null,
  myId: string
) {
  const t = useTranslations();
  const STEPS = useMemo(() => getSteps(t), [t]);

  const [stepIndex, setStepIndex] = useState(0);
  const [phase, setPhase] = useState<TutorialPhase>("GUIDED");
  const [shakeMessage, setShakeMessage] = useState(false);
  const [hintText, setHintText] = useState<string | null>(null);
  const lastActionRef = useRef<TutorialAction | null>(null);

  const totalSteps = STEPS.length;
  const currentStep = STEPS[stepIndex] ?? null;

  // ── restoreStep: gọi từ content.tsx khi nhận TutorialReady isReconnect=true ─
  // Chỉ restore GUIDED phase với stepIndex trong range — ngoài range thì reset
  const restoreStep = useCallback(
    (index: number, restoredPhase: TutorialPhase) => {
      setHintText(null);

      if (restoredPhase === "FREE_PLAY") {
        setPhase("FREE_PLAY");
        setStepIndex(STEPS.length);
        return;
      }

      if (restoredPhase === "DONE") {
        setPhase("DONE");
        setStepIndex(STEPS.length);
        return;
      }

      if (restoredPhase === "TRANSITION") {
        setPhase("TRANSITION");
        return;
      }

      const isGuided =
        restoredPhase === "GUIDED" ||
        (restoredPhase as string).toUpperCase() === "GUIDE";
      if (isGuided && index >= 0 && index < STEPS.length) {
        setStepIndex(index);
        setPhase("GUIDED");
        return;
      }

      setStepIndex(0);
      setPhase("GUIDED");
    },
    [STEPS.length]
  );

  // ── Resolve step với gameState thực tế ──────────────────────────────────────
  const resolvedStep = useCallback((): TutorialStep | null => {
    if (!currentStep || !gameState) return currentStep;
    const step = { ...currentStep, highlight: { ...currentStep.highlight } };

    // Resolve cardId
    if (currentStep.resolveCardId) {
      const cardId = currentStep.resolveCardId(gameState, myId);
      if (cardId) {
        step.highlight = {
          type: "CARD",
          cardId
        };
      }
    }

    // Resolve gem colors cho GEM_BANK steps
    if (step.highlight.type === "GEM_BANK") {
      const bank = gameState.board?.gemBank ?? {};

      if (currentStep.id === 3) {
        // id3 COLLECT_3_DIFF: highlight màu cost của card lv1 đơn giản nhất
        // để gợi ý player lấy đúng màu cần thiết
        const lv1 = gameState.board?.visibleCards?.level1 ?? [];
        const targetCard = lv1.find(
          c => Object.keys(c.cost ?? {}).length === 1
        );
        const targetColors = targetCard
          ? (Object.keys(targetCard.cost ?? {}) as GemColor[]).filter(
              c => c !== "Gold" && (bank[c] ?? 0) > 0
            )
          : [];
        // Nếu không đủ màu gợi ý → highlight tất cả màu có sẵn
        const allAvailable = (Object.keys(bank) as GemColor[]).filter(
          c => c !== "Gold" && (bank[c] ?? 0) > 0
        );
        step.highlight = {
          type: "GEM_BANK",
          colors: targetColors.length > 0 ? allAvailable : allAvailable
        };
      } else if (currentStep.id === 4) {
        // id4 COLLECT_2_SAME: highlight màu còn ≥4
        step.highlight = {
          type: "GEM_BANK",
          colors: (Object.keys(bank) as GemColor[]).filter(
            c => c !== "Gold" && (bank[c] ?? 0) >= 4
          )
        };
      }
    }

    // Resolve noble ids
    if (step.highlight.type === "NOBLE") {
      step.highlight = {
        type: "NOBLE",
        nobleIds: gameState.board?.nobles?.map(n => n.nobleId) ?? []
      };
    }

    return step;
  }, [currentStep, gameState, myId]);

  // ── getHighlightRects ────────────────────────────────────────────────────────
  const getHighlightRects = useCallback((): DOMRect[] => {
    const step = resolvedStep();
    if (!step || !gameState) return [];

    if (step.highlight.type === "GEM_BANK") {
      const targets = [...step.highlight.colors, TAKE_BUTTON_KEY];
      return targets
        .map(c => getGemBankRect(c))
        .filter((r): r is DOMRect => !!r);
    }

    if (step.highlight.type === "CARD") {
      const rect = getCardBoardRect(step.highlight.cardId);
      return rect ? [rect] : [];
    }

    if (step.highlight.type === "NOBLE") {
      return step.highlight.nobleIds
        .map(id => getNobleRect(id))
        .filter((r): r is DOMRect => !!r);
    }

    return [];
  }, [resolvedStep, gameState]);

  // ── nextStep: với id4 kiểm tra player đủ gems trước khi advance ─────────────
  const nextStep = useCallback(() => {
    const next = stepIndex + 1;
    if (next >= totalSteps) {
      setPhase("TRANSITION");
      return;
    }

    // Nếu step tiếp theo là id5 (READ_ONLY card) hoặc id6 (PURCHASE_CARD)
    // → chỉ advance nếu player đang đủ gems mua ≥1 card
    const nextStepDef = STEPS[next];
    if (
      (nextStepDef.id === 5 || nextStepDef.id === 6) &&
      nextStepDef.resolveCardId
    ) {
      if (gameState) {
        const cardId = nextStepDef.resolveCardId(gameState, myId);
        if (!cardId) {
          // Chưa đủ gems → skip id5 và id6, tiến thẳng tới id7 (RESERVE)
          // nhưng vẫn cho player biết bằng hint
          setHintText(null);
          setStepIndex(next); // vẫn vào id5 nhưng resolveCardId sẽ trả null
          return;
        }
      }
    }

    setStepIndex(next);
    setHintText(null);
  }, [stepIndex, totalSteps, STEPS, gameState, myId]);

  // ── onActionSuccess ──────────────────────────────────────────────────────────
  const onActionSuccess = useCallback(
    (action: TutorialAction) => {
      if (phase !== "GUIDED") return;
      if (!currentStep) return;
      if (
        currentStep.requiredAction === action ||
        currentStep.requiredAction === "READ_ONLY"
      ) {
        lastActionRef.current = action;

        // Sau COLLECT_2_SAME (id4): kiểm tra player đủ gems mua card chưa
        // Nếu đủ → tiến tới id4, nếu chưa → vẫn tiến (sẽ check lại ở nextStep)
        nextStep();
      }
    },
    [phase, currentStep, nextStep]
  );

  // ── onActionError ────────────────────────────────────────────────────────────
  const onActionError = useCallback((message?: string) => {
    setShakeMessage(true);
    setHintText(message ?? "Hãy làm theo hướng dẫn nhé!");
    setTimeout(() => setShakeMessage(false), 600);
  }, []);

  // ── validateAction ───────────────────────────────────────────────────────────
  const validateAction = useCallback(
    (action: TutorialAction): boolean => {
      if (!currentStep) return true;
      if (phase !== "GUIDED") return true;
      const required = currentStep.requiredAction;
      if (required === "FREE" || required === "READ_ONLY") return true;
      return action === required;
    },
    [currentStep, phase]
  );

  const startFreePlay = useCallback(() => {
    setPhase("FREE_PLAY");
    setHintText(null);
    setStepIndex(totalSteps);
  }, [totalSteps]);
  const resetToFreePlay = useCallback(() => {
    setPhase("FREE_PLAY");
    setHintText(null);
  }, []);

  const completeTutorial = useCallback(() => {
    setPhase("DONE");
  }, []);

  return {
    phase,
    stepIndex,
    totalSteps,
    currentStep: resolvedStep(),
    getHighlightRects,
    nextStep,
    validateAction,
    onActionSuccess,
    onActionError,
    startFreePlay,
    resetToFreePlay,
    completeTutorial,
    restoreStep,
    shakeMessage,
    hintText,
    isGuided: phase === "GUIDED",
    isFreePlay: phase === "FREE_PLAY",
    isTransition: phase === "TRANSITION"
  };
}
