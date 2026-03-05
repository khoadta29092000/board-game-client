"use client";
import {
  playLoopSound,
  playSound,
  stopSound
} from "@/src/sounds.ts/splendorSounds";
import { SplendorGameState } from "@/src/types/splendor";
import React, { useEffect } from "react";

export function GameOverOverlay({
  gameState,
  myId,
  onLeave
}: {
  gameState: SplendorGameState;
  myId: string;
  onLeave: () => void;
}) {
  const winnerId = gameState.info?.winnerId;
  const players = gameState.players ? Object.values(gameState.players) : [];
  const winner = players.find(p => p.playerId === winnerId);
  const isIWon = winnerId === myId;
  const sorted = [...players].sort((a, b) => b.points - a.points);
  useEffect(() => {
    playSound("endGame");

    return () => {
      stopSound("endGame"); // dừng khi component unmount
    };
  }, []);
  const handleLeave = () => {
    stopSound("endGame"); // dừng khi back lobby
    onLeave();
  };
  playLoopSound("endGame");
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.88)",
        backdropFilter: "blur(10px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        padding: 16
      }}
    >
      {/* Trophy */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 80, lineHeight: 1 }}>
          {isIWon ? "🏆" : "🎮"}
        </div>
        <div
          style={{
            color: isIWon ? "#facc15" : "#e5e7eb",
            fontWeight: 900,
            fontSize: 38,
            marginTop: 8,
            textShadow: isIWon ? "0 0 40px rgba(250,204,21,0.7)" : undefined,
            letterSpacing: -1
          }}
        >
          {isIWon ? "You Win! 🎉" : "Game Over"}
        </div>
        {winner && !isIWon && (
          <div style={{ color: "#9ca3af", fontSize: 16, marginTop: 6 }}>
            <span style={{ color: "#facc15", fontWeight: 700 }}>
              {winner.name}
            </span>{" "}
            wins the game!
          </div>
        )}
      </div>

      {/* Leaderboard */}
      <div
        style={{
          background: "rgba(17,24,39,0.95)",
          borderRadius: 16,
          border: "1px solid #374151",
          padding: "16px 20px",
          width: "min(380px, 92vw)"
        }}
      >
        <div
          style={{
            color: "#6b7280",
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: 2,
            textAlign: "center",
            marginBottom: 12
          }}
        >
          Final Standings
        </div>

        {sorted.map((player, idx) => {
          const isWinner = player.playerId === winnerId;
          const isMe = player.playerId === myId;
          const medal =
            idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : null;

          return (
            <div
              key={player.playerId}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                borderRadius: 10,
                marginBottom: 8,
                background: isWinner
                  ? "rgba(250,204,21,0.1)"
                  : "rgba(55,65,81,0.3)",
                border: `1px solid ${isWinner ? "#facc15" : "#374151"}`
              }}
            >
              <span
                style={{
                  fontSize: medal ? 22 : 14,
                  width: 28,
                  textAlign: "center",
                  flexShrink: 0,
                  color: "#9ca3af"
                }}
              >
                {medal ?? `#${idx + 1}`}
              </span>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    color: isWinner ? "#facc15" : "white",
                    fontWeight: 700,
                    fontSize: 15,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}
                >
                  {player.name}
                  {isMe && (
                    <span
                      style={{
                        color: "#60a5fa",
                        fontSize: 11,
                        marginLeft: 6,
                        fontWeight: 400
                      }}
                    >
                      (you)
                    </span>
                  )}
                </div>
                <div style={{ color: "#6b7280", fontSize: 11, marginTop: 1 }}>
                  {player.totalOwnedCards} cards &nbsp;·&nbsp;
                  {Object.values(player.bonuses ?? {}).reduce(
                    (a: number, b) => a + (b as number),
                    0
                  )}{" "}
                  bonuses
                </div>
              </div>

              <div
                style={{
                  flexShrink: 0,
                  textAlign: "right"
                }}
              >
                <span
                  style={{
                    color: isWinner ? "#facc15" : "#e5e7eb",
                    fontWeight: 900,
                    fontSize: 24
                  }}
                >
                  {player.points}
                </span>
                <span style={{ color: "#6b7280", fontSize: 11 }}>pt</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <button
        onClick={() => {
          handleLeave();
          onLeave();
        }}
        style={{
          padding: "12px 36px",
          borderRadius: 12,
          fontWeight: 700,
          fontSize: 15,
          background: isIWon
            ? "linear-gradient(135deg, #d97706, #f59e0b)"
            : "#374151",
          color: "white",
          border: "none",
          cursor: "pointer",
          boxShadow: isIWon ? "0 4px 20px rgba(245,158,11,0.4)" : undefined
        }}
      >
        Back to Lobby
      </button>
    </div>
  );
}
