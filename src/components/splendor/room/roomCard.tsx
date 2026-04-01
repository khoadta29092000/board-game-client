import { Room, RoomType } from "@/src/types/room";
import { Crown, Lock, Play, Swords, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";

export function RoomCard({
  room,
  onJoin,
  joiningRoomId,
  isConnected
}: {
  room: Room;
  onJoin: (id: string, type: string) => void;
  joiningRoomId: string | null;
  isConnected: boolean;
}) {
  const isFull = room.currentPlayers >= room.quantityPlayer;
  const isPrivate = room.roomType === RoomType.Private;

  const statusConfig = {
    Waiting: { color: "#4ade80", label: "Waiting", dot: "bg-green-400" },
    Playing: { color: "#facc15", label: "In Progress", dot: "bg-yellow-400" },
    Finished: { color: "#6b7280", label: "Finished", dot: "bg-gray-500" }
  };
  const status =
    statusConfig[room.status as keyof typeof statusConfig] ??
    statusConfig.Finished;

  return (
    <Card key={room.id} className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <CardTitle className="capitalize text-lg">{room.roomId}</CardTitle>
            {/* ✅ RoomType badge */}
            {isPrivate ? (
              <Badge className="flex items-center gap-1 hover:bg-yellow-200 bg-yellow-100 text-yellow-700 border border-yellow-300 text-xs">
                <Lock className="w-3 h-3" />
                Private
              </Badge>
            ) : (
              <Badge className="hover:bg-green-200 bg-green-100 text-green-700 border border-green-300 text-xs">
                Public
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot} animate-pulse`} />
            <span className="text-xs text-gray-400">{status.label}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-sm text-gray-500">Players</span>
              </div>
              <span
                className="text-xs font-bold"
                style={{ color: isFull ? "#f87171" : "#4ade80" }}
              >
                {room.currentPlayers}/{room.quantityPlayer}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-gray-400 mb-3">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(room.currentPlayers / room.quantityPlayer) * 100}%`,
                  background: isFull
                    ? "linear-gradient(90deg, #f87171, #ef4444)"
                    : "linear-gradient(90deg, #4ade80, #22c55e)"
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="space-y-1">
              {room.players.map(player => (
                <div key={player.playerId} className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: "rgba(167,139,250,0.2)", color: "#a78bfa" }}
                  >
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-600 truncate flex-1">
                    {player.name}
                  </span>
                  {player.isOwner && (
                    <Crown className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  )}
                </div>
              ))}
              {Array.from({ length: room.quantityPlayer - room.currentPlayers }).map((_, i) => (
                <div key={`empty-${i}`} className="flex items-center gap-2 opacity-30">
                  <div className="w-5 h-5 rounded-full border border-dashed border-gray-600" />
                  <span className="text-sm text-gray-600">Waiting...</span>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={() => onJoin(room.id, room.roomType)}
            disabled={
              room.status !== "Waiting" ||
              isFull ||
              !isConnected
            }
            className="w-full"
            variant={room.status === "Waiting" ? "default" : "secondary"}
          >
            {room.status === "Playing" ? (
              <>
                <Play className="mr-2 h-4 w-4" />
                Game in Progress
              </>
            ) : isFull ? (
              "Room Full"
            ) : isPrivate ? (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Join Private Room
              </>
            ) : (
              <>
                <Swords className="w-4 h-4 mr-2" />
                Join Room
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}