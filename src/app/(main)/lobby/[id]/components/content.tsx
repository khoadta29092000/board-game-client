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
import { useAuth } from "@/src/redux/global/selectors";

export default function ContentRoomDetail() {
  const router = useRouter();
  const params = useParams();
  const auth = useAuth();

  const roomId = params.id as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // Refs để tránh duplicate events
  const hasJoinedRef = useRef(false);
  const toastShownRef = useRef(new Set<string>());

  const { isConnected, invoke, on, off } = useSignalR();

  // Memoized current user check

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
      if (data.playerId !== auth?.id) {
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
    [auth?.id]
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

  const handleToggleReady = useCallback(
    async (newReady: boolean) => {
      if (!isConnected) {
        toast.error("Not connected to server");
        return;
      }
      try {
        const room = await invoke("PlayerChangeReady", newReady);
        console.log("player change ready", room);
        if (room.success) {
          setRoom(room.room);
          return;
        }
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
    try {
      const room = await invoke("StartGame");
      if (room.success) {
        router.push(`/game/${roomId}`);
        return;
      } else {
        console.log("game is not start", room.error);
        toast.error(room.error);
      }
    } catch (error) {
      console.error("Change ready error:", error);
      toast.error("Failed to change ready state");
    }
  }, [isConnected, invoke]);

  const handleStartGame = useCallback(() => {
    router.push(`/game/${roomId}`);
    console.log(" chu phong da bat dau");
  }, []);

  const handlePlayerChangeReady = useCallback((data: { updatedRoom: Room }) => {
    // Only update if it's not the current user joining (to avoid duplicate toast)
    if (data) {
      console.log("updatedRoom", data);
      setRoom(data.updatedRoom);
    }
  }, []);

  // Setup SignalR event handlers with stable references
  useEffect(() => {
    on("JoinedRoom", handleJoinedRoom);
    on("PlayerJoined", handlePlayerJoined);
    on("Error", handleError);
    on("PlayerLeft", handleRoomUpdated);
    on("PlayerChangeReady", handlePlayerChangeReady);
    on("GameStarted", handleStartGame);

    return () => {
      off("JoinedRoom", handleJoinedRoom);
      off("PlayerJoined", handlePlayerJoined);
      off("Error", handleError);
      off("PlayerLeft", handleRoomUpdated);
      off("PlayerChangeReady", handleStartGame);
      on("off", handleStartGame);
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
        if (!room?.success) {
          const toastKey = `joined-room-err`;
          if (!toastShownRef.current.has(toastKey)) {
            toast.error(room.error);
            toastShownRef.current.add(toastKey);
          }
          router.push("/lobby");
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

  // Memoized computed values
  const isOwner = useMemo(
    () => room?.players.find(p => p.playerId === auth?.id)?.isOwner ?? false,
    [room?.players, auth.id]
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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Players in Room</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {room.players.map(player => (
                <PlayerCard
                  key={player.playerId}
                  player={player}
                  isCurrentUser={player.playerId === auth.id}
                  onToggleReady={(isReady: boolean) => {
                    if (player.playerId === auth.id && player.isOwner) {
                      handleToggleStart();
                      return;
                    }
                    handleToggleReady(isReady);
                  }}
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
      </div>
    </div>
  );
}

// Memoized sub-components để tránh re-render
const PlayerCard = React.memo(
  ({
    player,
    isCurrentUser,
    onToggleReady
  }: {
    player: RoomPlayer;
    isCurrentUser: boolean;
    onToggleReady?: (isReady: boolean) => void;
  }) => {
    const handleToggle = (isReady: boolean) => {
      if (onToggleReady) {
        onToggleReady(isReady);
      }
    };

    return (
      <div
        className={`flex items-center gap-3 p-3 rounded-lg border ${
          isCurrentUser
            ? "bg-blue-50 border-blue-200"
            : "bg-gray-50 border-gray-200"
        }`}
      >
        {/* Avatar */}
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-blue-500 text-white font-semibold">
            {player.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Info */}
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

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {player.isOwner ? "Room Owner" : "Player"}
            </span>

            {/* Trạng thái Ready */}
            {player.isReady ? (
              <Badge className="bg-green-500 text-white text-xs">Ready</Badge>
            ) : (
              <Badge className="bg-gray-400 text-white text-xs">
                Not Ready
              </Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        {isCurrentUser && !player.isOwner && (
          <Button
            size="sm"
            variant={player.isReady ? "destructive" : "default"}
            onClick={() => handleToggle(!player.isReady)}
          >
            {player.isReady ? "Unready" : "Ready"}
          </Button>
        )}

        {/* Nếu là Owner + CurrentUser thì có thể Start Game */}
        {isCurrentUser && player.isOwner && (
          <Button
            onClick={() => handleToggle(!player.isReady)}
            size="sm"
            className="bg-green-600 text-white"
          >
            Start Game
          </Button>
        )}
      </div>
    );
  }
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

PlayerCard.displayName = "PlayerCard";
EmptySlot.displayName = "EmptySlot";
