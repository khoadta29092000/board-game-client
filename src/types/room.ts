export interface RoomPlayer {
  isOwner: boolean;
  isReady: boolean;
  name: string;
  playerId: string;
}

export interface StartedRoom {
  startedRoom: Room;
  roomId: string;
}

export interface Room {
  roomId: string;
  id: string;
  currentPlayers: number;
  quantityPlayer: number;
  players: RoomPlayer[];
  roomType: RoomType;
  matchMode?: MatchMode;
  status: RoomStatus;
  gameName: string;
}

export enum MatchMode {
  Casual = "Casual",
  Ranked = "Ranked"
}

export enum RoomType {
  Public = "Public",
  Private = "Private"
}

export enum RoomStatus {
  Waiting = "Waiting",
  Playing = "Playing",
  Finished = "Finished"
}

export function isRankedMode(mode?: MatchMode | string | number | null) {
  return mode === MatchMode.Ranked || mode === "Ranked" || mode === 1;
}

export function isGuestPlayer(id?: string | null) {
  return !!id && id.startsWith("GUEST_");
}

export interface PlayerLeftRoom {
  room: Room;
}
