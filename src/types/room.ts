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
  status: RoomStatus;
  gameName: string;
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

export interface PlayerLeftRoom {
  room: Room;
}
