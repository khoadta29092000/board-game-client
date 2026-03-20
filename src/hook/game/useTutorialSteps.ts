"use client";
import { useCallback, useRef, useState } from "react";
import { SplendorGameState, GemColor } from "@/src/types/splendor";
import {
  getGemBankRect,
  getCardBoardRect,
  getNobleRect,
  TAKE_BUTTON_KEY
} from "@/src/redux/animation/Animationrefs";

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
// Luồng mới:
//   id 0 — Chào mừng: mục tiêu game (READ_ONLY)
//   id 1 — Giới thiệu card lv1: highlight card rẻ nhất, giải thích cost/bonus (READ_ONLY)
//   id 2 — Lấy 3 gem KHÁC màu: highlight đúng màu cost của card đó (COLLECT_3_DIFF)
//   id 3 — Lấy 2 gem CÙNG màu: highlight màu còn ≥4 (COLLECT_2_SAME)
//   id 4 — Hiểu về card: mở KHI player đủ gems để mua 1 card (READ_ONLY + allowNext)
//   id 5 — Mua card: mở ngay sau id4 (PURCHASE_CARD)
//   id 6 — Reserve card (RESERVE_CARD)
//   id 7 — Noble tiles (READ_ONLY)
//
// id 4+5 chỉ unlock khi resolveCardId trả về non-null (player đủ gems)

const STEPS: TutorialStep[] = [
  // ── id 0: Mục tiêu game ────────────────────────────────────────────────────
  {
    id: 0,
    title: "Chào mừng đến Splendor!",
    message: "Mục tiêu: gom đủ 15 điểm trước đối thủ để chiến thắng.",
    subMessage: "Điểm đến từ card phát triển và Noble tiles.",
    highlight: { type: "NONE" },
    requiredAction: "READ_ONLY",
    allowNext: true,
    emoji: "👑"
  },

  // ── id 1: Giới thiệu card — highlight card lv1 rẻ nhất để player nhắm tới ─
  {
    id: 1,
    title: "Nhắm tới Card này!",
    message: "hãy để ý phần cost bên dưới cần đủ để có thể mua đc card này",
    subMessage:
      "Lưu ý: mỗi lượt chỉ được tối đa 10 gem — cuối lượt phải bỏ bớt nếu vượt quá.",
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

  // ── id 2: Lấy 3 gem khác màu — highlight đúng màu cost của card id1 ────────
  {
    id: 2,
    title: "Lấy 3 gem khác màu",
    message:
      "Mỗi lượt bạn có thể lấy tối đa 3 gem khác màu từ ngân hàng, nhưng bạn đang hướng tới Card mua đầu tiên bởi vậy hãy lấy Blue, Red, Purple.",
    subMessage:
      "Hãy chọn 3 gem khác màu — ưu tiên màu cost của card vừa xem để tiến gần hơn!",
    highlight: { type: "GEM_BANK", colors: [] },
    requiredAction: "COLLECT_3_DIFF",
    allowNext: false,
    emoji: "💎"
  },

  // ── id 3: Lấy 2 gem cùng màu ────────────────────────────────────────────────
  {
    id: 3,
    title: "Lấy 2 gem cùng màu",
    message:
      "Nếu ngân hàng còn ≥4 gem cùng màu, bạn có thể lấy 2 cùng lúc, nhưng bạn đang hướng tới Card mua đầu tiên bởi vậy hãy lấy 2 Green",
    subMessage:
      "Hãy chọn 1 màu có số ≥4 và lấy 2 gem! Nhớ: tổng gem không được vượt 10.",
    highlight: { type: "GEM_BANK", colors: [] },
    requiredAction: "COLLECT_2_SAME",
    allowNext: false,
    emoji: "💎💎"
  },

  // ── id 4: Hiểu về card — chỉ mở khi player đủ gems mua ≥1 card ─────────────
  {
    id: 4,
    title: "Hiểu về Card phát triển",
    message:
      "Card có màu bonus (góc phải) và cost (góc dưới) và point nếu có ở góc trên bên trái. Mua card → nhận bonus mãi mãi để có thể thay thế gems khi mua card.",
    subMessage: "Bonus tính như gem khi mua card tiếp theo!",
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

  // ── id 5: Mua card ───────────────────────────────────────────────────────────
  {
    id: 5,
    title: "Mua card!",
    message:
      "Bạn đã có đủ gem để mua card này. Nhấn vào card rồi chọn Purchase!",
    subMessage: "Trả gem → nhận bonus màu đó vĩnh viễn.",
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

  // ── id 6: Reserve card ───────────────────────────────────────────────────────
  {
    id: 6,
    title: "Reserve card",
    message:
      "Reserve để giữ chỗ card xịn — nhận thêm 1 gold gem 🟡(có tác dụng thay thế được tất cả các gems)",
    subMessage: "Nhấn vào card lv2 đắt tiền rồi chọn Reserve!",
    highlight: { type: "CARD", cardId: "" },
    requiredAction: "RESERVE_CARD",
    allowNext: false,
    emoji: "📌",
    resolveCardId: state => {
      const lv2 = state.board?.visibleCards?.level2;
      return lv2?.[0]?.cardId ?? null;
    }
  },

  // ── id 7: Noble tiles ────────────────────────────────────────────────────────
  {
    id: 7,
    title: "Noble tiles",
    message: "Gom đủ bonus theo yêu cầu → Noble tự đến, +3 điểm!",
    subMessage: "Không cần làm gì thêm — Noble tự ghé thăm sau lượt mua card.",
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
      console.log(index, restoredPhase);
      if (index === 10 && restoredPhase == "FREE_PLAY") {
        setStepIndex(STEPS.length);
        setPhase("GUIDED");
        setHintText(null);
        return;
      }
      if (restoredPhase === "GUIDED" && index >= 0 && index < STEPS.length) {
        setStepIndex(index);
        setPhase("GUIDED");
      } else {
        // index >= totalSteps hoặc phase không phải GUIDED → reset về đầu
        setStepIndex(0);
        setPhase("GUIDED");
      }
      setHintText(null);
    },
    []
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

      if (currentStep.id === 2) {
        // id2 COLLECT_3_DIFF: highlight màu cost của card lv1 đơn giản nhất
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
      } else if (currentStep.id === 3) {
        // id3 COLLECT_2_SAME: highlight màu còn ≥4
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

    // Nếu step tiếp theo là id4 (READ_ONLY card) hoặc id5 (PURCHASE_CARD)
    // → chỉ advance nếu player đang đủ gems mua ≥1 card
    const nextStepDef = STEPS[next];
    if (
      (nextStepDef.id === 4 || nextStepDef.id === 5) &&
      nextStepDef.resolveCardId
    ) {
      if (gameState) {
        const cardId = nextStepDef.resolveCardId(gameState, myId);
        if (!cardId) {
          // Chưa đủ gems → skip id4 và id5, tiến thẳng tới id6 (RESERVE)
          // nhưng vẫn cho player biết bằng hint
          setHintText(null);
          setStepIndex(next); // vẫn vào id4 nhưng resolveCardId sẽ trả null
          return;
        }
      }
    }

    setStepIndex(next);
    setHintText(null);
  }, [stepIndex, totalSteps, gameState, myId]);

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

        // Sau COLLECT_2_SAME (id3): kiểm tra player đủ gems mua card chưa
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
