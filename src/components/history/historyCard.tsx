"use client";

import React, { useState } from "react";
import { GameHistory, GamePlayerInfo } from "@/src/types/history";
import { cn } from "@/src/utils";

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function RankBadge({ rank }: { rank: number }) {
  const colors: Record<number, string> = {
    1: "bg-yellow-400 text-black",
    2: "bg-slate-400 text-black",
    3: "bg-amber-700 text-white"
  };

  return (
    <div
      className={cn(
        "w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold",
        colors[rank] ?? "bg-gray-200 text-gray-700"
      )}
    >
      {rank <= 3 ? ["🥇", "🥈", "🥉"][rank - 1] : `#${rank}`}
    </div>
  );
}

function PlayerRow({ info, isMe }: { info: GamePlayerInfo; isMe?: boolean }) {
  const stats = info.stats as Record<string, number>;

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md border",
        isMe ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"
      )}
    >
      <RankBadge rank={info.rank} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="font-semibold text-gray-800 truncate">
            {info.name}
          </span>

          {isMe && <span className="text-xs text-blue-500">(you)</span>}

          {info.isWinner && <span>👑</span>}
        </div>

        <div className="flex gap-3 text-xs text-gray-500 flex-wrap">
          {stats.cardsOwned != null && <span>🃏 {stats.cardsOwned}</span>}
          {stats.noblesVisited != null && <span>👑 {stats.noblesVisited}</span>}
          {stats.turnsPlayed != null && <span>🔄 {stats.turnsPlayed}</span>}
        </div>
      </div>

      <div className="text-right">
        <div className="font-bold text-yellow-500 text-lg">{info.score}</div>
        <div className="text-[10px] text-gray-400">pts</div>
      </div>
    </div>
  );
}

type Props = {
  history: GameHistory;
  myId?: string;
  defaultExpanded?: boolean;
};

export default function HistoryCard({
  history,
  myId,
  defaultExpanded = false
}: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const myInfo = myId ? history.players[myId] : null;
  const isWin = myInfo?.isWinner ?? false;

  const sortedPlayers = history.playerOrder
    .map(id => history.players[id])
    .filter(Boolean)
    .sort((a, b) => a.rank - b.rank);

  return (
    <div
      className={cn(
        "rounded-xl border bg-white shadow-sm transition",
        isWin ? "border-green-300" : "border-red-300"
      )}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <div
          className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center text-xl border",
            isWin ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"
          )}
        >
          {isWin ? "🏆" : "💀"}
        </div>

        <div className="flex-1">
          <div
            className={cn(
              "font-bold text-lg",
              isWin ? "text-green-600" : "text-red-500"
            )}
          >
            {isWin ? "Victory" : "Defeat"}
          </div>

          <div className="flex gap-4 text-xs text-gray-500">
            <span>👥 {sortedPlayers.length}</span>
            <span>
              🔄 {Math.floor((history.totalTurns + 1) / sortedPlayers.length)}
            </span>
            <span>⏱ {formatDuration(history.durationSeconds)}</span>
          </div>
        </div>

        <div className="text-right text-xs text-gray-400">
          {formatDate(history.completedAt)}
        </div>

        <div
          className={cn("text-gray-400 transition", expanded && "rotate-180")}
        >
          ▼
        </div>
      </button>

      {expanded && (
        <div className="border-t px-3 py-3 space-y-1 bg-gray-50">
          {sortedPlayers.map(p => (
            <PlayerRow key={p.playerId} info={p} isMe={p.playerId === myId} />
          ))}

          <div className="text-xs text-gray-400 pt-2 flex gap-4 flex-wrap">
            <span>Game ID: {history.gameId}</span>
            <span>
              Started: {history.startedAt ? formatDate(history.startedAt) : "—"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
