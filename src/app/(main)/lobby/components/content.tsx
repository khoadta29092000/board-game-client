/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Bot, Loader2, Plus, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { Room } from "@/src/types/room";
import { useSignalR } from "@/src/components/signalR/signalRProvider";
import { LoadingOverlay } from "@/src/components/common/loading";
import { RoomCard } from "@/src/components/splendor/room/roomCard";

export default function ContentLobby() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [joiningRoomId, setJoiningRoomId] = useState<string | null>(null);
  const { isConnected, invoke, on, off } = useSignalR();

  useEffect(() => {
    // Setup SignalR event handlers
    const handleActiveRoomsLoaded = (loadedRooms: Room[]) => {
      setRooms(loadedRooms);
      setIsLoading(false);
    };

    const handleRoomUpdated = (updatedRoom: Room) => {
      setRooms(prevRooms => {
        const existingRoomIndex = prevRooms.findIndex(
          r => r.id === updatedRoom.id
        );
        if (existingRoomIndex >= 0) {
          const newRooms = [...prevRooms];
          newRooms[existingRoomIndex] = updatedRoom;
          return newRooms;
        } else {
          return [...prevRooms, updatedRoom];
        }
      });
    };

    const handleRemoveRoom = (roomId: string) => {
      setRooms(prevRooms => {
        const filteredRooms = prevRooms.filter(room => room.id !== roomId);

        return filteredRooms;
      });
    };

    const handleError = (error: string) => {
      toast.error(error);
      setIsLoading(false);
      setIsCreating(false);
    };

    on("ActiveRoomsLoaded", handleActiveRoomsLoaded);
    on("RoomRemoved", handleRemoveRoom);
    on("RoomUpdated", handleRoomUpdated);
    on("Error", handleError);

    return () => {
      off("ActiveRoomsLoaded", handleActiveRoomsLoaded);
      off("RoomRemoved", handleRemoveRoom);
      off("RoomUpdated", handleRoomUpdated);
      off("Error", handleError);
    };
  }, [on, off, router]);

  useEffect(() => {
    if (isConnected) {
      const initializeRoomList = async () => {
        try {
          await invoke("JoinRoomListGroup");
          await invoke("GetActiveRooms");
        } catch (error) {
          console.error("Failed to initialize room list:", error);
        }
      };

      initializeRoomList();
    }
  }, [isConnected, invoke]);

  const handleCreateRoom = async () => {
    if (!isConnected) {
      toast.error("Not connected to server");
      return;
    }

    try {
      setIsCreating(true);
      off("RoomUpdated");
      const roomId = await invoke("createRoom");
      if (roomId.room) {
        router.push(`/lobby/${roomId.room.id}`);
      }
    } catch (error) {
      console.error("Create room error:", error);
      toast.error("Failed to create room");
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    if (!isConnected) return toast.error("Not connected");
    // Set loading NGAY LẬP TỨC trước khi làm gì khác
    setJoiningRoomId(roomId);
    try {
      off("RoomUpdated");
      await router.push(`/lobby/${roomId}`);
    } catch {
      toast.error("Failed to join room");
      setJoiningRoomId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(80vh)] flex items-center justify-center bg-gray-50 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-16 h-16">
            {["#a78bfa", "#60a5fa", "#4ade80", "#f87171", "#fbbf24"].map(
              (color, i) => (
                <div
                  key={i}
                  className="dot absolute"
                  style={
                    {
                      // set CSS variable --r for this dot and stagger animation
                      ["--r" as any]: `${i * (360 / ["#a78bfa", "#60a5fa", "#4ade80", "#f87171", "#fbbf24"].length)}deg`,
                      ["--delay" as any]: `${i * 0.14}s`,
                      background: color
                    } as React.CSSProperties
                  }
                />
              )
            )}

            {/* styles */}
            <style>{`
              .dot {
                width: 12px;
                height: 12px;
                border-radius: 9999px;
                top: 50%;
                left: 50%;
                margin-top: -6px; /* center the circle */
                margin-left: -6px;
                transform: rotate(var(--r)) translateY(-28px); /* initial position */
                animation: pulse 1.4s ease-in-out infinite;
                animation-delay: var(--delay);
              }

              @keyframes pulse {
                0%,
                100% {
                  opacity: 0.25;
                  transform: rotate(var(--r)) translateY(-28px) scale(0.7);
                }
                50% {
                  opacity: 1;
                  transform: rotate(var(--r)) translateY(-28px) scale(1.15);
                }
              }
            `}</style>
          </div>

          <div className="text-center">
            <p className="text-black font-semibold text-lg">Loading Rooms</p>
            <p className="text-gray-500 text-sm mt-1">
              Connecting to game server...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-[calc(80vh)] flex items-center justify-center">
        <div className="text-center">
          <WifiOff className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Connection Failed
          </h2>
          <p className="text-gray-600 mb-4"></p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {joiningRoomId && <LoadingOverlay message="Joining room..." />}
      {isCreating && <LoadingOverlay message="Creating room..." />}
      <div className="sm:min-h-[calc(80vh)] bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Game Rooms</h1>
              <p className="text-gray-600 mt-2">
                Join an existing room or create your own
              </p>
              <div className="flex items-center gap-2 mt-2">
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
            <div className="flex gap-2">
              <Button
                onClick={() => router.push(`/tutorial`)}
                className="bg-green-600 hover:bg-green-700"
              >
                <>
                  <Bot className="mr-2 h-4 w-4" />
                  Tutorial
                </>
              </Button>
              <Button
                onClick={handleCreateRoom}
                disabled={isCreating || !isConnected}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Room
                  </>
                )}
              </Button>
            </div>
          </div>

          {rooms.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-white rounded-lg shadow-md p-8">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No active rooms
                </h3>
                <p className="text-gray-500 mb-4">
                  Be the first to create a room and start playing!
                </p>
                <Button
                  onClick={handleCreateRoom}
                  disabled={isCreating || !isConnected}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Room
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map(room => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onJoin={handleJoinRoom}
                  joiningRoomId={joiningRoomId}
                  isConnected={isConnected}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
