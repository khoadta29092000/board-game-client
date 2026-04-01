"use client";

import React from "react";
import { GameHistory } from "@/src/types/history";
import { useTranslations } from "next-intl";

type Props = { histories: GameHistory[]; myId: string };

export default function HistoryStats({ histories, myId }: Props) {
  const t = useTranslations();
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
    { label: t("history_stats_games"), value: total, color: "text-purple-500" },
    { label: t("history_stats_wins"), value: wins, color: "text-green-500" },
    { label: t("history_stats_losses"), value: losses, color: "text-red-500" },
    {
      label: t("history_stats_winrate"),
      value: `${winRate}%`,
      color: winRate >= 50 ? "text-green-500" : "text-red-500"
    },
    { label: t("history_stats_avg_score"), value: avgScore, color: "text-yellow-500" },
    {
      label: t("history_stats_avg_time"),
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
          <span>{t("history_stats_win_ratio")}</span>
          <span>
            {wins}{t("history_stats_w")} — {losses}{t("history_stats_l")}
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
