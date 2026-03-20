"use client";

import React, { useState } from "react";
import { useAuth } from "@/src/redux/global/selectors";
import HistoryStats from "@/src/components/history/historyStat";
import HistoryCard from "@/src/components/history/historyCard";
import { useGetMyHistory } from "@/src/hook/history/useGetMyHistory";
import { cn } from "@/src/utils";

type Filter = "all" | "win" | "loss";

export default function ContentHistory() {
  const profile = useAuth();
  const myId = profile?.Id;
  const { data = [], isError, isLoading } = useGetMyHistory();
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = data.filter(h => {
    if (filter === "win") return h.players[myId ?? ""]?.isWinner;
    if (filter === "loss") return !h.players[myId ?? ""]?.isWinner;
    return true;
  });

  const wins = data.filter(h => h.players[myId ?? ""]?.isWinner).length;
  const losses = data.filter(h => !h.players[myId ?? ""]?.isWinner).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-gray-900">Match History</h1>
          <p className="text-sm text-gray-500">Your Splendor game records</p>
        </div>

        {/* Stats */}
        {!isLoading && data.length > 0 && myId && (
          <HistoryStats histories={data} myId={myId} />
        )}

        {/* Filter */}
        {data.length > 0 && (
          <div className="flex gap-1 p-1 mb-4 rounded-lg border bg-white">
            {(["all", "win", "loss"] as Filter[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "flex-1 py-1.5 rounded-md text-xs font-bold uppercase transition",
                  filter === f
                    ? f === "win"
                      ? "bg-green-500 text-white"
                      : f === "loss"
                        ? "bg-red-500 text-white"
                        : "bg-indigo-500 text-white"
                    : "text-gray-500 hover:bg-gray-100"
                )}
              >
                {f === "all"
                  ? `All (${data.length})`
                  : f === "win"
                    ? `Wins (${wins})`
                    : `Losses (${losses})`}
              </button>
            ))}
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-500">
            {isError}
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && data.length === 0 ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-[72px] animate-pulse rounded-xl border bg-white"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-500">
            {filter === "all" ? "No games played yet" : `No ${filter}s found`}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((h, i) => (
              <HistoryCard
                key={h.id}
                history={h}
                myId={myId}
                defaultExpanded={i === 0}
              />
            ))}
          </div>
        )}

        {isLoading && data.length > 0 && (
          <div className="text-center text-sm text-gray-500 py-4">
            Loading...
          </div>
        )}
      </div>
    </div>
  );
}
