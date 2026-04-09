/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef
} from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/src/i18n/navigation";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import {
  Loader2,
  Users,
  Crown,
  ArrowLeft,
  Copy,
  Check,
  Wifi,
  WifiOff,
  BotIcon,
  WifiOff as DisconnectIcon
} from "lucide-react";
import { toast } from "sonner";
import { PlayerLeftRoom, Room, RoomPlayer } from "@/src/types/room";
import { useSignalR } from "@/src/components/signalR/signalRProvider";
import { useAuth } from "@/src/redux/global/selectors";
import BotThinkingIndicator from "@/src/components/splendor/common/BotThinkingIndicator";
import { useTranslations } from "next-intl";
import { PasswordModal } from "./PasswordModal ";

export default function ContentRoomDetail() {
  const router = useRouter();
  const params = useParams();
  const auth = useAuth();
  const t = useTranslations();

  const roomId = params.id as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [botThinkingMsg, setBotThinkingMsg] = useState("Bot is thinking...");
  const [disconnectedPlayers, setDisconnectedPlayers] = useState<Set<string>>(
    new Set()
  );
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingPassword, setPendingPassword] = useState("");
  const [roomType, setRoomType] = useState<string | null>(null);

  // Refs to avoid duplicate events
  const hasJoinedRef = useRef(false);
  const toastShownRef = useRef(new Set<string>());

  const { isConnected, invoke, on, off } = useSignalR();

  // ─── Computed ────────────────────────────────────────────────────────────────

  const isOwner = useMemo(
    () => room?.players.find(p => p.playerId === auth?.Id)?.isOwner ?? false,
    [room?.players, auth?.Id]
  );

  const emptySlots = useMemo(
    () =>
      room
        ? Array.from({ length: room.quantityPlayer - room.currentPlayers })
        : [],
    [room?.quantityPlayer, room?.currentPlayers]
  );

  const hasDisconnectedPlayers = useMemo(
    () => disconnectedPlayers.size > 0,
    [disconnectedPlayers]
  );

  // ─── SignalR Handlers ─────────────────────────────────────────────────────────

  const handleJoinedRoom = useCallback(
    (data: { room: Room; success: boolean }) => {
      if (data.success && !hasJoinedRef.current) {
        setRoom(data.room);
        hasJoinedRef.current = true;
        setIsLoading(false);
        const toastKey = `joined-room-${data.room.id}`;
        if (!toastShownRef.current.has(toastKey)) {
          toast.success("Successfully joined the room!");
          toastShownRef.current.add(toastKey);
        }
      }
      setIsJoining(false);
    },
    []
  );

  // Called when BE fires RoomRejoined after grace period reconnect
  const handleRoomRejoined = useCallback(
    (data: { success: boolean; room: Room }) => {
      if (data.success) {
        setRoom(data.room);
        hasJoinedRef.current = true; // prevent JoinRoom useEffect from firing again
        setIsLoading(false);
        setIsJoining(false);
        toast.success("Reconnected to room!");
      }
    },
    []
  );

  const handleRoomUpdated = useCallback((playerLeft: PlayerLeftRoom) => {
    setRoom(playerLeft.room);
  }, []);

  const handlePlayerJoined = useCallback(
    (data: { playerId: string; playerName: string; room: Room }) => {
      if (data.playerId !== auth?.Id) {
        setRoom(data.room);
        const toastKey = `player-joined-${data.playerId}-${Date.now()}`;
        if (!toastShownRef.current.has(toastKey)) {
          toast.success(`${data.playerName} joined the room`);
          toastShownRef.current.add(toastKey);
          setTimeout(() => toastShownRef.current.delete(toastKey), 5000);
        }
      }
    },
    [auth?.Id]
  );

  const handlePlayerDisconnected = useCallback(
    (data: { playerId: string; message: string }) => {
      setDisconnectedPlayers(prev => new Set(prev).add(data.playerId));
      toast.warning("A player lost connection, waiting 30s...");
    },
    []
  );

  const handlePlayerReconnected = useCallback((data: { playerId: string }) => {
    setDisconnectedPlayers(prev => {
      const next = new Set(prev);
      next.delete(data.playerId);
      return next;
    });
    toast.success("Player reconnected!");
  }, []);

  const handleError = useCallback(
    (error: string) => {
      const toastKey = `error-${error}`;
      if (!toastShownRef.current.has(toastKey)) {
        toast.error(error);
        toastShownRef.current.add(toastKey);
      }
      setIsLoading(false);
      setIsJoining(false);
      if (error.includes("not found") || error.includes("Room not found")) {
        setTimeout(() => router.push("/lobby"), 2000);
      }
    },
    [router]
  );

  const handlePlayerChangeReady = useCallback((data: { updatedRoom: Room }) => {
    if (data) setRoom(data.updatedRoom);
  }, []);

  const handleStartGame = useCallback(() => {
    router.push(`/game/${roomId}`);
  }, [roomId]);

  const handleBotThinking = useCallback((data: { message: string }) => {
    setIsBotThinking(true);
    setBotThinkingMsg(data?.message ?? "Bot is thinking...");
  }, []);

  const handlePlayerKicked = useCallback(
    (data: { playerId: string; playerName: string; room: Room }) => {
      setDisconnectedPlayers(prev => {
        const next = new Set(prev);
        next.delete(data.playerId);
        return next;
      });

      // Update room state
      if (data.room) {
        setRoom(data.room);
      }

      if (data.playerId === auth?.Id) {
        toast.error("You were removed from the room due to connection timeout");
        router.push("/lobby");
        return;
      }

      toast.error(`${data.playerName} left due to connection timeout`);
    },
    [auth?.Id, router]
  );

  // ─── Setup SignalR Events ─────────────────────────────────────────────────────

  useEffect(() => {
    on("JoinedRoom", handleJoinedRoom);
    on("RoomRejoined", handleRoomRejoined);
    on("PlayerJoined", handlePlayerJoined);
    on("PlayerLeft", handleRoomUpdated);
    on("PlayerChangeReady", handlePlayerChangeReady);
    on("GameStarted", handleStartGame);
    on("BotThinking", handleBotThinking);
    on("Error", handleError);
    on("PlayerDisconnected", handlePlayerDisconnected);
    on("PlayerReconnected", handlePlayerReconnected);
    on("PlayerKicked", handlePlayerKicked);

    return () => {
      off("JoinedRoom", handleJoinedRoom);
      off("RoomRejoined", handleRoomRejoined);
      off("PlayerJoined", handlePlayerJoined);
      off("PlayerLeft", handleRoomUpdated);
      off("PlayerChangeReady", handlePlayerChangeReady);
      off("GameStarted", handleStartGame);
      off("BotThinking", handleBotThinking);
      off("Error", handleError);
      off("PlayerDisconnected", handlePlayerDisconnected);
      off("PlayerReconnected", handlePlayerReconnected);
      off("PlayerKicked", handlePlayerKicked);
    };
  }, [
    on,
    off,
    handleJoinedRoom,
    handleRoomRejoined,
    handlePlayerJoined,
    handleRoomUpdated,
    handlePlayerChangeReady,
    handleStartGame,
    handleBotThinking,
    handleError,
    handlePlayerDisconnected,
    handlePlayerReconnected
  ]);

  // ─── Join Room Effect ─────────────────────────────────────────────────────────
  // Grace period: khi F5, BE sẽ tự fire RoomRejoined qua OnConnectedAsync
  // và set hasJoinedRef = true → effect này sẽ không chạy nữa.
  // Nếu grace period hết hoặc vào lần đầu → chạy JoinRoom bình thường.
  useEffect(() => {
    if (!isConnected || !roomId || hasJoinedRef.current) return;

    const initRoom = async () => {
      if (roomId === "new") {
        setIsLoading(false);
        return;
      }

      try {
        setIsJoining(true);

        // ✅ Check room type trước
        const roomInfo = await invoke("GetRoomInfo", roomId);

        console.log("roomInfo", roomInfo);
        if (!roomInfo?.success) {
          toast.error(roomInfo?.error ?? "Room not found");
          router.push("/lobby");
          return;
        }
        setRoom(roomInfo.room);

        if (roomInfo.room?.roomType === "Private") {
          setRoomType("Private");

          const savedPassword = sessionStorage.getItem(`room_pwd_${roomId}`);

          if (savedPassword) {
            await doJoinRoom(savedPassword);
          } else {
            setIsJoining(false);
            setIsLoading(false);
            setShowPasswordModal(true);
          }
          return;
        }

        await doJoinRoom();
      } catch (error) {
        console.error("Failed to init room:", error);
        setIsLoading(false);
        setIsJoining(false);
      }
    };

    initRoom();
  }, [isConnected, roomId, invoke]);

  const doJoinRoom = useCallback(
    async (password?: string) => {
      try {
        setIsJoining(true);
        const result = await invoke("JoinRoom", {
          roomId,
          password: password ?? null
        });
        console.log("123", result);
        if (result?.success && result?.room) {
          setRoom(result.room);
          hasJoinedRef.current = true;
          setIsLoading(false);
          setIsJoining(false);
          setShowPasswordModal(false);
          sessionStorage.removeItem(`room_pwd_${roomId}`);
        } else if (!result?.success) {
          sessionStorage.removeItem(`room_pwd_${roomId}`);
          const toastKey = `joined-room-err`;
          if (!toastShownRef.current.has(toastKey)) {
            toast.error(result?.error ?? "Failed to join room");
            toastShownRef.current.add(toastKey);
          }
          if (result?.error === "Incorrect password") {
            setIsJoining(false);
            return;
          }
          router.push("/lobby");
        }
      } catch (error) {
        console.error("Failed to join room:", error);
        setIsLoading(false);
        setIsJoining(false);
      }
    },
    [roomId, invoke, router]
  );

  // ─── Actions ─────────────────────────────────────────────────────────────────

  const handleLeaveRoom = useCallback(async () => {
    if (!isConnected) {
      toast.error("Not connected to server");
      return;
    }
    try {
      await invoke("LeaveRoom");
      router.push("/lobby");
    } catch (error) {
      console.error("Leave room error:", error);
      toast.error("Failed to leave room");
    }
  }, [isConnected, invoke, router]);

  const handleAddBot = useCallback(async () => {
    if (!isConnected) {
      toast.error("Not connected to server");
      return;
    }
    try {
      const result = await invoke("AddBotToRoom");
      if (!result) {
        toast.error("No response from server");
        return;
      }
      if (result.success) {
        setRoom(result.room);
      } else {
        toast.error(result.error ?? "Failed to add bot");
      }
    } catch (error) {
      console.error("Add bot error:", error);
      toast.error("Failed to add bot to room");
    }
  }, [isConnected, invoke]);

  const handleToggleReady = useCallback(
    async (newReady: boolean) => {
      if (!isConnected) {
        toast.error("Not connected to server");
        return;
      }
      try {
        const result = await invoke("PlayerChangeReady", newReady);
        if (result?.success) setRoom(result.room);
      } catch (error) {
        console.error("Change ready error:", error);
        toast.error("Failed to change ready state");
      }
    },
    [isConnected, invoke]
  );

  const handleToggleStart = useCallback(async () => {
    if (!isConnected) {
      toast.error("Not connected to server");
      return;
    }
    if (hasDisconnectedPlayers) {
      toast.warning("Cannot start game while a player is disconnected");
      return;
    }
    try {
      const result = await invoke("StartGame");
      if (result?.success) {
        router.push(`/game/${roomId}`);
      } else {
        toast.error(result?.error ?? "Failed to start game");
      }
    } catch (error) {
      console.error("Start game error:", error);
      toast.error("Failed to start game");
    }
  }, [isConnected, invoke, hasDisconnectedPlayers, roomId]);

  const handleCopyRoomId = useCallback(async () => {
    if (!room) return;
    try {
      const url = `${window.location.origin}/room/${room.id}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Room link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy room link");
    }
  }, [room]);

  // ─── Render ───────────────────────────────────────────────────────────────────

  if (isBotThinking) {
    return (
      <BotThinkingIndicator visible={isBotThinking} message={botThinkingMsg} />
    );
  }

  if (isLoading || isJoining) {
    return (
      <div className="min-h-[calc(80vh)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4" />
          <p>
            {isJoining ? t("room_detail_joining") : t("room_detail_loading")}
          </p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-[calc(80vh)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t("room_detail_not_found")}
          </h2>
          <p className="text-gray-600 mb-6">
            {t("room_detail_not_found_desc")}
          </p>
          <Button onClick={handleLeaveRoom}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("room_detail_back")}
          </Button>
        </div>
      </div>
    );
  }

  // if(room.roomType === "Private"){
  //   return (
  //     <PasswordModal
  //       isOpen={showPasswordModal}
  //       isJoining={isJoining}
  //       onClose={() => router.push("/lobby")}
  //       onSubmit={(password) => doJoinRoom(password)}
  //     />)
  // }

  return (
    <div className="min-h-[calc(80vh)] bg-gray-50 py-8">
      <PasswordModal
        isOpen={showPasswordModal}
        isJoining={isJoining}
        onClose={() => router.push("/lobby")}
        onSubmit={password => doJoinRoom(password)}
      />
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-2 sm:mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={handleLeaveRoom}
              className="flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("room_detail_back")}
            </Button>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <Wifi className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">
                    {t("lobby_connected")}
                  </span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-600">
                    {t("lobby_disconnected")}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              className={`${room.status === "Waiting" ? "bg-green-500" : "bg-yellow-500"} text-white`}
            >
              {room.status}
            </Badge>
            <Badge variant="outline">{room.roomType}</Badge>
          </div>
        </div>

        {/* Disconnected warning banner */}
        {hasDisconnectedPlayers && (
          <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-lg bg-yellow-50 border border-yellow-300 text-yellow-800 text-sm">
            <DisconnectIcon className="h-4 w-4 shrink-0" />
            <span>
              A player lost connection. Waiting for them to reconnect (30s)...
            </span>
          </div>
        )}

        {/* Room Info */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <CardTitle className="text-2xl">{room.id}</CardTitle>
              <div className="flex gap-2 mt-4 sm:mt-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyRoomId}
                  className="flex items-center gap-2"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {copied ? t("room_detail_copied") : t("room_detail_copy")}
                </Button>
                {isOwner && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleAddBot}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <BotIcon className="h-4 w-4" />
                    {t("room_detail_add_bot")}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex items-center text-gray-600">
                <Users className="mr-2 h-5 w-5" />
                <span className="text-lg font-semibold">
                  {room.currentPlayers}/{room.quantityPlayer}{" "}
                  {t("room_detail_players")}
                </span>
              </div>
              <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{
                    width: `${(room.currentPlayers / room.quantityPlayer) * 100}%`
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Players List */}
        <Card className="mb-2 sm:mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t("room_detail_players_title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {room.players.map(player => (
                <PlayerCard
                  key={player.playerId}
                  player={player}
                  isCurrentUser={player.playerId === auth?.Id}
                  isDisconnected={disconnectedPlayers.has(player.playerId)}
                  canStart={!hasDisconnectedPlayers}
                  onToggleReady={(isReady: boolean) => {
                    if (player.playerId === auth?.Id && player.isOwner) {
                      handleToggleStart();
                      return;
                    }
                    handleToggleReady(isReady);
                  }}
                />
              ))}
              {emptySlots.map((_, index) => (
                <EmptySlot key={`empty-${index}`} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Sub Components ───────────────────────────────────────────────────────────

const PlayerCard = React.memo(
  ({
    player,
    isCurrentUser,
    isDisconnected = false,
    canStart = true,
    onToggleReady
  }: {
    player: RoomPlayer;
    isCurrentUser: boolean;
    isDisconnected?: boolean;
    canStart?: boolean;
    onToggleReady?: (isReady: boolean) => void;
  }) => {
    const t = useTranslations();

    return (
      <div
        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors duration-300 ${
          isDisconnected
            ? "bg-yellow-50 border-yellow-400"
            : isCurrentUser
              ? "bg-blue-50 border-blue-200"
              : "bg-gray-50 border-gray-200"
        }`}
      >
        {/* Avatar */}
        <Avatar className="h-10 w-10">
          <AvatarFallback
            className={`font-semibold text-white transition-colors duration-300 ${
              isDisconnected ? "bg-yellow-500" : "bg-blue-500"
            }`}
          >
            {player.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{player.name}</span>
            {player.isOwner && <Crown className="h-4 w-4 text-yellow-500" />}
            {isDisconnected && (
              <Badge className="bg-yellow-500 text-white text-xs animate-pulse">
                Reconnecting...
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {player.isOwner
                ? t("room_detail_owner")
                : t("room_detail_player")}
            </span>
            {/* Ready badge - ẩn khi disconnect hoặc là owner */}
            {!player.isOwner &&
              !isDisconnected &&
              !isCurrentUser &&
              (player.isReady ? (
                <Badge className="bg-green-500 text-white text-xs">
                  {t("room_detail_ready")}
                </Badge>
              ) : (
                <Badge className="bg-gray-400 text-white text-xs">
                  {t("room_detail_not_ready")}
                </Badge>
              ))}
          </div>
        </div>

        {/* Ready button - chỉ hiện khi không disconnect */}
        {isCurrentUser && !player.isOwner && !isDisconnected && (
          <Button
            size="sm"
            variant={player.isReady ? "destructive" : "default"}
            onClick={() => onToggleReady?.(!player.isReady)}
          >
            {player.isReady ? t("room_detail_unready") : t("room_detail_ready")}
          </Button>
        )}

        {/* Start button cho owner */}
        {isCurrentUser && player.isOwner && (
          <Button
            onClick={() => onToggleReady?.(!player.isReady)}
            size="sm"
            disabled={!canStart}
            title={
              !canStart
                ? "Cannot start while a player is disconnected"
                : undefined
            }
            className={`text-white transition-colors ${
              !canStart
                ? "bg-gray-400 cursor-not-allowed opacity-60"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {t("room_detail_start")}
          </Button>
        )}
      </div>
    );
  }
);

const EmptySlot = React.memo(() => {
  const t = useTranslations();
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-gray-300 bg-gray-50">
      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
        <Users className="h-5 w-5 text-gray-400" />
      </div>
      <div className="flex-1">
        <span className="text-gray-500">{t("room_detail_waiting")}</span>
      </div>
    </div>
  );
});

PlayerCard.displayName = "PlayerCard";
EmptySlot.displayName = "EmptySlot";
