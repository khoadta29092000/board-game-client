"use client";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from "react";
import { useRouter } from "next/navigation";
import { useSignalR } from "@/src/components/signalR/signalRProvider";
import { toast } from "sonner";
import { useAuth } from "@/src/redux/global/selectors";
import BoardContainer from "@/src/components/splendor/gameBoard/boardContainer";
import {
  DiscardGemData,
  GemSet,
  SelectNobleData,
  SplendorGameState,
  GemColor
} from "@/src/types/splendor";
import { useDisclosure } from "@/src/hook/common/useDisclosure";
import { ModalSelectNoble } from "@/src/components/splendor/gameBoard/modal/modalSelectNoble";
import PlayerInfo from "@/src/components/splendor/player/playerInfo";
import { ModalDiscardGems } from "@/src/components/splendor/gameBoard/modal/modalDiscardGems";
import { ScaleWrapper, useCanvas } from "@/src/components/common/scaleWrapper";
import { diffGameState } from "@/src/hook/game/useGameDiff";
import { pushEvents } from "@/src/redux/animation/slice";
import { useDispatch } from "react-redux";
import { preloadSounds } from "@/src/sounds.ts/splendorSounds";
import AnimationLayer from "@/src/components/common/AnimationLayer";
import { useTutorialSteps } from "@/src/hook/game/useTutorialSteps";
import TutorialOverlay from "@/src/components/splendor/gameBoard/TutorialOverlay";
import { LoadingOverlay } from "@/src/components/common/loading";
import useSkipTurn from "@/src/hook/game/useSkipTurn";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── Bot player id phải match với BotService.BOT_PLAYER_ID ───────────────────
const BOT_PLAYER_ID = "BOT_TUTORIAL";
const BOT_DISPLAY_NAME = "🤖 Tutorial Bot";

function TutorialContent() {
  const router = useRouter();
  const dispatch = useDispatch();
  const profile = useAuth();
  const userId = profile?.Id ?? "";
  const { isConnected, invoke, on, off } = useSignalR();
  const [isLoading, setIsLoading] = useState(true);
  const [gameState, setGameState] = useState<SplendorGameState | null>(null);
  const prevGameStateRef = useRef<SplendorGameState | null>(null);
  const lastTurnRef = useRef<string | null>(null);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [botThinkingMsg, setBotThinkingMsg] = useState("Bot đang suy nghĩ...");
  const [tutorialWon, setTutorialWon] = useState(false);
  const [showBotWon, setShowBotWon] = useState(false);

  const { isOpen, onClose, onOpen } = useDisclosure();
  const [dataDiscardGem, setDataDiscardGem] = useState<DiscardGemData | null>(
    null
  );
  const [dataSelectNoble, setDataSelectNoble] =
    useState<SelectNobleData | null>(null);
  const {
    isOpen: isOpenNoble,
    onClose: onCloseNoble,
    onOpen: onOpenNoble
  } = useDisclosure();
  const {
    isOpen: isOpenSkip,
    onClose: onCloseSkip,
    onOpen: onOpenSkip
  } = useDisclosure();
  const { isDesktop, isTablet, vw, vh, baseH } = useCanvas();
  const screenRatio = vw / vh;
  const isLandscape = isDesktop || (isTablet && screenRatio > 1.0);
  const playerCount = 2; // tutorial luôn 2 người

  // ─── Tutorial Steps ───────────────────────────────────────────────────────
  const {
    phase,
    stepIndex,
    totalSteps,
    currentStep,
    getHighlightRects,
    nextStep,
    onActionSuccess,
    onActionError,
    startFreePlay: startFreePlayBase,
    resetToFreePlay,
    completeTutorial,
    restoreStep,
    shakeMessage,
    hintText,
    isGuided,
    isFreePlay
  } = useTutorialSteps(gameState, userId);
  const { isDeadlocked } = useSkipTurn();
  // Wrap startFreePlay: xóa step trên Redis ngay lập tức thay vì phụ thuộc useEffect
  const startFreePlay = useCallback(() => {
    startFreePlayBase();
    if (isConnected && userId) {
      saveTutorialStep(10, "FREE_PLAY");
    }
  }, [startFreePlayBase, isConnected, userId, invoke]);
  // isMyTurn: trong guided phase luôn cho phép action (validate thủ công)
  // trong free play: check turn bình thường
  const isMyTurn = isFreePlay
    ? gameState?.turn?.currentPlayer === userId
    : isGuided
      ? gameState?.turn?.currentPlayer === userId
      : false;

  // Highlight rects — recalculate mỗi render
  const [highlightRects, setHighlightRects] = useState<DOMRect[]>([]);
  const rafHighlightRef = useRef<number>(0);

  // Tính rects FRESH mỗi khi step/gameState thay đổi + khi resize
  // useLayoutEffect để lấy sau khi DOM render xong, tránh stale
  useLayoutEffect(() => {
    const recalc = () => {
      cancelAnimationFrame(rafHighlightRef.current);
      rafHighlightRef.current = requestAnimationFrame(() => {
        setHighlightRects(getHighlightRects());
      });
    };

    recalc();

    // Lắng nghe resize → recalc để rects luôn khớp với layout hiện tại
    const ro = new ResizeObserver(recalc);
    ro.observe(document.documentElement);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(rafHighlightRef.current);
    };
  }, [getHighlightRects, stepIndex]);
  // ─── Preload sounds ───────────────────────────────────────────────────────
  useEffect(() => {
    const handle = () => {
      preloadSounds();
      window.removeEventListener("click", handle);
    };
    window.addEventListener("click", handle);
    return () => window.removeEventListener("click", handle);
  }, []);

  // ─── Tutorial specific events ─────────────────────────────────────────────

  // Helper: lưu step lên server mỗi khi stepIndex / phase thay đổi
  const saveTutorialStep = useCallback(
    (index: number, currentPhase: string) => {
      if (!isConnected) return;
      invoke("SaveTutorialStep", userId, index, currentPhase).catch(() => {});
    },
    [isConnected, invoke, userId]
  );
  const isRestoredRef = useRef(false);
  // Handler cho TutorialReady — gộp TutorialStarted + TutorialReconnected
  const handleTutorialReady = useCallback(
    (data: {
      stepIndex: number;
      phase: string;
      isReconnect: boolean;
      message: string;
    }) => {
      setIsLoading(false);
      isRestoredRef.current = true;
      if (data.isReconnect) {
        restoreStep(
          data.stepIndex,
          data.phase as "GUIDED" | "TRANSITION" | "FREE_PLAY" | "DONE"
        );
      }

      // isReconnect=false → fresh start, useTutorialSteps đã init ở 0:GUIDED
    },
    [restoreStep]
  );

  // ─── Start tutorial khi connected ────────────────────────────────────────
  // Đăng ký TutorialReady TRƯỚC khi invoke để không miss event
  useEffect(() => {
    if (!isConnected || !userId) return;

    const start = async () => {
      try {
        await invoke("StartTutorial", profile?.Id, profile?.Name ?? "Player");
      } catch (e) {
        setIsLoading(false);
        console.error("StartTutorial failed", e);
        toast.error("Không thể bắt đầu tutorial");
      }
    };
    start();
  }, [isConnected, userId, handleTutorialReady, on, off, invoke]);

  useEffect(() => {
    if (!userId) return;
    if (!isRestoredRef.current) return;
    if (phase === "GUIDED" && stepIndex < totalSteps) {
      saveTutorialStep(stepIndex, phase);
    }
  }, [stepIndex, phase, totalSteps, userId, saveTutorialStep]);
  // ─── Game state handlers ──────────────────────────────────────────────────

  const handleGameStateUpdated = useCallback(
    (data: SplendorGameState) => {
      if (!data) return;
      const fp = `${data.turn?.turnNumber ?? ""}-${data.turn?.lastActionTime ?? ""}`;
      if (lastTurnRef.current === fp) return;
      lastTurnRef.current = fp;

      const prev = prevGameStateRef.current;
      if (prev) {
        const events = diffGameState(prev, data);
        if (events.length > 0) {
          dispatch(pushEvents(events));
          const totalDuration = events.reduce((acc, e) => {
            if (e.type === "COLLECT_GEM") return acc + e.gems.length * 90 + 600;
            if (e.type === "RETURN_GEM") return acc + e.gems.length * 70 + 600;
            if (e.type === "PURCHASE_CARD") return acc + 750;
            if (e.type === "RESERVE_CARD") return acc + 700;
            if (e.type === "NOBLE_VISIT") return acc + 900;
            return acc + 700;
          }, 0);
          setTimeout(() => {
            prevGameStateRef.current = data;
            setGameState(data);
          }, totalDuration);
          return;
        }
      }
      prevGameStateRef.current = data;
      setGameState(data);
    },
    [dispatch]
  );

  const handleBotThinking = useCallback((data: { message: string }) => {
    setIsBotThinking(true);
    setBotThinkingMsg(data?.message ?? "🤖 Bot đang suy nghĩ...");
  }, []);

  const handleYourTurn = useCallback(() => {
    setIsBotThinking(false);
    const state = prevGameStateRef.current;
    if (state && isDeadlocked(state, userId)) {
      onOpenSkip();
    }
  }, [isDeadlocked, userId]);

  const handleConfirmPassTurn = useCallback(async () => {
    try {
      await invoke("PassTurn", userId);
      onCloseSkip();
    } catch (e) {
      console.error("[Tutorial] PassTurn failed", e);
    }
  }, [invoke, userId]);

  const handleTutorialCompleted = useCallback(
    (data: { winner: string; message: string }) => {
      setIsBotThinking(false);
      setTutorialWon(true);
      completeTutorial();
    },
    [completeTutorial]
  );

  const handleTutorialFailed = useCallback((_data: { message: string }) => {
    setIsBotThinking(false);
    setShowBotWon(true); // hiện modal overlay Bot Won
  }, []);

  const handleRetry = useCallback(async () => {
    setShowBotWon(false);
    setGameState(null);
    prevGameStateRef.current = null;
    lastTurnRef.current = null;
    resetToFreePlay(); // giữ phase FREE_PLAY, Phase 1 đã xong
  }, [resetToFreePlay]);

  const handleNeedDiscard = useCallback(
    (data: DiscardGemData) => {
      if (!data) return;
      setDataDiscardGem(data);
      onOpen();
    },
    [onOpen]
  );

  const handleNeedSelectNoble = useCallback(
    (data: SelectNobleData) => {
      if (!data) return;
      setDataSelectNoble(data);
      onOpenNoble();
    },
    [onOpenNoble]
  );

  // ─── SignalR subscriptions ────────────────────────────────────────────────
  useEffect(() => {
    if (!isConnected) return;
    on("GameStateUpdated", handleGameStateUpdated);
    on("BotThinking", handleBotThinking);
    on("YourTurn", handleYourTurn);
    on("TutorialCompleted", handleTutorialCompleted);
    on("TutorialFailed", handleTutorialFailed);
    on("NeedsDiscard", handleNeedDiscard);
    on("NeedSelectNoble", handleNeedSelectNoble);
    on("TutorialReady", handleTutorialReady);
    return () => {
      off("GameStateUpdated", handleGameStateUpdated);
      off("BotThinking", handleBotThinking);
      off("YourTurn", handleYourTurn);
      off("TutorialCompleted", handleTutorialCompleted);
      off("TutorialFailed", handleTutorialFailed);
      off("NeedsDiscard", handleNeedDiscard);
      off("NeedSelectNoble", handleNeedSelectNoble);
      off("TutorialReady", handleTutorialReady);
    };
  }, [
    isConnected,
    on,
    off,
    handleGameStateUpdated,
    handleBotThinking,
    handleYourTurn,
    handleTutorialCompleted,
    handleTutorialFailed,
    handleNeedDiscard,
    handleNeedSelectNoble
  ]);

  // ─── Auto-save step khi stepIndex / phase thay đổi ──────────────────────
  // Chỉ lưu khi GUIDED + trong range — FREE_PLAY được xóa trực tiếp trong startFreePlay

  // ─── Actions ──────────────────────────────────────────────────────────────
  const handleCollectGems = useCallback(
    async (gems: Record<GemColor, number>) => {
      if (!isConnected) return;

      // Validate step
      if (isGuided) {
        const totalSelected = Object.values(gems).reduce((a, b) => a + b, 0);
        const distinctColors = Object.values(gems).filter(v => v > 0).length;
        const maxSame = Math.max(...Object.values(gems));

        const stepReq = currentStep?.requiredAction;
        const stepId = currentStep?.id;

        if (stepId === 1) {
          // id1 loop: cho phép cả 3-diff lẫn 2-same
          const is3Diff = totalSelected === 3 && distinctColors === 3;
          const is2Same = totalSelected === 2 && maxSame === 2;
          if (!is3Diff && !is2Same) {
            onActionError(
              "Hãy lấy 3 gem khác màu hoặc 2 gem cùng màu (màu có ≥4)!"
            );
            return;
          }
        } else if (stepReq === "COLLECT_3_DIFF") {
          if (totalSelected !== 3 || distinctColors !== 3) {
            onActionError("Hãy chọn đúng 3 gem khác màu!");
            return;
          }
        } else if (stepReq === "COLLECT_2_SAME") {
          if (totalSelected !== 2 || maxSame !== 2) {
            onActionError("Hãy chọn 2 gem cùng màu (màu có ≥4 trên board)!");
            return;
          }
        } else if (stepReq !== "FREE" && stepReq !== undefined) {
          onActionError("Bước này chưa yêu cầu lấy gem!");
          return;
        }
      }

      try {
        const r = await invoke("CollectGems", userId, gems);
        if (!r?.success) {
          onActionError(r?.message ?? "Lấy gem thất bại");
        } else {
          if (isGuided) {
            onActionSuccess(
              Object.values(gems).filter(v => v > 0).length === 1 &&
                Math.max(...Object.values(gems)) === 2
                ? "COLLECT_2_SAME"
                : "COLLECT_3_DIFF"
            );
          }
        }
      } catch {
        toast.error("Lấy gem thất bại");
      }
    },
    [
      isConnected,
      isGuided,
      currentStep,
      invoke,
      userId,
      onActionSuccess,
      onActionError
    ]
  );

  const handlePurchaseCard = useCallback(
    async (cardId: string) => {
      if (!isConnected) return;

      if (
        isGuided &&
        currentStep?.requiredAction !== "PURCHASE_CARD" &&
        currentStep?.id !== 5
      ) {
        onActionError("Bước này chưa yêu cầu mua card!");
        return;
      }

      try {
        const r = await invoke("PurchaseCard", userId, cardId);
        if (!r?.success) {
          onActionError(r?.message ?? "Không đủ gem để mua card này");
          toast.error("Không mua card được", { description: "Không đủ gem!" });
        } else {
          if (isGuided) {
            onActionSuccess("PURCHASE_CARD");
          }
        }
      } catch {
        toast.error("Mua card thất bại");
      }
    },
    [
      isConnected,
      isGuided,
      currentStep,
      invoke,
      userId,
      onActionSuccess,
      onActionError
    ]
  );

  const handleReserveCard = useCallback(
    async (cardId?: string, level?: number) => {
      if (!isConnected) return;

      if (isGuided && currentStep?.requiredAction !== "RESERVE_CARD") {
        onActionError("Bước này chưa yêu cầu reserve card!");
        return;
      }

      try {
        const r = await invoke(
          "ReserveCard",
          userId,
          cardId ?? null,
          level ?? null
        );
        if (!r?.success) {
          onActionError(r?.message ?? "Reserve card thất bại");
          toast.error("Không reverse card được", {
            description:
              "hiện tại không thể reverse card này vì trên bạn chỉ sỡ hưu được dưới 3"
          });
        } else {
          if (isGuided) {
            onActionSuccess("RESERVE_CARD");
          }
        }
      } catch {
        toast.error("Reserve card thất bại");
      }
    },
    [
      isConnected,
      isGuided,
      currentStep,
      invoke,
      userId,
      onActionSuccess,
      onActionError
    ]
  );

  const submitDiscardGem = useCallback(
    async (toDiscard: GemSet) => {
      if (!isConnected) return;
      try {
        await invoke("DiscardGems", userId, toDiscard);
      } catch {
        toast.error("Discard gem thất bại");
      }
    },
    [isConnected, invoke, userId]
  );

  const submitSelectNoble = useCallback(
    async (nobleId: string) => {
      if (!isConnected) return;
      try {
        const r = await invoke("SelectNoble", userId, nobleId);
        if (r?.success) {
          setDataSelectNoble(null);
          onCloseNoble();
        }
      } catch {
        toast.error("Select noble thất bại");
      }
    },
    [isConnected, invoke, userId, onCloseNoble]
  );

  // ─── Tutorial Win Screen ──────────────────────────────────────────────────
  if (tutorialWon) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 2000,
          background:
            "radial-gradient(ellipse at center, #1a0a3e 0%, #0a0a1a 70%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          padding: 24
        }}
      >
        {/* Confetti-like dots */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: [
                "#facc15",
                "#4ade80",
                "#f472b6",
                "#60a5fa",
                "#fb923c"
              ][i % 5],
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.6,
              animation: `tutorialPulse ${1 + Math.random() * 2}s ease-in-out ${Math.random()}s infinite`
            }}
          />
        ))}

        <div style={{ textAlign: "center", zIndex: 1 }}>
          <div style={{ fontSize: 80 }}>🏆</div>
          <div
            style={{
              color: "#facc15",
              fontWeight: 900,
              fontSize: 36,
              marginTop: 12,
              marginBottom: 8,
              textShadow: "0 0 40px rgba(250,204,21,0.6)"
            }}
          >
            Bạn đã thắng!
          </div>
          <div style={{ color: "#86efac", fontSize: 16, marginBottom: 4 }}>
            Tutorial hoàn thành xuất sắc 🎉
          </div>
          <div style={{ color: "#6b7280", fontSize: 14, marginBottom: 32 }}>
            Bạn đã hiểu cách chơi Splendor rồi!
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap"
            }}
          >
            <button
              onClick={() => router.push("/lobby")}
              style={{
                padding: "14px 32px",
                background: "linear-gradient(135deg, #d97706, #f59e0b)",
                color: "white",
                border: "none",
                borderRadius: 12,
                fontWeight: 800,
                fontSize: 15,
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(245,158,11,0.4)"
              }}
            >
              ⚔️ Thử thách bạn bè!
            </button>
            <button
              onClick={() => {
                setTutorialWon(false);
                setGameState(null);
              }}
              style={{
                padding: "14px 32px",
                background: "rgba(55,65,81,0.8)",
                color: "white",
                border: "1px solid #374151",
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 15,
                cursor: "pointer"
              }}
            >
              🔄 Chơi lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingOverlay message="Creating Game..." />;
  }

  return (
    <>
      <AnimationLayer />

      {/* Tutorial Overlay */}
      <TutorialOverlay
        saveTutorialStep={saveTutorialStep}
        step={currentStep}
        phase={phase}
        stepIndex={stepIndex}
        totalSteps={totalSteps}
        highlightRects={highlightRects}
        onNext={nextStep}
        onSkip={startFreePlay}
        onStartFreePlay={startFreePlay}
        shakeMessage={shakeMessage}
        hintText={hintText}
        isBotThinking={isBotThinking}
        botThinkingMessage={botThinkingMsg}
        showBotWon={showBotWon}
        onRetry={handleRetry}
      />

      {/* Game UI — y chang game thường */}
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: isLandscape ? "row" : "column",
          background: "linear-gradient(180deg, #2e1065 0%, #111827 100%)",
          overflow: "hidden"
        }}
      >
        {/* Modals */}
        {isOpen && dataDiscardGem && (
          <ModalDiscardGems
            isOpen={isOpen}
            onClose={() => {
              setDataDiscardGem(null);
              onClose();
            }}
            currentGems={dataDiscardGem.currentGems}
            excessCount={dataDiscardGem.excessCount}
            onConfirm={toDiscard => submitDiscardGem(toDiscard)}
          />
        )}
        {isOpenNoble && dataSelectNoble && (
          <ModalSelectNoble
            isOpen={isOpenNoble}
            nobles={dataSelectNoble.eligibleNobles}
            gameNobles={gameState?.board?.nobles}
            onConfirm={nobleId => submitSelectNoble(nobleId)}
            onClose={() => {}}
          />
        )}
        {isOpenSkip && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 11000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(4px)"
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #1e1b4b, #312e81)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 16,
                padding: "28px 32px",
                maxWidth: 360,
                textAlign: "center",
                boxShadow: "0 25px 50px rgba(0,0,0,0.5)"
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 12 }}>⏭️</div>
              <h3
                style={{
                  color: "#fff",
                  fontSize: 18,
                  fontWeight: 700,
                  marginBottom: 8
                }}
              >
                Không còn nước đi!
              </h3>
              <p
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 14,
                  marginBottom: 24,
                  lineHeight: 1.5
                }}
              >
                Không thể lấy gem, mua card hay reserve lúc này. Bỏ lượt để chờ
                tình huống thay đổi.
              </p>
              <button
                onClick={handleConfirmPassTurn}
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  padding: "12px 28px",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                  width: "100%"
                }}
              >
                Bỏ lượt →
              </button>
            </div>
          </div>
        )}

        {/* Player info */}
        {gameState && (
          <PlayerInfo
            currentStep={currentStep}
            gameState={gameState}
            myId={userId}
            isMyTurn={isMyTurn}
            isLandscape={isLandscape}
            playerCount={playerCount}
            baseH={baseH}
            onPurchase={handlePurchaseCard}
          />
        )}
        {/* Board */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            minWidth: 0,
            overflow: "hidden",
            padding: 8
          }}
        >
          <BoardContainer
            currentStep={currentStep}
            isConnected={isConnected}
            gameState={gameState}
            gameId={`TUTORIAL_${userId}`}
            onCollectGem={handleCollectGems}
            onPurchase={handlePurchaseCard}
            onReserve={handleReserveCard}
            onReserveFromDeck={level => handleReserveCard(undefined, level)}
            isMyTurn={isMyTurn}
            isLandscape={isLandscape}
            baseH={baseH}
          />
        </div>
      </div>
    </>
  );
}

export default function ContentTutorial() {
  return (
    <ScaleWrapper>
      <TutorialContent />
    </ScaleWrapper>
  );
}
