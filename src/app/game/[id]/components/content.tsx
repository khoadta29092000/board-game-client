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
/* eslint-disable @typescript-eslint/no-explicit-any */
export default function ContentGameDetail() {
  const params = useParams();
  const router = useRouter();
  const { id: userId } = useAuth();
  const gameId = params.id as string;
  const toastShownRef = useRef(new Set<string>());
  const { isConnected, invoke, on, off, connect } = useSignalR();
  const [gameState, setGameState] = useState<SplendorGameState | null>(null);
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [dataDiscardGem, setDataDiscardGem] = useState<DiscardGemData | null>({
    currentGems: { Black: 1, Blue: 2, Gold: 2, Green: 2, Red: 2, White: 2 },
    excessCount: 1
  });
  const [dataSelectNoble, setDataSelectNoble] =
    useState<SelectNobleData | null>(null);
  const {
    isOpen: isOpenNoble,
    onClose: onCloseNoble,
    onOpen: onOpenNoble
  } = useDisclosure();
  const lastTurnRef = useRef<string | null>(null);
  const { isMyTurn } = useTurn(gameState?.turn, userId);

  useEffect(() => {
    if (!isConnected || !gameId) {
      return;
    }

    const JoinGame = async () => {
      if (gameId === "new") {
        return;
      }

      try {
        const result = await invoke("JoinGame", gameId, userId);
        console.log("roomroomroom", result);
        if (!result?.success) {
          const toastKey = `joined-game-err`;
          if (!toastShownRef.current.has(toastKey)) {
            toast.error("Join Game Failed", {
              description: result.message
            });
            toastShownRef.current.add(toastKey);
          }
          router.push("/lobby");
        }
      } catch (error) {
        console.error("Failed to join game:", error);
      }
    };
    JoinGame();
  }, [isConnected, gameId, invoke]);

  // stable handler: update turn only if changed
  const handleGameStateLoaded = useCallback((data: SplendorGameState) => {
    if (!data) return;

    const t = data.turn;
    const fingerprint = `${t?.turnNumber ?? ""}-${t?.lastActionTime ?? ""}`;
    if (lastTurnRef.current === fingerprint) return;
    lastTurnRef.current = fingerprint;

    setGameState(data);
  }, []);
  const handleDiscardGem = useCallback((data: DiscardGemData) => {
    if (!data) return;
    setDataDiscardGem(data);
    onOpen();
  }, []);

  const submitDiscardGem = useCallback(
    async (toDiscard: GemSet) => {
      if (!isConnected) {
        toast.error("Not connected to server");
        return;
      }
      try {
        const result = await invoke("DiscardGem", gameId, userId, toDiscard);
        if (result.success) {
          const discardedList = Object.entries(toDiscard)
            .filter(([, amount]) => amount > 0)
            .map(([color, amount]) => `${amount} ${color}`)
            .join(", ");

          toast.success("Gems discarded", {
            description: `Discarded: ${discardedList}`
          });
          return;
        }
      } catch (error) {
        console.error("Discard gem error:", error);
        toast.error("Failed to discard gems");
      }
    },
    [isConnected, invoke]
  );
  const handleNeedSelectNoble = useCallback((data: SelectNobleData) => {
    if (!data) return;
    setDataSelectNoble(data);
    onOpenNoble();
  }, []);

  // Submit
  const submitSelectNoble = useCallback(
    async (nobleId: string) => {
      if (!isConnected) {
        toast.error("Not connected to server");
        return;
      }
      try {
        const result = await invoke("SelectNoble", gameId, userId, nobleId);
        if (result.success) {
          toast.success("Noble selected");
          setDataSelectNoble(null);
          onCloseNoble();
          return;
        }
      } catch (error) {
        console.error("Select noble error:", error);
        toast.error("Failed to select noble");
      }
    },
    [isConnected, invoke]
  );

  const handleCollectGems = useCallback(
    async (gems: Record<GemColor, number>) => {
      if (!isConnected) {
        toast.error("Not connected to server");
        return;
      }
      try {
        const result = await invoke("CollectGem", gameId, userId, gems);
        console.log("result claim gem", result);
        if (result.success) {
          return;
        }
        if (!result.success) {
          const toastKey = `collect-gems-err`;
          if (!toastShownRef.current.has(toastKey)) {
            toast.error("Collect Gems Failed", {
              description: result.message
            });
            toastShownRef.current.add(toastKey);
          }
        }
      } catch (error) {
        console.error("Collect gems error:", error);
        toast.error("Failed to collect gems");
      }
    },
    [isConnected, invoke]
  );

  const handlePurchaseCard = useCallback(
    async (cardId: string) => {
      if (!isConnected) {
        toast.error("Not connected to server");
        return;
      }
      try {
        const result = await invoke("PurchaseCard", gameId, userId, cardId);
        if (result.success) {
          return;
        }
        if (!result.success) {
          const toastKey = `purchase-card-err`;
          if (!toastShownRef.current.has(toastKey)) {
            toast.error("Purchase Card Failed", {
              description: result.message
            });
            toastShownRef.current.add(toastKey);
          }
        }
      } catch (error) {
        console.error("Purchase card error:", error);
        toast.error("Failed to purchase card");
      }
    },
    [isConnected, invoke]
  );

  const handleReserveCard = useCallback(
    async (cardId?: string, level?: number) => {
      if (!isConnected) {
        toast.error("Not connected to server");
        return;
      }
      try {
        const result = await invoke(
          "ReserveCard",
          gameId,
          userId,
          cardId ?? null,
          level ?? null
        );
        if (result.success) return;

        if (!result.success) {
          const toastKey = `reserve-card-err`;
          if (!toastShownRef.current.has(toastKey)) {
            toast.error("Reserve Card Failed", {
              description: result.message
            });
            toastShownRef.current.add(toastKey);
          }
        }
      } catch (error) {
        console.error("Reserve card error:", error);
        toast.error("Failed to reserve card");
      }
    },
    [isConnected, invoke]
  );

  // subscribe to GameStateLoaded only when connected
  useEffect(() => {
    if (!isConnected) return;
    // subscribe
    on("GameStateLoaded", handleGameStateLoaded);
    on("GameStateUpdated", handleGameStateLoaded);
    on("NeedSelectNoble", handleNeedSelectNoble);
    on("NeedDiscard", handleDiscardGem);
    // cleanup
    return () => {
      off("GameStateLoaded", handleGameStateLoaded);
      off("GameStateUpdated", handleGameStateLoaded);
      off("NeedSelectNoble", handleNeedSelectNoble);
      off("NeedDiscard", handleDiscardGem);
    };
  }, [isConnected, on, off, handleGameStateLoaded, handleDiscardGem]);

  return (
    <div className="h-auto flex flex-col lg:flex-row w-full p-2 sm:p-4 gap-2">
      {isOpen && dataDiscardGem && (
        <ModalDiscardGems
          isOpen={isOpen}
          onClose={() => {
            setDataDiscardGem(null);
            onClose();
          }}
          currentGems={dataDiscardGem.currentGems}
          excessCount={dataDiscardGem.excessCount}
          onConfirm={toDiscard => {
            submitDiscardGem(toDiscard);
          }}
        />
      )}
      {isOpenNoble && dataSelectNoble && (
        <ModalSelectNoble
          isOpen={isOpenNoble}
          nobles={dataSelectNoble.eligibleNobles}
          onConfirm={nobleId => submitSelectNoble(nobleId)}
          onClose={() => {
            // Không cho đóng vì bắt buộc phải chọn
          }}
        />
      )}
      {/* PLAYER LIST - Responsive positioning */}

      {gameState && (
        <PlayerInfo
          gameState={gameState}
          myId={userId}
          isMyTurn={isMyTurn}
          onPurchase={handlePurchaseCard} // pass actual handler
        />
      )}

      {/* BOARD CONTAINER */}
      <main className="flex-1 flex flex-col gap-2">
        <BoardContainer
          isConnected={isConnected}
          gameState={gameState}
          gameId={gameId}
          onCollectGem={handleCollectGems}
          onPurchase={handlePurchaseCard}
          onReserve={handleReserveCard}
          onReserveFromDeck={level => handleReserveCard(undefined, level)}
          isMyTurn={isMyTurn}
        />
      </main>
    </div>
  );
}
