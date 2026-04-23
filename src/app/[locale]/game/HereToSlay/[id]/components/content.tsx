"use client";

import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo
} from "react";
import { useParams } from "next/navigation";
import { useSignalR } from "@/src/components/signalR/signalRProvider";
import { useAuth } from "@/src/redux/global/selectors";
import DiscardPileModal from "./modals/DiscardPileModal";
import StealModal from "./modals/StealModal";
import HeroSelectModal from "./modals/HeroSelectModal";
import PartyTargetModal from "./modals/PartyTargetModal";
import IdListModal from "./modals/IdListModal";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function HereToSlayContent() {
  const params = useParams();
  const { invoke, on, off, isConnected } = useSignalR();
  const profile = useAuth();

  const gameId = params.id as string;
  const userId = profile?.Id ?? "";

  const [state, setState] = useState<any>(null);
  const [isPlayHeroOpen, setIsPlayHeroOpen] = useState(false);
  const [selectedHeroId, setSelectedHeroId] = useState<string | null>(null);
  const [isEffHeroOpen, setIsEffHeroOpen] = useState(false);
  const [selectedEffHeroId, setSelectedEffHeroId] = useState<string | null>(
    null
  );
  const [rollFeed, setRollFeed] = useState<any[]>([]);
  const [isDiscardPileOpen, setIsDiscardPileOpen] = useState(false);
  const [discardPileMode, setDiscardPileMode] = useState<
    "view" | "searchDiscard"
  >("view");
  const [discardValidIds, setDiscardValidIds] = useState<string[] | null>(null);
  const [selectedDiscardCardId, setSelectedDiscardCardId] = useState<
    string | null
  >(null);
  const [isStealOpen, setIsStealOpen] = useState(false);
  const [stealValidIds, setStealValidIds] = useState<string[] | null>(null);
  const [selectedStealCardId, setSelectedStealCardId] = useState<string | null>(
    null
  );
  const [isDestroyOpen, setIsDestroyOpen] = useState(false);
  const [destroyValidIds, setDestroyValidIds] = useState<string[] | null>(null);
  const [selectedDestroyCardId, setSelectedDestroyCardId] = useState<string | null>(
    null
  );
  const [isSacrificeOpen, setIsSacrificeOpen] = useState(false);
  const [sacrificeValidIds, setSacrificeValidIds] = useState<string[] | null>(null);
  const [selectedSacrificeCardId, setSelectedSacrificeCardId] = useState<string | null>(
    null
  );
  const [isPullFromHandOpen, setIsPullFromHandOpen] = useState(false);
  const [pullFromHandValidIds, setPullFromHandValidIds] = useState<string[] | null>(null);
  const [selectedPullFromHandId, setSelectedPullFromHandId] = useState<string | null>(
    null
  );
  const lastPendingKeyRef = useRef<string | null>(null);

  const reaction = state?.turn?.reaction;
  const isModifyActive = !!reaction?.isActive && reaction?.windowType === "Modify";
  const rollerId = state?.turn?.roll?.resolvingPlayerId ?? null;
  const hasSkipped = Array.isArray(reaction?.respondedPlayers)
    ? reaction.respondedPlayers.includes(userId)
    : false;

  // ===================== JOIN GAME =====================
  useEffect(() => {
    if (!isConnected || !gameId) return;

    const join = async () => {
      try {
        const res = await invoke("JoinGame", gameId, userId);
        console.log("JoinGame:", res);
      } catch (e) {
        console.error(e);
      }
    };

    join();
  }, [isConnected, gameId, invoke, userId]);

  // ===================== SIGNALR EVENTS =====================
  useEffect(() => {
    if (!isConnected) return;

    const handleLoaded = (data: any) => {
      console.log("GameStateLoaded:", data);
      setState(data);
    };

    const handleUpdated = (data: any) => {
      console.log("GameStateUpdated:", data);
      setState(data);

      const pending = data?.turn?.pendingEffect;
      const isActive = !!pending?.isActive;
      const waiting = pending?.waitingForActionType ?? null;
      const resolvingPlayerId = pending?.resolvingPlayerId ?? null;
      const validTargetIds: string[] = Array.isArray(pending?.validTargetIds)
        ? pending.validTargetIds
        : [];

      // Auto-open discard pile when server says we must choose from discard.
      if (
        isActive &&
        resolvingPlayerId === userId &&
        waiting === "SearchDiscard"
      ) {
        const key = `${waiting}:${resolvingPlayerId}:${validTargetIds.join(",")}`;
        if (lastPendingKeyRef.current !== key) {
          lastPendingKeyRef.current = key;
          setDiscardPileMode("searchDiscard");
          // If BE returns empty list, we still open to show discard pile,
          // but "Take" will be disabled because nothing is valid.
          setDiscardValidIds(validTargetIds.length ? validTargetIds : null);
          setSelectedDiscardCardId(validTargetIds[0] ?? null);
          setIsDiscardPileOpen(true);
        }
      }

      // Auto-open steal modal when server says we must choose a hero to steal.
      if (isActive && resolvingPlayerId === userId && waiting === "Steal") {
        const key = `${waiting}:${resolvingPlayerId}:${validTargetIds.join(",")}`;
        if (lastPendingKeyRef.current !== key) {
          lastPendingKeyRef.current = key;
          setStealValidIds(validTargetIds.length ? validTargetIds : null);
          setSelectedStealCardId(validTargetIds[0] ?? null);
          setIsStealOpen(true);
        }
      }

      // Auto-open destroy modal.
      if (isActive && resolvingPlayerId === userId && waiting === "Destroy") {
        const key = `${waiting}:${resolvingPlayerId}:${validTargetIds.join(",")}`;
        if (lastPendingKeyRef.current !== key) {
          lastPendingKeyRef.current = key;
          setDestroyValidIds(validTargetIds.length ? validTargetIds : null);
          setSelectedDestroyCardId(validTargetIds[0] ?? null);
          setIsDestroyOpen(true);
        }
      }

      // Auto-open sacrifice modal.
      if (isActive && resolvingPlayerId === userId && waiting === "Sacrifice") {
        const key = `${waiting}:${resolvingPlayerId}:${validTargetIds.join(",")}`;
        if (lastPendingKeyRef.current !== key) {
          lastPendingKeyRef.current = key;
          setSacrificeValidIds(validTargetIds.length ? validTargetIds : null);
          setSelectedSacrificeCardId(validTargetIds[0] ?? null);
          setIsSacrificeOpen(true);
        }
      }

      // Auto-open pull-from-hand modal (IDs only; other hands are masked).
      if (isActive && resolvingPlayerId === userId && waiting === "PullFromHand") {
        const key = `${waiting}:${resolvingPlayerId}:${validTargetIds.join(",")}`;
        if (lastPendingKeyRef.current !== key) {
          lastPendingKeyRef.current = key;
          setPullFromHandValidIds(validTargetIds.length ? validTargetIds : null);
          setSelectedPullFromHandId(validTargetIds[0] ?? null);
          setIsPullFromHandOpen(true);
        }
      }

      // If pending is cleared, allow re-open next time.
      if (!isActive) {
        lastPendingKeyRef.current = null;
        setIsStealOpen(false);
        setStealValidIds(null);
        setSelectedStealCardId(null);
        setIsDestroyOpen(false);
        setDestroyValidIds(null);
        setSelectedDestroyCardId(null);
        setIsSacrificeOpen(false);
        setSacrificeValidIds(null);
        setSelectedSacrificeCardId(null);
        setIsPullFromHandOpen(false);
        setPullFromHandValidIds(null);
        setSelectedPullFromHandId(null);
      }
    };

    const handleRoll = (data: any) => {
      console.log("RollResult:", data);
      setRollFeed(prev => [data, ...prev].slice(0, 20));
    };

    const handleEffectRoll = (data: any) => {
      console.log("EffectRollResult:", data);
      setRollFeed(prev => [data, ...prev].slice(0, 20));
    };

    const handleActionError = (data: any) => {
      console.warn("ActionError:", data);
      const msg = data?.message ?? data?.error ?? "UNKNOWN_ERROR";
      alert(String(msg));
    };

    on("GameStateLoaded", handleLoaded);
    on("GameStateUpdated", handleUpdated);
    on("RollResult", handleRoll);
    on("EffectRollResult", handleEffectRoll);
    on("ActionError", handleActionError);

    return () => {
      off("GameStateLoaded", handleLoaded);
      off("GameStateUpdated", handleUpdated);
      off("RollResult", handleRoll);
      off("EffectRollResult", handleEffectRoll);
      off("ActionError", handleActionError);
    };
  }, [isConnected, on, off, userId]);

  // Tick reaction timeout (authoritative close on server)
  useEffect(() => {
    if (!isConnected || !gameId) return;
    if (!isModifyActive) return;
    const t = setInterval(() => {
      invoke("TickReaction", gameId).catch(() => {});
    }, 1000);
    return () => clearInterval(t);
  }, [isConnected, gameId, invoke, isModifyActive]);

  // ===================== ACTIONS =====================

  const drawCard = useCallback(async () => {
    await invoke("DrawCard", gameId, userId);
  }, [invoke, gameId, userId]);

  const discardAndDraw = useCallback(async () => {
    await invoke("DiscardAllAndDraw5", gameId, userId);
  }, [invoke, gameId, userId]);

  const me = Object.values(state?.players || {}).find(
    (p: any) => p.playerId === userId
  ) as any;

  const myHand: any[] = useMemo(
    () => (Array.isArray(me?.hand) ? me.hand : []),
    [me?.hand]
  );

  const myModifiers: any[] = useMemo(
    () => myHand.filter((c) => String(c?.type ?? "") === "Modifier"),
    [myHand]
  );
  const getCardId = (c: any): string | null => {
    if (!c) return null;
    if (typeof c === "string") return c;
    if (typeof c === "object") return c.cardId ?? c.id ?? c.configId ?? null;
    return null;
  };
  const leaderCardId: string | null =
    me?.leaderCardId ?? me?.LeaderCardId ?? null;
  const myParty: any[] = Array.isArray(me?.party) ? me.party : [];
  const myPartyNoLeader = myParty.filter(
    c => getCardId(c) && getCardId(c) !== leaderCardId
  );

  const openPlayHero = useCallback(() => {
    if (!myHand.length) return alert("No hero in hand");
    setSelectedHeroId(getCardId(myHand[0]));
    setIsPlayHeroOpen(true);
  }, [myHand]);

  const confirmPlayHero = useCallback(async () => {
    if (!selectedHeroId) return alert("Please select a hero");
    await invoke("PlayHero", gameId, userId, selectedHeroId);
    setIsPlayHeroOpen(false);
  }, [invoke, gameId, userId, selectedHeroId]);

  const openEffHero = useCallback(() => {
    if (!myPartyNoLeader.length)
      return alert("No hero in party (excluding leader)");
    setSelectedEffHeroId(getCardId(myPartyNoLeader[0]));
    setIsEffHeroOpen(true);
  }, [myPartyNoLeader]);

  const confirmEffHero = useCallback(async () => {
    if (!selectedEffHeroId) return alert("Please select a hero");
    await invoke("ActivateHeroAbility", gameId, userId, selectedEffHeroId);
    setIsEffHeroOpen(false);
  }, [invoke, gameId, userId, selectedEffHeroId]);

  const rollHero = useCallback(async () => {
    if (!state) return;

    const me = Object.values(state.players || {}).find(
      (p: any) => p.playerId === userId
    ) as any;

    const heroId = me?.party?.[0];
    if (!heroId) return alert("No hero in party");

    await invoke("ActivateHeroAbility", gameId, userId, heroId);
  }, [invoke, state, gameId, userId]);

  const submitTarget = useCallback(async () => {
    if (!state) return;

    const target = Object.keys(state.players || {})[0];
    await invoke("SubmitEffectTarget", gameId, userId, target);
  }, [invoke, state, gameId, userId]);

  const openDiscardPile = useCallback(() => {
    const cards: any[] = state?.board?.discardPile?.cards ?? [];
    setDiscardPileMode("view");
    setDiscardValidIds(null);
    setSelectedDiscardCardId(getCardId(cards[0]) ?? null);
    setIsDiscardPileOpen(true);
  }, [state]);

  const confirmSearchDiscard = useCallback(async () => {
    if (!selectedDiscardCardId) return alert("Please select a card");
    const res: any = await invoke(
      "SubmitEffectTarget",
      gameId,
      userId,
      selectedDiscardCardId
    );
    if (res && res.success === false) {
      alert(String(res.error ?? "SUBMIT_EFFECT_TARGET_FAILED"));
      return;
    }
    setIsDiscardPileOpen(false);
  }, [invoke, gameId, userId, selectedDiscardCardId]);

  const confirmSteal = useCallback(async () => {
    if (!selectedStealCardId) return alert("Please select a target");
    const res: any = await invoke(
      "SubmitEffectTarget",
      gameId,
      userId,
      selectedStealCardId
    );
    console.log("res", res);
    if (res && res.success === false) {
      alert(String(res.error ?? "SUBMIT_EFFECT_TARGET_FAILED"));
      return;
    }
    setIsStealOpen(false);
  }, [invoke, gameId, userId, selectedStealCardId]);

  const confirmDestroy = useCallback(async () => {
    if (!selectedDestroyCardId) return alert("Please select a target");
    const res: any = await invoke(
      "SubmitEffectTarget",
      gameId,
      userId,
      selectedDestroyCardId
    );
    if (res && res.success === false) {
      alert(String(res.error ?? "SUBMIT_EFFECT_TARGET_FAILED"));
      return;
    }
    setIsDestroyOpen(false);
  }, [invoke, gameId, userId, selectedDestroyCardId]);

  const confirmSacrifice = useCallback(async () => {
    if (!selectedSacrificeCardId) return alert("Please select a target");
    const res: any = await invoke(
      "SubmitEffectTarget",
      gameId,
      userId,
      selectedSacrificeCardId
    );
    if (res && res.success === false) {
      alert(String(res.error ?? "SUBMIT_EFFECT_TARGET_FAILED"));
      return;
    }
    setIsSacrificeOpen(false);
  }, [invoke, gameId, userId, selectedSacrificeCardId]);

  const confirmPullFromHand = useCallback(async () => {
    if (!selectedPullFromHandId) return alert("Please select a target");
    const res: any = await invoke(
      "SubmitEffectTarget",
      gameId,
      userId,
      selectedPullFromHandId
    );
    if (res && res.success === false) {
      alert(String(res.error ?? "SUBMIT_EFFECT_TARGET_FAILED"));
      return;
    }
    setIsPullFromHandOpen(false);
  }, [invoke, gameId, userId, selectedPullFromHandId]);

  const skipPendingEffect = useCallback(async () => {
    await invoke("SkipPendingEffect", gameId, userId);
    setIsDiscardPileOpen(false);
    setIsStealOpen(false);
    setIsDestroyOpen(false);
    setIsSacrificeOpen(false);
    setIsPullFromHandOpen(false);
  }, [invoke, gameId, userId]);

  const skipModify = useCallback(async () => {
    await invoke("SkipModifyWindow", gameId, userId);
  }, [invoke, gameId, userId]);

  const useModifier = useCallback(
    async (modifierCardId: string, value: number) => {
      await invoke("UseModifier", gameId, userId, modifierCardId, value);
    },
    [invoke, gameId, userId]
  );

  // ===================== UI =====================

  return (
    <div style={{ padding: 20, color: "white", background: "#111" }}>
      <h2>Here To Slay Debug</h2>

      <div className="flex gap-2" style={{ marginBottom: 20 }}>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
          onClick={drawCard}
        >
          Draw Card
        </button>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
          onClick={discardAndDraw}
        >
          Discard + Draw 5
        </button>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
          onClick={openPlayHero}
        >
          Play Hero
        </button>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
          onClick={openEffHero}
        >
          EFF hero
        </button>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
          onClick={rollHero}
        >
          Roll Dice
        </button>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
          onClick={submitTarget}
        >
          Submit Target
        </button>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
          onClick={openDiscardPile}
        >
          Discard pile
        </button>
        {isModifyActive && userId && userId !== rollerId && !hasSkipped && (
          <button
            className="bg-gray-700 text-white px-4 py-2 rounded-md"
            onClick={skipModify}
          >
            Skip modifier
          </button>
        )}
      </div>

      {isModifyActive && myModifiers.length > 0 && (
        <div
          style={{
            background: "#0b0b0b",
            border: "1px solid #333",
            borderRadius: 8,
            padding: 12,
            marginBottom: 12
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 8 }}>
            Modifiers in hand (choose + / -)
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {myModifiers.map((m) => {
              const id = getCardId(m);
              if (!id) return null;
              const values: number[] = Array.isArray(m?.modifierValues)
                ? m.modifierValues
                : [];

              return (
                <div
                  key={id}
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    justifyContent: "space-between",
                    border: "1px solid #333",
                    borderRadius: 8,
                    padding: 10,
                    background: "#111"
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700 }}>
                      {String(m?.cardName ?? m?.type ?? "Modifier")}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.85 }}>
                      values: {values.length ? values.join(", ") : "(missing)"}
                    </div>
                    <div style={{ fontFamily: "monospace", fontSize: 12, opacity: 0.9 }}>
                      {id}
                    </div>
                  </div>

                  <div className="flex gap-2" style={{ flex: "0 0 auto" }}>
                    {values.map((v) => (
                      <button
                        key={id + ":" + v}
                        className="bg-blue-500 text-white px-3 py-2 rounded-md"
                        onClick={() => useModifier(id, v)}
                      >
                        {v > 0 ? `+${v}` : String(v)}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <DiscardPileModal
        isOpen={isDiscardPileOpen}
        mode={discardPileMode}
        discardCards={state?.board?.discardPile?.cards ?? []}
        discardCount={state?.board?.discardPile?.count ?? 0}
        validIds={discardValidIds}
        selectedCardId={selectedDiscardCardId}
        onSelectCardId={setSelectedDiscardCardId}
        onClose={() => setIsDiscardPileOpen(false)}
        onConfirmTake={confirmSearchDiscard}
        onGiveUp={skipPendingEffect}
        getCardId={getCardId}
      />

      <StealModal
        isOpen={isStealOpen}
        statePlayers={state?.players}
        validIds={stealValidIds}
        selectedCardId={selectedStealCardId}
        onSelectCardId={setSelectedStealCardId}
        onClose={() => setIsStealOpen(false)}
        onConfirmSteal={confirmSteal}
        onGiveUp={skipPendingEffect}
        getCardId={getCardId}
      />

      <PartyTargetModal
        isOpen={isDestroyOpen}
        title="Choose a hero to destroy"
        confirmLabel="Destroy"
        statePlayers={state?.players}
        validIds={destroyValidIds}
        selectedCardId={selectedDestroyCardId}
        onSelectCardId={setSelectedDestroyCardId}
        onClose={() => setIsDestroyOpen(false)}
        onConfirm={confirmDestroy}
        onGiveUp={skipPendingEffect}
        getCardId={getCardId}
      />

      <PartyTargetModal
        isOpen={isSacrificeOpen}
        title="Choose a hero to sacrifice"
        confirmLabel="Sacrifice"
        statePlayers={state?.players}
        validIds={sacrificeValidIds}
        selectedCardId={selectedSacrificeCardId}
        onSelectCardId={setSelectedSacrificeCardId}
        onClose={() => setIsSacrificeOpen(false)}
        onConfirm={confirmSacrifice}
        onGiveUp={skipPendingEffect}
        getCardId={getCardId}
      />

      <IdListModal
        isOpen={isPullFromHandOpen}
        title="Choose a card to pull from hand"
        ids={pullFromHandValidIds ?? []}
        selectedId={selectedPullFromHandId}
        onSelectId={setSelectedPullFromHandId}
        onClose={() => setIsPullFromHandOpen(false)}
        onConfirm={confirmPullFromHand}
        confirmLabel="Pull"
        onGiveUp={skipPendingEffect}
      />

      <div
        style={{
          background: "#0b0b0b",
          border: "1px solid #333",
          borderRadius: 8,
          padding: 12,
          marginBottom: 12
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 8 }}>
          Roll feed (everyone)
        </div>
        {rollFeed.length === 0 ? (
          <div style={{ opacity: 0.8, fontSize: 12 }}>No rolls yet.</div>
        ) : (
          <div style={{ display: "grid", gap: 6 }}>
            {rollFeed.map((r, idx) => (
              <div
                key={
                  (r?.playerId ?? "p") + ":" + (r?.heroId ?? "h") + ":" + idx
                }
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "baseline",
                  fontSize: 12,
                  fontFamily: "monospace"
                }}
              >
                <span style={{ opacity: 0.9 }}>player</span>
                <span style={{ overflowWrap: "anywhere" }}>
                  {String(r?.playerId ?? "")}
                </span>
                <span style={{ opacity: 0.9 }}>hero</span>
                <span style={{ overflowWrap: "anywhere" }}>
                  {String(r?.heroId ?? "")}
                </span>
                <span style={{ opacity: 0.9 }}>dice</span>
                <span>
                  {Array.isArray(r?.dice) ? `[${r.dice.join(",")}]` : "[]"}
                </span>
                <span style={{ opacity: 0.9 }}>total</span>
                <span>{String(r?.total ?? "")}</span>
                <span style={{ opacity: 0.9 }}>success</span>
                <span style={{ color: r?.success ? "#22c55e" : "#ef4444" }}>
                  {String(!!r?.success)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <HeroSelectModal
        isOpen={isPlayHeroOpen}
        title="Choose a hero from your hand"
        cards={myHand}
        selectedCardId={selectedHeroId}
        onSelectCardId={setSelectedHeroId}
        onClose={() => setIsPlayHeroOpen(false)}
        onConfirm={confirmPlayHero}
        confirmLabel="Summon"
        getCardId={getCardId}
      />

      <HeroSelectModal
        isOpen={isEffHeroOpen}
        title="Choose a hero in your party (excluding leader)"
        cards={myPartyNoLeader}
        selectedCardId={selectedEffHeroId}
        onSelectCardId={setSelectedEffHeroId}
        onClose={() => setIsEffHeroOpen(false)}
        onConfirm={confirmEffHero}
        confirmLabel="Activate"
        getCardId={getCardId}
      />

      <pre
        style={{
          background: "#000",
          padding: 12,
          borderRadius: 8,
          maxHeight: 500,
          overflow: "auto",
          fontSize: 12
        }}
      >
        {JSON.stringify(state, null, 2)}
      </pre>
    </div>
  );
}
