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
import PlayerSelectModal from "./modals/PlayerSelectModal";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function HereToSlayContent() {
  const params = useParams();
  const { invoke, on, off, isConnected } = useSignalR();
  const profile = useAuth();

  const gameId = params.id as string;
  const locale = String((params as { locale?: string }).locale ?? "en");
  // Redux auth is hydrated from localStorage via <AuthInit /> (async effect),
  // so the first render can have empty userId. Fallback to localStorage to avoid
  // calling JoinGame with "" and missing group broadcasts until refresh.
  const userId = useMemo(() => {
    const idFromRedux = profile?.Id ?? (profile as any)?.id ?? "";
    if (idFromRedux) return String(idFromRedux);
    try {
      const raw =
        typeof window !== "undefined" ? localStorage.getItem("user_data") : null;
      if (!raw) return "";
      const parsed: any = JSON.parse(raw);
      return String(parsed?.Id ?? parsed?.id ?? "");
    } catch {
      return "";
    }
  }, [profile]);

  const [state, setState] = useState<any>(null);
  const [isPlayCardOpen, setIsPlayCardOpen] = useState(false);
  const [selectedPlayCardId, setSelectedPlayCardId] = useState<string | null>(
    null
  );
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
  const [isEquipItemOpen, setIsEquipItemOpen] = useState(false);
  const [equipItemValidIds, setEquipItemValidIds] = useState<string[] | null>(
    null
  );
  const [selectedEquipHeroId, setSelectedEquipHeroId] = useState<string | null>(
    null
  );
  const [isDestroyOpen, setIsDestroyOpen] = useState(false);
  const [destroyValidIds, setDestroyValidIds] = useState<string[] | null>(null);
  const [selectedDestroyCardId, setSelectedDestroyCardId] = useState<
    string | null
  >(null);
  const [destroyTargetCount, setDestroyTargetCount] = useState<number | null>(
    null
  );
  const [destroyRemaining, setDestroyRemaining] = useState<number | null>(null);
  const [isSacrificeOpen, setIsSacrificeOpen] = useState(false);
  const [sacrificeValidIds, setSacrificeValidIds] = useState<string[] | null>(
    null
  );
  const [selectedSacrificeCardId, setSelectedSacrificeCardId] = useState<
    string | null
  >(null);
  const [sacrificeTargetCount, setSacrificeTargetCount] = useState<
    number | null
  >(null);
  const [sacrificeRemaining, setSacrificeRemaining] = useState<number | null>(
    null
  );
  const [isPullFromHandOpen, setIsPullFromHandOpen] = useState(false);
  const [pullFromHandValidIds, setPullFromHandValidIds] = useState<
    string[] | null
  >(null);
  const [selectedPullFromHandId, setSelectedPullFromHandId] = useState<
    string | null
  >(null);
  const [isChoosePlayerOpen, setIsChoosePlayerOpen] = useState(false);
  const [choosePlayerValidIds, setChoosePlayerValidIds] = useState<
    string[] | null
  >(null);
  const [selectedChoosePlayerId, setSelectedChoosePlayerId] = useState<
    string | null
  >(null);

  const [isDiscardFromHandOpen, setIsDiscardFromHandOpen] = useState(false);
  const [discardFromHandValidIds, setDiscardFromHandValidIds] = useState<
    string[] | null
  >(null);
  const [selectedDiscardFromHandId, setSelectedDiscardFromHandId] = useState<
    string | null
  >(null);

  const [isPlayImmediatelyOpen, setIsPlayImmediatelyOpen] = useState(false);
  const [playImmediatelyValidIds, setPlayImmediatelyValidIds] = useState<
    string[] | null
  >(null);
  const [selectedPlayImmediatelyId, setSelectedPlayImmediatelyId] = useState<
    string | null
  >(null);
  const [isSignedRollChoiceOpen, setIsSignedRollChoiceOpen] = useState(false);
  const [signedRollChoiceIds, setSignedRollChoiceIds] = useState<string[] | null>(
    null
  );
  const [selectedSignedRollChoice, setSelectedSignedRollChoice] = useState<
    string | null
  >(null);
  const lastPendingKeyRef = useRef<string | null>(null);
  const joinedKeyRef = useRef<string | null>(null);

  const [isTopDeckPickOpen, setIsTopDeckPickOpen] = useState(false);
  const [topDeckValidCards, setTopDeckValidCards] = useState<any[] | null>(null);
  const [selectedTopDeckCardId, setSelectedTopDeckCardId] = useState<
    string | null
  >(null);
  const [isTopDeckOrderOpen, setIsTopDeckOrderOpen] = useState(false);
  const [topDeckOrderValidCards, setTopDeckOrderValidCards] = useState<any[] | null>(
    null
  );
  const [selectedTopDeckOrderCardId, setSelectedTopDeckOrderCardId] = useState<
    string | null
  >(null);

  const activeTurnUiSignals: any[] = useMemo(() => {
    const raw = state?.turn?.activeTurnUiSignals;
    return Array.isArray(raw) ? raw : [];
  }, [state?.turn?.activeTurnUiSignals]);

  const reaction = state?.turn?.reaction;
  const pendingEffectActive = !!state?.turn?.pendingEffect?.isActive;
  const postSummonChoiceActive = !!state?.turn?.postSummonFreeHeroChoiceActive;
  const postSummonFreeHeroCardIds: string[] = Array.isArray(
    state?.turn?.postSummonFreeHeroCardIds
  )
    ? state.turn.postSummonFreeHeroCardIds.map((x: unknown) => String(x))
    : [];

  const isMyTurn =
    !!userId &&
    String(state?.turn?.currentPlayer ?? "") === String(userId);
  const remainingActionsZero =
    Number(state?.turn?.remainingActions ?? 0) === 0;
  const phaseStr = String(state?.turn?.phase ?? "");
  /** Server only accepts EndTurn in this window (see EndTurnAsync). */
  const idleForEndTurn =
    phaseStr === "WaitingForAction" &&
    !reaction?.isActive &&
    !pendingEffectActive;
  const showZeroApEndTurnBanner =
    isMyTurn &&
    remainingActionsZero &&
    (postSummonChoiceActive || idleForEndTurn);
  const endTurnButtonEnabled = isMyTurn && remainingActionsZero && idleForEndTurn;

  const isModifyActive =
    !!reaction?.isActive && reaction?.windowType === "Modify";
  const isChallengeActive =
    !!reaction?.isActive && reaction?.windowType === "Challenge";
  const isChallengeModifyActive =
    isModifyActive && String(reaction?.rollKind ?? "") === "Challenge";
  const hasSkipped = Array.isArray(reaction?.respondedPlayers)
    ? reaction.respondedPlayers.includes(userId)
    : false;

  // ===================== JOIN GAME =====================
  useEffect(() => {
    if (!isConnected || !gameId || !userId) return;

    const joinKey = `${gameId}:${userId}`;
    if (joinedKeyRef.current === joinKey) return;
    joinedKeyRef.current = joinKey;

    const join = async () => {
      try {
        await invoke("JoinGame", gameId, userId);
      } catch (e) {
        console.error(e);
      }
    };

    join();
  }, [isConnected, gameId, invoke, userId]);

  // ===================== SIGNALR EVENTS =====================
  useEffect(() => {
    if (!isConnected) return;

    const handlePendingEffectRequired = (data: any) => {
      const waiting = String(data?.waitingForActionType ?? "").replace(
        /\s+/g,
        ""
      );
      if (!/^chooseSignedRollBonus$/i.test(waiting)) return;
      const resolvingPlayerId = data?.resolvingPlayerId ?? null;
      const validTargetIds: string[] = Array.isArray(data?.validTargetIds)
        ? data.validTargetIds.map((x: unknown) => String(x))
        : [];
      if (resolvingPlayerId !== userId || validTargetIds.length === 0) return;
      const key = `ChooseSignedRollBonus:${resolvingPlayerId}:${validTargetIds.join(",")}`;
      if (lastPendingKeyRef.current !== key) {
        lastPendingKeyRef.current = key;
        setSignedRollChoiceIds(validTargetIds);
        setSelectedSignedRollChoice(null);
        setIsSignedRollChoiceOpen(true);
      }
    };

    const handleLoaded = (data: any) => {
      setState(data);
    };

    const handleUpdated = (data: any) => {
      setState(data);

      const pending = data?.turn?.pendingEffect;
      const isActive = !!pending?.isActive;
      const waitingRaw = pending?.waitingForActionType;
      const waiting =
        waitingRaw === null || waitingRaw === undefined
          ? null
          : String(waitingRaw);
      const resolvingPlayerId = pending?.resolvingPlayerId ?? null;
      // Hub/JSON can surface numeric "-5" in validTargetIds; server expects the string "-5".
      const validTargetIds: string[] = Array.isArray(pending?.validTargetIds)
        ? pending.validTargetIds.map((x: unknown) => String(x))
        : [];
      const waitingIsChooseSignedRollBonus =
        typeof waiting === "string" &&
        /^chooseSignedRollBonus$/i.test(waiting.replace(/\s+/g, ""));
      const targetCount = Number.isFinite(pending?.targetCount)
        ? Number(pending.targetCount)
        : null;
      const remainingSelections = Number.isFinite(pending?.remainingSelections)
        ? Number(pending.remainingSelections)
        : null;

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

      // Equip played Item onto a hero in your party.
      if (isActive && resolvingPlayerId === userId && waiting === "EquipItem") {
        const key = `${waiting}:${resolvingPlayerId}:${validTargetIds.join(",")}`;
        if (lastPendingKeyRef.current !== key) {
          lastPendingKeyRef.current = key;
          setEquipItemValidIds(validTargetIds.length ? validTargetIds : null);
          setSelectedEquipHeroId(validTargetIds[0] ?? null);
          setIsEquipItemOpen(true);
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
          setDestroyTargetCount(targetCount);
          setDestroyRemaining(remainingSelections);
          setIsDestroyOpen(true);
        }
      }

      // Auto-open sacrifice modal.
      const pendingByPlayerId =
        pending && typeof pending === "object"
          ? (pending as any).pendingByPlayerId
          : null;
      const myPendingSacrificeValidIds: string[] =
        pendingByPlayerId &&
        pendingByPlayerId[userId] &&
        Array.isArray(pendingByPlayerId[userId])
          ? pendingByPlayerId[userId]
          : [];

      // Sacrifice can be either:
      // - group pending (parallel): pendingByPlayerId[userId] exists
      // - single resolver (legacy/other actions): resolvingPlayerId === userId + validTargetIds
      const sacrificeIdsToUse = myPendingSacrificeValidIds.length
        ? myPendingSacrificeValidIds
        : validTargetIds;
      const shouldOpenSacrifice =
        isActive &&
        waiting === "Sacrifice" &&
        sacrificeIdsToUse.length > 0 &&
        (myPendingSacrificeValidIds.length > 0 || resolvingPlayerId === userId);

      if (shouldOpenSacrifice) {
        const key = `${waiting}:${userId}:${sacrificeIdsToUse.join(",")}`;
        if (lastPendingKeyRef.current !== key) {
          lastPendingKeyRef.current = key;
          setSacrificeValidIds(sacrificeIdsToUse);
          setSelectedSacrificeCardId(sacrificeIdsToUse[0] ?? null);
          setSacrificeTargetCount(targetCount);
          setSacrificeRemaining(remainingSelections);
          setIsSacrificeOpen(true);
        }
      }

      // Auto-open pull-from-hand modal (IDs only; other hands are masked).
      if (
        isActive &&
        resolvingPlayerId === userId &&
        waiting === "PullFromHand"
      ) {
        const key = `${waiting}:${resolvingPlayerId}:${validTargetIds.join(",")}`;
        if (lastPendingKeyRef.current !== key) {
          lastPendingKeyRef.current = key;
          setPullFromHandValidIds(
            validTargetIds.length ? validTargetIds : null
          );
          setSelectedPullFromHandId(validTargetIds[0] ?? null);
          setIsPullFromHandOpen(true);
        }
      }

      // Auto-open choose-player modal (for CHOOSE_PLAYER actions).
      if (
        isActive &&
        resolvingPlayerId === userId &&
        waiting === "ChoosePlayer"
      ) {
        const key = `${waiting}:${resolvingPlayerId}:${validTargetIds.join(",")}`;
        if (lastPendingKeyRef.current !== key) {
          lastPendingKeyRef.current = key;
          setChoosePlayerValidIds(
            validTargetIds.length ? validTargetIds : null
          );
          setSelectedChoosePlayerId(validTargetIds[0] ?? null);
          setIsChoosePlayerOpen(true);
        }
      }

      // hero_059: pick +N or -N for AllRollsBonusThisTurn (validTargetIds are "+5","-5", etc.)
      if (
        isActive &&
        resolvingPlayerId === userId &&
        waitingIsChooseSignedRollBonus &&
        validTargetIds.length > 0
      ) {
        const key = `${waiting}:${resolvingPlayerId}:${validTargetIds.join(",")}`;
        if (lastPendingKeyRef.current !== key) {
          lastPendingKeyRef.current = key;
          setSignedRollChoiceIds(validTargetIds);
          // No default: user must tap + or - so a quick Confirm cannot silently apply +5.
          setSelectedSignedRollChoice(null);
          setIsSignedRollChoiceOpen(true);
        }
      }

      // Auto-open discard-from-hand modal.
      // Same pattern as Sacrifice: hero_054/055 use ALL_OTHERS — each other player has
      // pendingByPlayerId[userId] while resolvingPlayerId stays the effect owner.
      const myPendingDiscardValidIds: string[] =
        pendingByPlayerId &&
        pendingByPlayerId[userId] &&
        Array.isArray(pendingByPlayerId[userId])
          ? pendingByPlayerId[userId]
          : [];
      const discardIdsToUse = myPendingDiscardValidIds.length
        ? myPendingDiscardValidIds
        : validTargetIds;
      const shouldOpenDiscardFromHand =
        isActive &&
        waiting === "Discard" &&
        discardIdsToUse.length > 0 &&
        (myPendingDiscardValidIds.length > 0 || resolvingPlayerId === userId);

      if (shouldOpenDiscardFromHand) {
        const key = `${waiting}:${userId}:${discardIdsToUse.join(",")}`;
        if (lastPendingKeyRef.current !== key) {
          lastPendingKeyRef.current = key;
          setDiscardFromHandValidIds(
            discardIdsToUse.length ? discardIdsToUse : null
          );
          setSelectedDiscardFromHandId(discardIdsToUse[0] ?? null);
          setIsDiscardFromHandOpen(true);
        }
      }

      // Auto-open play-immediately modal (only when BE requires selecting from hand).
      if (
        isActive &&
        resolvingPlayerId === userId &&
        waiting === "PlayImmediately"
      ) {
        const key = `${waiting}:${resolvingPlayerId}:${validTargetIds.join(",")}`;
        if (lastPendingKeyRef.current !== key) {
          lastPendingKeyRef.current = key;
          // If BE says there are no valid cards to play immediately, it will auto-skip this action.
          // Don't open a modal in that case (hero_014 should still draw 1 card).
          if (validTargetIds.length > 0) {
            setPlayImmediatelyValidIds(validTargetIds);
            setSelectedPlayImmediatelyId(validTargetIds[0] ?? null);
            setIsPlayImmediatelyOpen(true);
          }
        }
      }

      // Auto-open top-deck pick modal (hero_013).
      const revealedCards: any[] = Array.isArray((pending as any)?.revealedCards)
        ? (pending as any).revealedCards
        : [];
      if (isActive && resolvingPlayerId === userId && waiting === "LookAtTopDeck") {
        const key = `${waiting}:${resolvingPlayerId}:${validTargetIds.join(",")}`;
        if (lastPendingKeyRef.current !== key) {
          lastPendingKeyRef.current = key;
          setTopDeckValidCards(revealedCards.length ? revealedCards : null);
          setSelectedTopDeckCardId(validTargetIds[0] ?? null);
          setIsTopDeckPickOpen(true);
        }
      }

      // Auto-open top-deck order modal (return remaining to top in order).
      if (isActive && resolvingPlayerId === userId && waiting === "PutOnTopDeck") {
        const key = `${waiting}:${resolvingPlayerId}:${validTargetIds.join(",")}`;
        if (lastPendingKeyRef.current !== key) {
          lastPendingKeyRef.current = key;
          setTopDeckOrderValidCards(revealedCards.length ? revealedCards : null);
          setSelectedTopDeckOrderCardId(validTargetIds[0] ?? null);
          setIsTopDeckOrderOpen(true);
        }
      }

      // Auto-open LookAtHand view modal (hero_016 step 2: OK to continue).
      const lookedAtHandCards: any[] = Array.isArray((pending as any)?.lookedAtHandCards)
        ? (pending as any).lookedAtHandCards
        : [];
      if (isActive && resolvingPlayerId === userId && waiting === "LookAtHand") {
        const key = `${waiting}:${resolvingPlayerId}`;
        if (lastPendingKeyRef.current !== key) {
          lastPendingKeyRef.current = key;
          setTopDeckValidCards(lookedAtHandCards.length ? lookedAtHandCards : null);
          setSelectedTopDeckCardId("OK");
          setIsTopDeckPickOpen(true);
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
        setDestroyTargetCount(null);
        setDestroyRemaining(null);
        setIsSacrificeOpen(false);
        setSacrificeValidIds(null);
        setSelectedSacrificeCardId(null);
        setSacrificeTargetCount(null);
        setSacrificeRemaining(null);
        setIsPullFromHandOpen(false);
        setPullFromHandValidIds(null);
        setSelectedPullFromHandId(null);
        setIsChoosePlayerOpen(false);
        setChoosePlayerValidIds(null);
        setSelectedChoosePlayerId(null);

        setIsSignedRollChoiceOpen(false);
        setSignedRollChoiceIds(null);
        setSelectedSignedRollChoice(null);

        setIsDiscardFromHandOpen(false);
        setDiscardFromHandValidIds(null);
        setSelectedDiscardFromHandId(null);

        setIsPlayImmediatelyOpen(false);
        setPlayImmediatelyValidIds(null);
        setSelectedPlayImmediatelyId(null);

        setIsTopDeckPickOpen(false);
        setTopDeckValidCards(null);
        setSelectedTopDeckCardId(null);
        setIsTopDeckOrderOpen(false);
        setTopDeckOrderValidCards(null);
        setSelectedTopDeckOrderCardId(null);
      }
    };

    const handleRoll = (data: any) => {
      setRollFeed(prev => [data, ...prev].slice(0, 20));
    };

    const handleEffectRoll = (data: any) => {
      setRollFeed(prev => [data, ...prev].slice(0, 20));
    };

    const handleActionError = (data: any) => {
      console.warn("ActionError:", data);
      const msg = data?.message ?? data?.error ?? "UNKNOWN_ERROR";
      alert(String(msg));
    };

    on("GameStateLoaded", handleLoaded);
    on("GameStateUpdated", handleUpdated);
    on("PendingEffectRequired", handlePendingEffectRequired);
    on("RollResult", handleRoll);
    on("EffectRollResult", handleEffectRoll);
    on("ActionError", handleActionError);

    return () => {
      off("GameStateLoaded", handleLoaded);
      off("GameStateUpdated", handleUpdated);
      off("PendingEffectRequired", handlePendingEffectRequired);
      off("RollResult", handleRoll);
      off("EffectRollResult", handleEffectRoll);
      off("ActionError", handleActionError);
    };
  }, [isConnected, on, off, userId]);

  // NOTE: Modify window has no-timeout for now (no TickReaction needed).

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

  const getCardId = (c: any): string | null => {
    if (!c) return null;
    if (typeof c === "string") return c;
    if (typeof c === "object")
      return (
        c.cardId ??
        c.id ??
        c.configId ??
        c.ConfigId ??
        null
      );
    return null;
  };

  /** Normalize card kind (handles PascalCase / configId when type missing). */
  const getCardType = useCallback((c: any): string => {
    if (!c || typeof c !== "object") return "";
    const raw = c.type ?? c.Type ?? c.cardType ?? c.CardType;
    if (raw != null && String(raw).trim() !== "") return String(raw).trim();
    const cfg = String(c.configId ?? c.ConfigId ?? "").trim();
    if (/^Modifier_/i.test(cfg)) return "Modifier";
    if (/^Challenge_/i.test(cfg)) return "Challenge";
    if (/^Magic_/i.test(cfg)) return "Magic";
    if (/^Item_/i.test(cfg)) return "Item";
    if (/^hero_/i.test(cfg)) return "Hero";
    return "";
  }, []);

  const myModifiers: any[] = useMemo(
    () =>
      myHand.filter(
        c => getCardType(c).toLowerCase() === "modifier"
      ),
    [myHand, getCardType]
  );

  const myChallenges: any[] = useMemo(
    () =>
      myHand.filter(
        c => getCardType(c).toLowerCase() === "challenge"
      ),
    [myHand, getCardType]
  );
  const leaderCardId: string | null =
    me?.leaderCardId ?? me?.LeaderCardId ?? null;
  const myParty: any[] = Array.isArray(me?.party) ? me.party : [];
  const myPartyNoLeader = myParty.filter(
    c => getCardId(c) && getCardId(c) !== leaderCardId
  );

  const formatMonsterSlayRule = useCallback((threshold: number | undefined | null): string => {
    const t = Number(threshold ?? 0);
    if (t > 0) return `≥ ${t}`;
    if (t < 0) return `< ${-t}`;
    return "—";
  }, []);

  const formatMonsterPenaltyRule = useCallback((threshold: number | undefined | null): string => {
    const t = Number(threshold ?? 0);
    if (t > 0) return `≥ ${t}`;
    if (t < 0) return `< ${-t}`;
    return "—";
  }, []);

  const partyMeetsMonsterRequirements = useCallback(
    (requirements: string[] | undefined | null): boolean => {
      if (!requirements?.length) return true;
      const slots: { isLeader: boolean; heroClass?: string }[] = [];
      if (leaderCardId) slots.push({ isLeader: true });
      for (const c of myParty) {
        const id = getCardId(c);
        if (!id || id === leaderCardId) continue;
        if (getCardType(c).toLowerCase() !== "hero") continue;
        const cls = String(
          c.effectiveHeroClass ?? c.heroClass ?? c.baseHeroClass ?? ""
        ).toLowerCase();
        slots.push({ isLeader: false, heroClass: cls || undefined });
      }
      const available = [...slots];
      for (const raw of requirements) {
        const req = String(raw ?? "").trim().toLowerCase();
        if (!req) return false;
        let idx = -1;
        if (req === "hero" || req === "any") {
          idx = available.findIndex(s => s.isLeader || !!s.heroClass);
        } else {
          const normalized = req === "warrior" ? "fighter" : req;
          idx = available.findIndex(
            s => !s.isLeader && s.heroClass === normalized
          );
        }
        if (idx < 0) return false;
        available.splice(idx, 1);
      }
      return true;
    },
    [myParty, leaderCardId, getCardType]
  );

  const monsterZone: any[] = useMemo(
    () =>
      Array.isArray(state?.board?.monsterZone)
        ? state.board.monsterZone
        : [],
    [state?.board?.monsterZone]
  );

  const mySlainMonsters: any[] = useMemo(
    () => (Array.isArray(me?.slainMonsters) ? me.slainMonsters : []),
    [me?.slainMonsters]
  );

  const remainingActions = Number(state?.turn?.remainingActions ?? 0);
  const canAttackMonster =
    isMyTurn &&
    remainingActions >= 2 &&
    !reaction?.isActive &&
    !pendingEffectActive;

  const playableHandCards: any[] = useMemo(
    () =>
      myHand.filter((c) => {
        const t = getCardType(c).toLowerCase();
        if (t === "modifier" || t === "challenge" || t === "partyleader")
          return false;
        return t === "hero" || t === "magic" || t === "item";
      }),
    [myHand, getCardType]
  );

  const openPlayCard = useCallback(() => {
    if (!playableHandCards.length)
      return alert("No Hero, Magic, or Item cards in hand to play");
    setSelectedPlayCardId(getCardId(playableHandCards[0]));
    setIsPlayCardOpen(true);
  }, [playableHandCards]);

  const confirmPlayCard = useCallback(async () => {
    if (!selectedPlayCardId) return alert("Please select a card");
    const picked = playableHandCards.find(
      (c) => getCardId(c) === selectedPlayCardId
    );
    const t = getCardType(picked).toLowerCase();
    if (t === "hero")
      await invoke("PlayHero", gameId, userId, selectedPlayCardId);
    else if (t === "magic")
      await invoke("PlayMagic", gameId, userId, selectedPlayCardId);
    else if (t === "item")
      await invoke("PlayItem", gameId, userId, selectedPlayCardId);
    else return alert("Selected card cannot be played with this action");
    setIsPlayCardOpen(false);
  }, [
    invoke,
    gameId,
    userId,
    selectedPlayCardId,
    playableHandCards,
    getCardType
  ]);

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

  const attackMonster = useCallback(
    async (monsterCardId: string) => {
      await invoke("AttackMonster", gameId, userId, monsterCardId);
    },
    [invoke, gameId, userId]
  );

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

  const confirmEquipItem = useCallback(async () => {
    if (!selectedEquipHeroId) return alert("Please select a hero to equip");
    const res: any = await invoke(
      "SubmitEffectTarget",
      gameId,
      userId,
      selectedEquipHeroId
    );
    if (res && res.success === false) {
      alert(String(res.error ?? "SUBMIT_EFFECT_TARGET_FAILED"));
      return;
    }
    setIsEquipItemOpen(false);
  }, [invoke, gameId, userId, selectedEquipHeroId]);

  const equipItemPartyCards = useMemo(() => {
    const valid = new Set((equipItemValidIds ?? []).map(String));
    return myPartyNoLeader.filter(c => {
      const id = getCardId(c);
      return id && valid.has(id);
    });
  }, [myPartyNoLeader, equipItemValidIds]);

  const confirmSteal = useCallback(async () => {
    if (!selectedStealCardId) return alert("Please select a target");
    const res: any = await invoke(
      "SubmitEffectTarget",
      gameId,
      userId,
      selectedStealCardId
    );
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
    // Don't close here: for count>1 actions, server may still require more picks.
    // Modal will auto-close when pendingEffect is cleared.
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
    // Don't close here: for count>1 actions, server may still require more picks.
    // Modal will auto-close when pendingEffect is cleared.
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

  const confirmChoosePlayer = useCallback(async () => {
    if (!selectedChoosePlayerId) return alert("Please select a player");
    const res: any = await invoke(
      "SubmitEffectTarget",
      gameId,
      userId,
      selectedChoosePlayerId
    );
    if (res && res.success === false) {
      alert(String(res.error ?? "SUBMIT_EFFECT_TARGET_FAILED"));
      return;
    }
    setIsChoosePlayerOpen(false);
  }, [invoke, gameId, userId, selectedChoosePlayerId]);

  const confirmSignedRollChoice = useCallback(async () => {
    if (!selectedSignedRollChoice) return alert("Please select + or - bonus");
    const res: any = await invoke(
      "SubmitEffectTarget",
      gameId,
      userId,
      String(selectedSignedRollChoice)
    );
    if (res && res.success === false) {
      alert(String(res.error ?? "SUBMIT_EFFECT_TARGET_FAILED"));
      return;
    }
    setIsSignedRollChoiceOpen(false);
  }, [invoke, gameId, userId, selectedSignedRollChoice]);

  const confirmDiscardFromHand = useCallback(async () => {
    if (!selectedDiscardFromHandId) return alert("Please select a card");
    const res: any = await invoke(
      "SubmitEffectTarget",
      gameId,
      userId,
      selectedDiscardFromHandId
    );
    if (res && res.success === false) {
      alert(String(res.error ?? "SUBMIT_EFFECT_TARGET_FAILED"));
      return;
    }
    // For multi-pick discard (if ever), keep open until pending clears.
  }, [invoke, gameId, userId, selectedDiscardFromHandId]);

  const confirmPlayImmediately = useCallback(async () => {
    if (!selectedPlayImmediatelyId) return alert("Please select a card");
    const res: any = await invoke(
      "SubmitEffectTarget",
      gameId,
      userId,
      selectedPlayImmediatelyId
    );
    if (res && res.success === false) {
      alert(String(res.error ?? "SUBMIT_EFFECT_TARGET_FAILED"));
      return;
    }
    setIsPlayImmediatelyOpen(false);
  }, [invoke, gameId, userId, selectedPlayImmediatelyId]);

  const confirmTopDeckPick = useCallback(async () => {
    if (!selectedTopDeckCardId) return alert("Please select a card");
    const res: any = await invoke(
      "SubmitEffectTarget",
      gameId,
      userId,
      selectedTopDeckCardId
    );
    if (res && res.success === false) {
      alert(String(res.error ?? "SUBMIT_EFFECT_TARGET_FAILED"));
      return;
    }
    setIsTopDeckPickOpen(false);
  }, [invoke, gameId, userId, selectedTopDeckCardId]);

  const confirmTopDeckOrder = useCallback(async () => {
    if (!selectedTopDeckOrderCardId) return alert("Please select a card");
    const res: any = await invoke(
      "SubmitEffectTarget",
      gameId,
      userId,
      selectedTopDeckOrderCardId
    );
    if (res && res.success === false) {
      alert(String(res.error ?? "SUBMIT_EFFECT_TARGET_FAILED"));
      return;
    }
    // keep open until server clears pendingEffect (we'll update selected each state update)
  }, [invoke, gameId, userId, selectedTopDeckOrderCardId]);

  const skipPendingEffect = useCallback(async () => {
    const res: any = await invoke("SkipPendingEffect", gameId, userId);
    if (res && res.success === false) {
      alert(String(res.error ?? "SKIP_PENDING_EFFECT_FAILED"));
      return;
    }
    // Allow re-open for same pending key next time
    lastPendingKeyRef.current = null;
    setIsDiscardPileOpen(false);
    setIsStealOpen(false);
    setIsDestroyOpen(false);
    setIsSacrificeOpen(false);
    setIsPullFromHandOpen(false);
    setIsChoosePlayerOpen(false);
    setIsDiscardFromHandOpen(false);
    setIsPlayImmediatelyOpen(false);
    setIsSignedRollChoiceOpen(false);
    setSignedRollChoiceIds(null);
    setSelectedSignedRollChoice(null);
    setIsTopDeckPickOpen(false);
    setIsTopDeckOrderOpen(false);
  }, [invoke, gameId, userId]);

  const skipModify = useCallback(async () => {
    await invoke("SkipModifyWindow", gameId, userId);
  }, [invoke, gameId, userId]);

  const skipChallenge = useCallback(async () => {
    await invoke("SkipChallengeWindow", gameId, userId);
  }, [invoke, gameId, userId]);

  const endTurn = useCallback(async () => {
    if (!endTurnButtonEnabled) return;
    const res: any = await invoke("EndTurn", gameId, userId);
    if (res && res.success === false) {
      alert(String(res.error ?? "END_TURN_FAILED"));
    }
  }, [invoke, gameId, userId, endTurnButtonEnabled]);

  const playChallenge = useCallback(
    async (challengeCardId: string) => {
      await invoke("UseChallenge", gameId, userId, challengeCardId);
    },
    [invoke, gameId, userId]
  );

  // NOTE: don't name this "useModifier" (eslint thinks it's a Hook).
  const applyModifier = useCallback(
    async (modifierCardId: string, value: number) => {
      await invoke("UseModifier", gameId, userId, modifierCardId, value);
    },
    [invoke, gameId, userId]
  );

  const [challengeBuffSide, setChallengeBuffSide] = useState<
    "CHALLENGER" | "DEFENDER"
  >("CHALLENGER");

  const applyModifierOnChallenge = useCallback(
    async (modifierCardId: string, value: number) => {
      await invoke(
        "UseModifierOnChallenge",
        gameId,
        userId,
        modifierCardId,
        value,
        challengeBuffSide
      );
    },
    [invoke, gameId, userId, challengeBuffSide]
  );


  // ===================== UI =====================

  return (
    <div style={{ padding: 20, color: "white", background: "#111" }}>
      <h2>Here To Slay Debug</h2>

      {activeTurnUiSignals.length > 0 && (
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            borderRadius: 8,
            border: "1px solid #2d5a3d",
            background: "#0d1a12"
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 8, color: "#9dffb0" }}>
            Passive / auto effects (Redis: turn.activeTurnUiSignals)
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              alignItems: "stretch"
            }}
          >
            {activeTurnUiSignals.map((s: any, i: number) => {
              const msg =
                locale === "vi"
                  ? String(s?.messageVi ?? s?.messageEn ?? s?.kind ?? "")
                  : String(s?.messageEn ?? s?.messageVi ?? s?.kind ?? "");
              const title = `${String(s?.kind ?? "")}${
                s?.playerId ? ` · ${s.playerId}` : ""
              }${
                s?.immuneUntilExclusiveTurnNumber != null
                  ? ` · immuneUntilExclusiveTurnNumber=${s.immuneUntilExclusiveTurnNumber}`
                  : ""
              }`;
              return (
                <div
                  key={i}
                  title={title}
                  style={{
                    maxWidth: 340,
                    padding: "8px 10px",
                    borderRadius: 6,
                    border: "1px solid #3a6b4a",
                    background: "#0a1410",
                    fontSize: 12,
                    lineHeight: 1.35
                  }}
                >
                  <div
                    style={{
                      fontFamily: "monospace",
                      fontSize: 11,
                      opacity: 0.85,
                      marginBottom: 4
                    }}
                  >
                    {String(s?.kind ?? "SIGNAL")}
                  </div>
                  <div>{msg}</div>
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: 11, opacity: 0.7, marginTop: 8 }}>
            turnNumber: {String(state?.turn?.turnNumber ?? "")} · current:{" "}
            {String(state?.turn?.currentPlayer ?? "")}
          </div>
        </div>
      )}

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
          onClick={openPlayCard}
        >
          Play card (1 AP)
        </button>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
          onClick={openEffHero}
        >
          EFF hero (1 AP)
        </button>

        <span style={{ fontSize: 12, opacity: 0.85, alignSelf: "center" }}>
          AP: {remainingActions}
        </span>

        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
          onClick={openDiscardPile}
        >
          Discard pile
        </button>
        {isModifyActive &&
          userId &&
          !hasSkipped &&
          // Hero ability: roller is pre-marked responded server-side; FE used to hide Skip for them,
          // which bricks solo (no other player to skip). Showing Skip is harmless for 2+ players.
          (isChallengeModifyActive ||
            userId !== String(reaction?.rollingPlayerId ?? "") ||
            String(reaction?.rollKind ?? "") === "HeroAbility") && (
            <button
              className="bg-gray-700 text-white px-4 py-2 rounded-md"
              onClick={skipModify}
            >
              Skip modifier
            </button>
          )}

        {isChallengeActive &&
          userId &&
          // In challenge window, pending-play player doesn't skip.
          userId !== String(reaction?.pendingPlayPlayerId ?? "") &&
          !hasSkipped && (
            <button
              className="bg-gray-700 text-white px-4 py-2 rounded-md"
              onClick={skipChallenge}
            >
              Skip challenge
            </button>
          )}
      </div>

      <div
        style={{
          background: "#0b0b0b",
          border: "1px solid #4b2d1b",
          borderRadius: 8,
          padding: 12,
          marginBottom: 12
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 8, color: "#f0a060" }}>
          {locale === "vi" ? "Khu quái (2 AP / lần tấn công)" : "Monster zone (2 AP per attack)"}
        </div>
        {monsterZone.length === 0 ? (
          <div style={{ fontSize: 12, opacity: 0.8 }}>No monsters visible.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {monsterZone.map((m: any) => {
              const id = getCardId(m);
              if (!id) return null;
              const reqs: string[] = Array.isArray(m.partyRequirements)
                ? m.partyRequirements
                : [];
              const meets = partyMeetsMonsterRequirements(reqs);
              const rewardT = m?.rollReward?.threshold ?? m?.rollReward?.Threshold;
              const penaltyT =
                m?.rollPenalty?.threshold ?? m?.rollPenalty?.Threshold;
              return (
                <div
                  key={id}
                  style={{
                    border: "1px solid #5a3a22",
                    borderRadius: 8,
                    padding: 10,
                    background: "#14100c"
                  }}
                >
                  <div style={{ fontWeight: 700 }}>
                    {String(m.configId ?? m.cardName ?? "Monster")}
                  </div>
                  <div
                    style={{
                      fontFamily: "monospace",
                      fontSize: 11,
                      opacity: 0.85,
                      marginTop: 4
                    }}
                  >
                    {id}
                  </div>
                  <div style={{ fontSize: 12, marginTop: 6 }}>
                    {locale === "vi" ? "Party cần" : "Party needs"}:{" "}
                    <b>{reqs.length ? reqs.join(" + ") : "—"}</b>
                    {!meets && (
                      <span style={{ color: "#f87171", marginLeft: 8 }}>
                        {locale === "vi" ? "(chưa đủ)" : "(not met)"}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>
                    {locale === "vi" ? "Thưởng (hạ gục)" : "Reward (slay)"}: roll{" "}
                    <b>{formatMonsterSlayRule(rewardT)}</b>
                    {m?.rollReward?.text ? ` — ${m.rollReward.text}` : ""}
                  </div>
                  <div style={{ fontSize: 12, marginTop: 2 }}>
                    {locale === "vi" ? "Phạt" : "Penalty"}: roll{" "}
                    <b>{formatMonsterPenaltyRule(penaltyT)}</b>
                    {m?.rollPenalty?.text ? ` — ${m.rollPenalty.text}` : ""}
                  </div>
                  {m?.cardDescription && (
                    <div style={{ fontSize: 11, opacity: 0.85, marginTop: 6 }}>
                      {locale === "vi" ? "Passive khi hạ" : "While slain"}:{" "}
                      {String(m.cardDescription)}
                    </div>
                  )}
                  {isMyTurn && (
                    <button
                      className="bg-orange-600 text-white px-3 py-2 rounded-md mt-2"
                      disabled={!canAttackMonster || !meets}
                      onClick={() => attackMonster(id)}
                      style={{
                        opacity: canAttackMonster && meets ? 1 : 0.45,
                        cursor:
                          canAttackMonster && meets ? "pointer" : "not-allowed"
                      }}
                    >
                      {locale === "vi" ? "Tấn công (2 AP)" : "Attack (2 AP)"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {mySlainMonsters.length > 0 && (
          <div style={{ marginTop: 12, fontSize: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              {locale === "vi" ? "Quái đã hạ (passive đang bật)" : "Slain monsters (passives active)"}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {mySlainMonsters.map((m: any) => (
                <span
                  key={getCardId(m) ?? m.configId}
                  style={{
                    fontFamily: "monospace",
                    fontSize: 11,
                    padding: "4px 8px",
                    borderRadius: 4,
                    border: "1px solid #3a5a22",
                    background: "#0a140c"
                  }}
                >
                  {String(m.configId ?? getCardId(m))}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {showZeroApEndTurnBanner && (
          <div
            style={{
              marginBottom: 16,
              padding: 12,
              borderRadius: 8,
              border: "1px solid #6b4a2d",
              background: "#1a120a",
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <div style={{ flex: "1 1 240px", fontSize: 13, lineHeight: 1.45 }}>
              {postSummonChoiceActive ? (
                locale === "vi" ? (
                  <>
                    Hết điểm hành động. Bạn vừa triệu hồi hero — có thể{" "}
                    <b>kích ability miễn phí</b> (nút EFF hero) cho một trong các
                    thẻ dưới, hoặc <b>kết thúc lượt</b>.
                    {!idleForEndTurn && (
                      <span style={{ display: "block", marginTop: 8, opacity: 0.85 }}>
                        Đang xử lý roll / modifier / challenge hoặc hiệu ứng — xong
                        bạn mới bấm được <b>Kết thúc lượt</b> (server yêu cầu phase
                        rảnh).
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    No action points left. You summoned a hero this turn — you
                    may <b>activate its ability for free</b> (EFF hero) for one of
                    the card IDs below, or <b>end your turn</b>.
                    {!idleForEndTurn && (
                      <span style={{ display: "block", marginTop: 8, opacity: 0.85 }}>
                        Roll / modifier / challenge or another effect is in progress
                        — <b>End turn</b> unlocks once the board is idle again.
                      </span>
                    )}
                  </>
                )
              ) : locale === "vi" ? (
                <>
                  Hết điểm hành động. Lượt sẽ tự chuyển khi server rảnh; nếu vẫn
                  kẹt ở lượt bạn, bấm <b>Kết thúc lượt</b>.
                </>
              ) : (
                <>
                  No action points left. The server should advance your turn
                  automatically when idle; if you are still stuck, tap{" "}
                  <b>End turn</b>.
                </>
              )}
              {postSummonChoiceActive && postSummonFreeHeroCardIds.length > 0 && (
                <div
                  style={{
                    marginTop: 8,
                    fontFamily: "monospace",
                    fontSize: 11,
                    opacity: 0.9,
                    wordBreak: "break-all"
                  }}
                >
                  {postSummonFreeHeroCardIds.join(", ")}
                </div>
              )}
            </div>
            <button
              type="button"
              className={`${
                endTurnButtonEnabled
                  ? "bg-amber-600 hover:bg-amber-500"
                  : "bg-neutral-600 cursor-not-allowed opacity-70"
              } text-white px-4 py-2 rounded-md shrink-0`}
              onClick={endTurn}
              disabled={!endTurnButtonEnabled}
              title={
                !endTurnButtonEnabled && postSummonChoiceActive
                  ? locale === "vi"
                    ? "Chờ hết modifier/challenge và phase WaitingForAction"
                    : "Wait until modify/challenge clears and phase is WaitingForAction"
                  : undefined
              }
            >
              {locale === "vi" ? "Kết thúc lượt" : "End turn"}
            </button>
          </div>
        )}

      {isChallengeActive && !isPlayCardOpen && (
        <div
          style={{
            background: "#120b0b",
            border: "1px solid #4b1b1b",
            borderRadius: 8,
            padding: 12,
            marginBottom: 12
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 6 }}>
            Challenge window
          </div>
          {String(state?.turn?.skipChallengeForPlayerId ?? "") ===
            String(reaction?.pendingPlayPlayerId ?? "") && (
            <div
              style={{
                color: "#8fdf9a",
                fontSize: 12,
                marginBottom: 10,
                padding: 8,
                background: "#0a1a0f",
                borderRadius: 6,
                border: "1px solid #2d5a3d"
              }}
            >
              {locale === "vi"
                ? "Lượt chơi Hero này không thể bị challenge (bảo vệ hết lượt của người chơi) — BE có thể auto-skip."
                : "This Hero play cannot be challenged (rest-of-turn protection) — the server may auto-skip the window."}
            </div>
          )}
          <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 10 }}>
            Pending player:{" "}
            <span style={{ fontFamily: "monospace" }}>
              {String(reaction?.pendingPlayPlayerId ?? "")}
            </span>{" "}
            | Pending card:{" "}
            <span style={{ fontFamily: "monospace" }}>
              {String(reaction?.pendingPlayCardId ?? "")}
            </span>{" "}
            ({String(reaction?.pendingPlayCardType ?? "")})
          </div>

          {userId === reaction?.pendingPlayPlayerId ? (
            <div style={{ fontSize: 12, opacity: 0.85 }}>
              You are the challenged player. Waiting for others…
            </div>
          ) : myChallenges.length === 0 ? (
            <div style={{ fontSize: 12, opacity: 0.85 }}>
              No Challenge cards in hand.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {myChallenges.map(c => {
                const id = getCardId(c);
                if (!id) return null;
                return (
                  <div
                    key={id}
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                      justifyContent: "space-between",
                      border: "1px solid #4b1b1b",
                      borderRadius: 8,
                      padding: 10,
                      background: "#111"
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700 }}>
                        {String(c?.cardName ?? c?.type ?? "Challenge")}
                      </div>
                      <div
                        style={{
                          fontFamily: "monospace",
                          fontSize: 12,
                          opacity: 0.9
                        }}
                      >
                        {id}
                      </div>
                    </div>
                    <button
                      className="bg-red-600 text-white px-3 py-2 rounded-md"
                      onClick={() => playChallenge(id)}
                    >
                      Play Challenge
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {isModifyActive && !isPlayCardOpen && myModifiers.length > 0 && (
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
          {isChallengeModifyActive ? (
            <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 8 }}>
              <div style={{ marginBottom: 6 }}>
                Challenger:{" "}
                <span style={{ fontFamily: "monospace" }}>
                  {String(reaction?.challengeChallengerPlayerId ?? "")}
                </span>{" "}
                dice{" "}
                {Array.isArray(reaction?.challengeChallengerDice)
                  ? `[${reaction.challengeChallengerDice.join(",")}]`
                  : "[]"}{" "}
                total <b>{String(reaction?.challengeChallengerTotal ?? "")}</b>
              </div>
              <div style={{ marginBottom: 8 }}>
                Defender:{" "}
                <span style={{ fontFamily: "monospace" }}>
                  {String(reaction?.challengeDefenderPlayerId ?? "")}
                </span>{" "}
                dice{" "}
                {Array.isArray(reaction?.challengeDefenderDice)
                  ? `[${reaction.challengeDefenderDice.join(",")}]`
                  : "[]"}{" "}
                total <b>{String(reaction?.challengeDefenderTotal ?? "")}</b>
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ opacity: 0.85 }}>Buff side:</div>
                <button
                  className="bg-blue-500 text-white px-3 py-2 rounded-md"
                  onClick={() => setChallengeBuffSide("CHALLENGER")}
                  style={{
                    opacity: challengeBuffSide === "CHALLENGER" ? 1 : 0.6
                  }}
                >
                  Challenger
                </button>
                <button
                  className="bg-blue-500 text-white px-3 py-2 rounded-md"
                  onClick={() => setChallengeBuffSide("DEFENDER")}
                  style={{
                    opacity: challengeBuffSide === "DEFENDER" ? 1 : 0.6
                  }}
                >
                  Defender
                </button>
              </div>
            </div>
          ) : String(reaction?.rollKind ?? "") === "MonsterAttack" ? (
            <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 8 }}>
              {(() => {
                const mid = String(reaction?.rollingMonsterCardId ?? "");
                const m = monsterZone.find((c: any) => getCardId(c) === mid);
                const rewardT =
                  m?.rollReward?.threshold ?? m?.rollReward?.Threshold;
                const penaltyT =
                  m?.rollPenalty?.threshold ?? m?.rollPenalty?.Threshold;
                return (
                  <>
                    <div>
                      Monster attack · total{" "}
                      <b>{String(reaction?.currentDice ?? "")}</b>
                    </div>
                    <div style={{ marginTop: 4 }}>
                      {locale === "vi" ? "Hạ gục (thưởng)" : "Slay (reward)"}: roll{" "}
                      <b>{formatMonsterSlayRule(rewardT)}</b>
                      {m?.rollReward?.text ? ` — ${m.rollReward.text}` : ""}
                    </div>
                    <div style={{ marginTop: 2 }}>
                      {locale === "vi" ? "Phạt" : "Penalty"}: roll{" "}
                      <b>{formatMonsterPenaltyRule(penaltyT)}</b>
                      {m?.rollPenalty?.text ? ` — ${m.rollPenalty.text}` : ""}
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 8 }}>
              Current total: {String(reaction?.currentDice ?? "")} (req:{" "}
              {String(
                reaction?.rollRequirement ??
                  state?.turn?.roll?.rollRequirement ??
                  ""
              )}
              )
            </div>
          )}
          <div style={{ display: "grid", gap: 8 }}>
            {myModifiers.map(m => {
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
                    <div
                      style={{
                        fontFamily: "monospace",
                        fontSize: 12,
                        opacity: 0.9
                      }}
                    >
                      {id}
                    </div>
                  </div>

                  <div className="flex gap-2" style={{ flex: "0 0 auto" }}>
                    {values.map(v => (
                      <button
                        key={id + ":" + v}
                        className="bg-blue-500 text-white px-3 py-2 rounded-md"
                        onClick={() =>
                          isChallengeModifyActive
                            ? applyModifierOnChallenge(id, v)
                            : applyModifier(id, v)
                        }
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
        targetCount={destroyTargetCount}
        remainingSelections={destroyRemaining}
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
        targetCount={sacrificeTargetCount}
        remainingSelections={sacrificeRemaining}
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

      <PlayerSelectModal
        isOpen={isChoosePlayerOpen}
        title="Choose a player"
        playerIds={choosePlayerValidIds ?? []}
        playersById={state?.players}
        selectedPlayerId={selectedChoosePlayerId}
        onSelectPlayerId={setSelectedChoosePlayerId}
        onClose={() => setIsChoosePlayerOpen(false)}
        onConfirm={confirmChoosePlayer}
        confirmLabel="Choose"
        onGiveUp={skipPendingEffect}
      />

      <IdListModal
        isOpen={isSignedRollChoiceOpen}
        title={
          locale === "vi"
            ? "Majestelk: chọn +5 hoặc -5 cho mọi roll trong lượt này"
            : "Majestelk: choose +5 or -5 to all your rolls this turn"
        }
        ids={signedRollChoiceIds ?? []}
        selectedId={selectedSignedRollChoice}
        onSelectId={setSelectedSignedRollChoice}
        onClose={() => setIsSignedRollChoiceOpen(false)}
        onConfirm={confirmSignedRollChoice}
        confirmLabel={locale === "vi" ? "Xác nhận" : "Confirm"}
        onGiveUp={skipPendingEffect}
      />

      <HeroSelectModal
        isOpen={isDiscardFromHandOpen}
        title="Choose a card to discard"
        cards={myHand.filter(c => {
          const id = getCardId(c);
          if (!id) return false;
          if (!discardFromHandValidIds) return true;
          return discardFromHandValidIds.includes(id);
        })}
        selectedCardId={selectedDiscardFromHandId}
        onSelectCardId={setSelectedDiscardFromHandId}
        onClose={() => setIsDiscardFromHandOpen(false)}
        onConfirm={confirmDiscardFromHand}
        confirmLabel="Discard"
        getCardId={getCardId}
      />

      <HeroSelectModal
        isOpen={isPlayImmediatelyOpen}
        title="Choose a card to play immediately"
        cards={myHand.filter(c => {
          const id = getCardId(c);
          if (!id) return false;
          if (!playImmediatelyValidIds) return true;
          return playImmediatelyValidIds.includes(id);
        })}
        selectedCardId={selectedPlayImmediatelyId}
        onSelectCardId={setSelectedPlayImmediatelyId}
        onClose={() => setIsPlayImmediatelyOpen(false)}
        onConfirm={confirmPlayImmediately}
        confirmLabel="Play"
        getCardId={getCardId}
      />

      <HeroSelectModal
        isOpen={isTopDeckPickOpen}
        title={
          state?.turn?.pendingEffect?.waitingForActionType === "LookAtHand"
            ? "Look at selected player's hand"
            : "Top 3 cards: choose 1 to add to your hand"
        }
        cards={(topDeckValidCards ?? []).map(c => ({
          ...c,
          // ensure cardId exists for getCardId
          cardId: c?.cardId ?? c?.id
        }))}
        selectedCardId={selectedTopDeckCardId}
        onSelectCardId={setSelectedTopDeckCardId}
        onClose={() => setIsTopDeckPickOpen(false)}
        onConfirm={confirmTopDeckPick}
        confirmLabel={
          state?.turn?.pendingEffect?.waitingForActionType === "LookAtHand"
            ? "OK"
            : "Take"
        }
        getCardId={getCardId}
      />

      <HeroSelectModal
        isOpen={isTopDeckOrderOpen}
        title="Return remaining cards to the top (pick order)"
        cards={(topDeckOrderValidCards ?? []).map(c => ({
          ...c,
          cardId: c?.cardId ?? c?.id
        }))}
        selectedCardId={selectedTopDeckOrderCardId}
        onSelectCardId={setSelectedTopDeckOrderCardId}
        onClose={() => setIsTopDeckOrderOpen(false)}
        onConfirm={confirmTopDeckOrder}
        confirmLabel="Put on top"
        getCardId={getCardId}
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
                  (r?.playerId ?? "p") +
                  ":" +
                  (r?.monsterId ?? r?.heroId ?? "c") +
                  ":" +
                  idx
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
                {r?.monsterId ? (
                  <>
                    <span style={{ opacity: 0.9 }}>monster</span>
                    <span style={{ overflowWrap: "anywhere" }}>
                      {String(r.monsterId)}
                    </span>
                  </>
                ) : (
                  <>
                    <span style={{ opacity: 0.9 }}>hero</span>
                    <span style={{ overflowWrap: "anywhere" }}>
                      {String(r?.heroId ?? "")}
                    </span>
                  </>
                )}
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
        isOpen={isEquipItemOpen}
        title="Equip item — choose a hero in your party"
        cards={equipItemPartyCards}
        selectedCardId={selectedEquipHeroId}
        onSelectCardId={setSelectedEquipHeroId}
        onClose={() => setIsEquipItemOpen(false)}
        onConfirm={confirmEquipItem}
        confirmLabel="Equip"
        getCardId={getCardId}
      />

      <HeroSelectModal
        isOpen={isPlayCardOpen}
        title="Play a card (1 AP) — Hero, Magic, or Item"
        cards={playableHandCards}
        selectedCardId={selectedPlayCardId}
        onSelectCardId={setSelectedPlayCardId}
        onClose={() => setIsPlayCardOpen(false)}
        onConfirm={confirmPlayCard}
        confirmLabel="Play"
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
