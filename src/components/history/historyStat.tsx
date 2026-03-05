"use client";

import React from "react";
import { GameHistory } from "@/src/types/history";

type Props = { histories: GameHistory[]; myId: string };

export default function HistoryStats({ histories, myId }: Props) {
  const total = histories.length;
  const wins = histories.filter(h => h.players[myId]?.isWinner).length;
  const losses = total - wins;

  const winRate = total ? Math.round((wins / total) * 100) : 0;

  const totalScore = histories.reduce(
    (acc, h) => acc + (h.players[myId]?.score ?? 0),
    0
  );

  const avgScore = total ? Math.round(totalScore / total) : 0;

  const avgDuration = total
    ? Math.round(histories.reduce((a, h) => a + h.durationSeconds, 0) / total)
    : 0;

  const stats = [
    { label: "Games", value: total, color: "text-purple-500" },
    { label: "Wins", value: wins, color: "text-green-500" },
    { label: "Losses", value: losses, color: "text-red-500" },
    {
      label: "Win Rate",
      value: `${winRate}%`,
      color: winRate >= 50 ? "text-green-500" : "text-red-500"
    },
    { label: "Avg Score", value: avgScore, color: "text-yellow-500" },
    {
      label: "Avg Time",
      value: `${Math.floor(avgDuration / 60)}m`,
      color: "text-blue-500"
    }
  ];

  return (
    <div className="grid grid-cols-3 gap-2 mb-5">
      {stats.map(s => (
        <div key={s.label} className="rounded-lg border bg-white p-3">
          <div className={`font-bold text-lg ${s.color}`}>{s.value}</div>
          <div className="text-[10px] uppercase text-gray-400">{s.label}</div>
        </div>
      ))}

      <div className="col-span-3 rounded-lg border bg-white p-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Win / Loss ratio</span>
          <span>
            {wins}W — {losses}L
          </span>
        </div>

        <div className="h-2 bg-gray-200 rounded">
          <div
            className="h-full bg-green-500 rounded transition-all"
            style={{ width: `${winRate}%` }}
          />
        </div>
      </div>
    </div>
  );
}
