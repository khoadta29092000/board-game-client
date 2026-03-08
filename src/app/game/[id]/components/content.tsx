"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
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
import useTurn from "@/src/hook/game/useTurn";
import { ModalDiscardGems } from "@/src/components/splendor/gameBoard/modal/modalDiscardGems";
import { ScaleWrapper, useCanvas } from "@/src/components/common/scaleWrapper";
import { GameOverOverlay } from "@/src/components/splendor/gameBoard/gameOverlay";
import { diffGameState } from "@/src/hook/game/useGameDiff";
import { pushEvents } from "@/src/redux/animation/slice";
import { useDispatch } from "react-redux";
import { preloadSounds } from "@/src/sounds.ts/splendorSounds";
import AnimationLayer from "@/src/components/common/AnimationLayer";
import { getGemBankRect } from "@/src/redux/animation/Animationrefs";
import { useTutorialSteps } from "@/src/hook/game/useTutorialSteps";
import { LoadingOverlay } from "@/src/components/common/loading";

/* eslint-disable @typescript-eslint/no-explicit-any */

function GameContent() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch(); // ← Fix 1: cần dispatch để pushEvents vào Redux
  const profile = useAuth();
  const userId = profile?.id;
  const gameId = params.id as string;
  const toastShownRef = useRef(new Set<string>());
  const { isConnected, invoke, on, off } = useSignalR();
  const [gameState, setGameState] = useState<SplendorGameState | null>(null);
  const prevGameStateRef = useRef<SplendorGameState | null>(null); // ← lưu state trước để diff
  const [isLoading, setIsLoading] = useState(true);
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
  const lastTurnRef = useRef<string | null>(null);
  const { isMyTurn } = useTurn(gameState?.turn, userId);
  const { isDesktop, isTablet, vw, vh, baseH, scale } = useCanvas();
  const screenRatio = vw / vh;
  const isLandscape = isDesktop || (isTablet && screenRatio > 1.0);
  const playerCount = gameState?.players
    ? Object.keys(gameState.players).length
    : 2;
  const isGameOver = gameState?.info?.state === "Completed";

  const { currentStep } = useTutorialSteps(gameState, userId ?? "");
  // Preload sounds sau lần click đầu (browser autoplay policy)
  useEffect(() => {
    const handle = () => {
      preloadSounds();
      window.removeEventListener("click", handle);
    };
    window.addEventListener("click", handle);
    return () => window.removeEventListener("click", handle);
  }, []);

  useEffect(() => {
    if (!isConnected || !gameId) return;
    const JoinGame = async () => {
      if (gameId === "new") return;
      try {
        const result = await invoke("JoinGame", gameId, userId);
        if (!result?.success) {
          const k = `joined-game-err`;
          if (!toastShownRef.current.has(k)) {
            toast.error("Join Game Failed", { description: result.message });
            toastShownRef.current.add(k);
          }
          router.push("/lobby");
        }
      } catch (e) {
        console.error(e);
      }
    };
    JoinGame();
  }, [isConnected, gameId, invoke]);

  // ── Fix 2: tách GameStateLoaded (lần đầu, không animate) ──────────────────
  const handleGameStateLoaded = useCallback((data: SplendorGameState) => {
    if (!data) return;
    prevGameStateRef.current = data;
    setGameState(data);
    setIsLoading(false);
  }, []);

  // ── Fix 2: GameStateUpdated (mỗi turn) → diff → animate → delay setState ──
  const handleGameStateUpdated = useCallback(
    (data: SplendorGameState) => {
      if (!data) return;

      // Completed: skip animation
      if (data.info?.state === "Completed") {
        prevGameStateRef.current = data;
        setGameState(data);
        return;
      }

      // Dedup
      const fp = `${data.turn?.turnNumber ?? ""}-${data.turn?.lastActionTime ?? ""}`;
      if (lastTurnRef.current === fp) return;
      lastTurnRef.current = fp;

      const prev = prevGameStateRef.current;
      if (prev) {
        const events = diffGameState(prev, data);

        if (events.length > 0) {
          dispatch(pushEvents(events)); // ← Fix 1: dispatch đúng cách

          // Tính delay dựa trên tổng thời gian animation
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

      // Không có events → update ngay
      prevGameStateRef.current = data;
      setGameState(data);
    },
    [dispatch]
  );

  const handleDiscardGem = useCallback((data: DiscardGemData) => {
    if (!data) return;
    setDataDiscardGem(data);
    onOpen();
  }, []);

  const handleNeedSelectNoble = useCallback((data: SelectNobleData) => {
    if (!data) return;
    setDataSelectNoble(data);
    onOpenNoble();
  }, []);

  const handleGameOver = useCallback((_data: { winner: string }) => {}, []);

  const handleLastRound = useCallback((data: { triggeredBy: string }) => {
    if (!data) return;
    toast.warning("LAST ROUND!", {
      description: (
        <>
          &nbsp;
          <span style={{ color: "#fca5a5" }}>{data.triggeredBy}</span>
          &nbsp;hit 15pts — one more turn each!
        </>
      )
    });
  }, []);

  const submitDiscardGem = useCallback(
    async (toDiscard: GemSet) => {
      if (!isConnected) return;
      try {
        const r = await invoke("DiscardGem", gameId, userId, toDiscard);
        if (r.success) toast.success("Gems discarded");
      } catch {
        toast.error("Failed to discard gems");
      }
    },
    [isConnected, invoke]
  );

  const submitSelectNoble = useCallback(
    async (nobleId: string) => {
      if (!isConnected) return;
      try {
        const r = await invoke("SelectNoble", gameId, userId, nobleId);
        if (r.success) {
          toast.success("Noble selected");
          setDataSelectNoble(null);
          onCloseNoble();
        }
      } catch {
        toast.error("Failed to select noble");
      }
    },
    [isConnected, invoke]
  );

  const handleCollectGems = useCallback(
    async (gems: Record<GemColor, number>) => {
      if (!isConnected) return;
      try {
        const r = await invoke("CollectGem", gameId, userId, gems);
        if (!r.success)
          toast.error("Collect Gems Failed", { description: r.message });
      } catch {
        toast.error("Failed to collect gems");
      }
    },
    [isConnected, invoke]
  );

  const handlePurchaseCard = useCallback(
    async (cardId: string) => {
      if (!isConnected) return;
      try {
        const r = await invoke("PurchaseCard", gameId, userId, cardId);
        if (!r.success)
          toast.error("Purchase Card Failed", { description: r.message });
      } catch {
        toast.error("Failed to purchase card");
      }
    },
    [isConnected, invoke]
  );

  const handleReserveCard = useCallback(
    async (cardId?: string, level?: number) => {
      if (!isConnected) return;
      try {
        const r = await invoke(
          "ReserveCard",
          gameId,
          userId,
          cardId ?? null,
          level ?? null
        );
        if (!r.success)
          toast.error("Reserve Card Failed", { description: r.message });
      } catch {
        toast.error("Failed to reserve card");
      }
    },
    [isConnected, invoke]
  );

  useEffect(() => {
    if (!isConnected) return;
    on("GameStateLoaded", handleGameStateLoaded); // ← Fix 2: tách riêng
    on("GameStateUpdated", handleGameStateUpdated); // ← Fix 2: tách riêng
    on("NeedSelectNoble", handleNeedSelectNoble);
    on("NeedDiscard", handleDiscardGem);
    on("GameOver", handleGameOver);
    on("LastRound", handleLastRound);
    return () => {
      off("GameStateLoaded", handleGameStateLoaded);
      off("GameStateUpdated", handleGameStateUpdated);
      off("NeedSelectNoble", handleNeedSelectNoble);
      off("NeedDiscard", handleDiscardGem);
      off("GameOver", handleGameOver);
      off("LastRound", handleLastRound);
    };
  }, [
    isConnected,
    on,
    off,
    handleGameStateLoaded,
    handleGameStateUpdated,
    handleDiscardGem,
    handleGameOver,
    handleLastRound
  ]);

  if (isLoading) {
    return <LoadingOverlay message="Creating Game..." />;
  }

  return (
    <>
      <AnimationLayer />
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
        {isGameOver && gameState && (
          <GameOverOverlay
            gameState={gameState}
            myId={userId ?? ""}
            onLeave={() => router.push("/lobby")}
          />
        )}
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

        {gameState && (
          <PlayerInfo
            currentStep={currentStep?.id == 0 ? null : currentStep}
            gameState={gameState}
            myId={userId ?? ""}
            isMyTurn={isMyTurn}
            isLandscape={isLandscape}
            playerCount={playerCount}
            baseH={baseH}
            onPurchase={handlePurchaseCard}
          />
        )}

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
            currentStep={currentStep?.id == 0 ? null : currentStep}
            isConnected={isConnected}
            gameState={gameState}
            gameId={gameId}
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

export default function ContentGameDetail() {
  return (
    <ScaleWrapper>
      <GameContent />
    </ScaleWrapper>
  );
}
