"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Loader2, Users, Play, Plus, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { Room } from "@/src/types/room";
import { useSignalR } from "@/src/components/signalR/signalRProvider";

export default function ContentLobby() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

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
    if (!isConnected) {
      toast.error("Not connected to server");
      return;
    }

    try {
      off("RoomUpdated");
      router.push(`/lobby/${roomId}`);
    } catch (error) {
      console.error("Join room error:", error);
      toast.error("Failed to join room");
    }
  };

  const getRoomStatusColor = (status: string) => {
    switch (status) {
      case "Waiting":
        return "bg-green-500";
      case "Playing":
        return "bg-yellow-500";
      case "Finished":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(80vh)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4" />
          <p>{"Loading rooms..."}</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.length == 0 ? (
              <div className="text-center py-16">
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
              rooms.map(room => (
                <Card
                  key={room.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{room.roomId}</CardTitle>
                      <Badge
                        className={`${getRoomStatusColor(
                          room.status
                        )} text-white`}
                      >
                        {room.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="mr-1 h-4 w-4" />
                          {room.currentPlayers}/{room.quantityPlayer} players
                        </div>
                        <Badge variant="outline">{room.roomType}</Badge>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">
                          Players:
                        </p>
                        <div className="space-y-1">
                          {room.players.map(player => (
                            <div
                              key={player.playerId}
                              className="flex items-center justify-between text-sm"
                            >
                              <span>{player.name}</span>
                              {player.isOwner && (
                                <Badge variant="secondary" className="text-xs">
                                  Owner
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleJoinRoom(room.id)}
                        disabled={
                          room.status !== "Waiting" ||
                          room.currentPlayers >= room.quantityPlayer ||
                          !isConnected
                        }
                        className="w-full"
                        variant={
                          room.status === "Waiting" ? "default" : "secondary"
                        }
                      >
                        {room.status === "Playing" ? (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            Game in Progress
                          </>
                        ) : room.currentPlayers >= room.quantityPlayer ? (
                          "Room Full"
                        ) : (
                          "Join Room"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
