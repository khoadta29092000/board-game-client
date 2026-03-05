// =====================================================================
// src/api/historyApi.ts
// =====================================================================

import api from "../api";
import {
  GameHistory,
  HistoryListResponse,
  TParamHistory,
  TParamHistoryByGame
} from "@/src/types/history";

export const callMyHistoryApi = async (params: { limit: number }) => {
  const response = await api.get<HistoryListResponse>(
    `/GameHistory/my-history`,
    {
      params: {
        limit: params.limit ?? 20
      }
    }
  );

  return response.data;
};
export const callPlayerHistoryApi = async (params: TParamHistory) => {
  const response = await api.get<HistoryListResponse>(
    `/GameHistory/player/${params.playerId}`,
    {
      params: {
        gameName: params.gameName ?? "Splendor",
        limit: params.limit ?? 20
      }
    }
  );

  return response.data;
};

export const callHistoryByGameApi = async (data: TParamHistoryByGame) => {
  const response = await api.get<HistoryListResponse>(
    `/GameHistory/game/${data.gameName}`,
    {
      params: { skip: data.skip, limit: data.limit }
    }
  );

  return response.data;
};

export const callHistoryDetailApi = async (gameId: string) => {
  const response = await api.get<{
    statusCode: number;
    message: string;
    data: GameHistory;
  }>(`/GameHistory/${gameId}`);

  return response.data;
};
