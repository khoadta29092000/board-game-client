/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef
} from "react";
import { useRouter, useParams } from "next/navigation";
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
  WifiOff
} from "lucide-react";
import { toast } from "sonner";
import { PlayerLeftRoom, Room, RoomPlayer } from "@/src/types/room";
import { useSignalR } from "@/src/components/signalR/signalRProvider";

export default function ContentRoomDetail() {
  const router = useRouter();
  const params = useParams();

  const roomId = params.id as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // Refs để tránh duplicate events
  const hasJoinedRef = useRef(false);
  const toastShownRef = useRef(new Set<string>());

  const { isConnected, invoke, on, off } = useSignalR();

  // Memoized current user check
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    setCurrentUserId(userId);
  }, []);

  // Memoized handlers để tránh re-render
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

  const handleRoomUpdated = (playerLeft: PlayerLeftRoom) => {
    setRoom(playerLeft.room);
  };

  const handlePlayerJoined = useCallback(
    (data: { playerId: string; playerName: string; room: Room }) => {
      // Only update if it's not the current user joining (to avoid duplicate toast)
      if (data.playerId !== currentUserId) {
        setRoom(data.room);

        const toastKey = `player-joined-${data.playerId}-${Date.now()}`;
        if (!toastShownRef.current.has(toastKey)) {
          toast.success(`${data.playerName} joined the room`);
          toastShownRef.current.add(toastKey);

          // Clean up old toast keys to prevent memory leak
          setTimeout(() => {
            toastShownRef.current.delete(toastKey);
          }, 5000);
        }
      }
    },
    [currentUserId]
  );

  const handleError = useCallback(
    (error: string) => {
      const toastKey = `error-${error}`;
      if (!toastShownRef.current.has(toastKey)) {
        toast.error(error);
        toastShownRef.current.add(toastKey);
      }

      setIsLoading(false);
      setIsJoining(false);

      // Handle specific errors
      if (error.includes("not found") || error.includes("Room not found")) {
        setTimeout(() => router.push("/lobby"), 2000);
      }
    },
    [router]
  );

  const handleLeaveRoom = useCallback(async () => {
    if (!isConnected) {
      toast.error("Not connected to server");
      return;
    }
    try {
      const room = await invoke("leaveRoom");
      if (room.success) {
        router.push("/lobby");
        return;
      }
    } catch (error) {
      console.error("Leave room error:", error);
      toast.error("Failed to leave room");
    }
  }, [isConnected, invoke, router]);

  const handleJoinRoomError = (data: { error: string }) => {
    const toastKey = `joined-room-err`;
    if (!toastShownRef.current.has(toastKey)) {
      toast.error(data.error);
      toastShownRef.current.add(toastKey);
    }
    router.push("/lobby");
  };

  // Setup SignalR event handlers with stable references
  useEffect(() => {
    on("JoinedRoom", handleJoinedRoom);
    on("PlayerJoined", handlePlayerJoined);
    on("Error", handleError);
    on("PlayerLeft", handleRoomUpdated);
    on("JoinRoomError", handleJoinRoomError);

    return () => {
      off("JoinedRoom", handleJoinedRoom);
      off("PlayerJoined", handlePlayerJoined);
      off("Error", handleError);
      off("JoinRoomError", handleJoinRoomError);
      off("PlayerLeft", handleRoomUpdated);
    };
  }, [on, off, handleJoinedRoom, handlePlayerJoined, handleError]);

  // Join room effect với dependency optimization
  useEffect(() => {
    if (!isConnected || !roomId || hasJoinedRef.current) {
      return;
    }

    const joinRoom = async () => {
      if (roomId === "new") {
        setIsLoading(false);
        return;
      }

      try {
        setIsJoining(true);
        const room = await invoke("JoinRoom", roomId);

        if (room?.room) {
          setIsJoining(false);
          setIsLoading(false);
          setRoom(room.room);
        }
      } catch (error) {
        console.error("Failed to join room:", error);
        setIsLoading(false);
        setIsJoining(false);
      }
    };

    joinRoom();
  }, [isConnected, roomId, invoke]);

  const handleCopyRoomId = useCallback(async () => {
    if (!room) return;

    try {
      const url = `${window.location.origin}/room/${room.id}`;
      await navigator.clipboard.writeText(url);

      setCopied(true);
      toast.success("Room link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy room link");
    }
  }, [room]);

  const handleStartGame = useCallback(async () => {
    if (!isConnected) {
      toast.error("Not connected to server");
      return;
    }
    toast.info("Start game functionality will be implemented soon!");
  }, [isConnected]);

  // Memoized computed values
  const isOwner = useMemo(
    () =>
      room?.players.find(p => p.playerId === currentUserId)?.isOwner ?? false,
    [room?.players, currentUserId]
  );

  const canStartGame = useMemo(
    () =>
      isOwner && room?.status === "Waiting" && room && room.currentPlayers >= 2,
    [isOwner, room?.status, room?.currentPlayers]
  );

  const emptySlots = useMemo(
    () =>
      room
        ? Array.from({ length: room.quantityPlayer - room.currentPlayers })
        : [],
    [room?.quantityPlayer, room?.currentPlayers]
  );

  // Loading state
  if (isLoading || isJoining) {
    return (
      <div className="min-h-[calc(80vh)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4" />
          <p>{isJoining ? "Joining room..." : "Loading room..."}</p>
        </div>
      </div>
    );
  }

  // Room not found state
  if (!room) {
    return (
      <div className="min-h-[calc(80vh)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Room not found
          </h2>
          <p className="text-gray-600 mb-6">
            The room you&rsquo;re looking for doesn&rsquo;t exist or has been
            closed.
          </p>
          <Button onClick={handleLeaveRoom}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Rooms
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(80vh)] bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={handleLeaveRoom}
              className="flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Rooms
            </Button>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <Wifi className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-600">Disconnected</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              className={`${
                room.status === "Waiting" ? "bg-green-500" : "bg-yellow-500"
              } text-white`}
            >
              {room.status}
            </Badge>
            <Badge variant="outline">{room.roomType}</Badge>
          </div>
        </div>

        {/* Room Info */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">{room.id}</CardTitle>
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
                {copied ? "Copied!" : "Copy Room ID"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex items-center text-gray-600">
                <Users className="mr-2 h-5 w-5" />
                <span className="text-lg font-semibold">
                  {room.currentPlayers}/{room.quantityPlayer} Players
                </span>
              </div>
              <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{
                    width: `${
                      (room.currentPlayers / room.quantityPlayer) * 100
                    }%`
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Players List */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Players in Room</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {room.players.map(player => (
                <PlayerCard
                  key={player.playerId}
                  player={player}
                  isCurrentUser={player.playerId === currentUserId}
                />
              ))}

              {/* Empty Slots */}
              {emptySlots.map((_, index) => (
                <EmptySlot key={`empty-${index}`} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Game Actions */}
        <GameActions
          room={room}
          isOwner={isOwner}
          canStartGame={canStartGame}
          isConnected={isConnected}
          onStartGame={handleStartGame}
        />
      </div>
    </div>
  );
}

// Memoized sub-components để tránh re-render
const PlayerCard = React.memo(
  ({
    player,
    isCurrentUser
  }: {
    player: RoomPlayer;
    isCurrentUser: boolean;
  }) => (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border ${
        isCurrentUser
          ? "bg-blue-50 border-blue-200"
          : "bg-gray-50 border-gray-200"
      }`}
    >
      <Avatar className="h-10 w-10">
        <AvatarFallback className="bg-blue-500 text-white font-semibold">
          {player.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{player.name}</span>
          {player.isOwner && <Crown className="h-4 w-4 text-yellow-500" />}
          {isCurrentUser && (
            <Badge variant="secondary" className="text-xs">
              You
            </Badge>
          )}
        </div>
        <span className="text-sm text-gray-500">
          {player.isOwner ? "Room Owner" : "Player"}
        </span>
      </div>
    </div>
  )
);

const EmptySlot = React.memo(() => (
  <div className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-gray-300 bg-gray-50">
    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
      <Users className="h-5 w-5 text-gray-400" />
    </div>
    <div className="flex-1">
      <span className="text-gray-500">Waiting for player...</span>
    </div>
  </div>
));

const GameActions = React.memo(
  ({
    room,
    isOwner,
    canStartGame,
    isConnected,
    onStartGame
  }: {
    room: Room;
    isOwner: boolean;
    canStartGame: boolean;
    isConnected: boolean;
    onStartGame: () => void;
  }) => {
    if (room.status === "Playing") {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-yellow-600 mb-2">
                Game in Progress
              </h3>
              <p className="text-gray-600">
                The game is currently being played.
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (room.status === "Waiting") {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              {isOwner ? (
                <>
                  <h3 className="text-lg font-semibold">Ready to Start?</h3>
                  <p className="text-gray-600">
                    {room.currentPlayers >= 2
                      ? "You can start the game now or wait for more players."
                      : "You need at least 2 players to start the game."}
                  </p>
                  <Button
                    onClick={onStartGame}
                    disabled={!canStartGame || !isConnected}
                    size="lg"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Start Game
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold">
                    Waiting for Game to Start
                  </h3>
                  <p className="text-gray-600">
                    The room owner will start the game when ready.
                  </p>
                  <div className="flex justify-center">
                    <Loader2 className="animate-spin h-6 w-6 text-blue-500" />
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    return null;
  }
);

PlayerCard.displayName = "PlayerCard";
EmptySlot.displayName = "EmptySlot";
GameActions.displayName = "GameActions";
