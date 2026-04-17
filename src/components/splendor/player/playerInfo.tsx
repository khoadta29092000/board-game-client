/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { SplendorCard, SplendorGameState } from "@/src/types/splendor";
import { gemIconMap } from "@/src/utils";
import Image from "next/image";
import React, { useState } from "react";
import SplendorCardUI from "../gameBoard/SplendorCardUI";
import ModalCardAction from "../gameBoard/modal/modalCardAction";
import {
  registerGemPlayer,
  registerCardSlot,
  registerNoblePlayer,
  registerCardReserved
} from "@/src/redux/animation/Animationrefs"; // ← thêm
import { TutorialStep } from "@/src/hook/game/useTutorialSteps";
import { useTranslations } from "next-intl";

const WIN_POINTS = 15;

type TProps = {
  gameState: SplendorGameState;
  myId: string;
  isMyTurn?: boolean;
  isLandscape?: boolean;
  playerCount?: number;
  baseH?: number;
  onPurchase?: (cardId: string) => void;
  currentStep: TutorialStep | null;
};

export default function PlayerInfo({
  gameState,
  myId,
  isMyTurn,
  isLandscape = true,
  onPurchase,
  currentStep
}: TProps) {
  const [showReserved, setShowReserved] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<SplendorCard | null>(null);
  const t = useTranslations();

  const players = gameState.players ? Object.values(gameState.players) : [];

  const sortPlayers = gameState.info?.players ?? [];
  const myIndex = sortPlayers.findIndex(p => p === myId);
  const sortedIds =
    myIndex <= 0
      ? sortPlayers
      : [...sortPlayers.slice(myIndex), ...sortPlayers.slice(0, myIndex)];
  const sortedPlayers = sortedIds
    .map(id => players.find(p => p.playerId === id))
    .filter(p => p !== undefined);

  const turnNumber = gameState.turn?.turnNumber ?? 1;
  const currentPlayerId = gameState.turn?.currentPlayer;
  const totalPlayers = sortPlayers.length || players.length;
  const currentPlayerIndex = gameState.turn?.currentPlayerIndex ?? 0;
  const turnPositionInRound = (currentPlayerIndex % totalPlayers) + 1;

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: isLandscape ? "column" : "row",
          gap: 6,
          // padding: isLandscape ? "0px 10px" : "0px 8px",
          background: "#13131B",
          backdropFilter: "blur(4px)",
          width: isLandscape ? 267 : "auto",
          height: isLandscape ? "100%" : "auto",
          flexShrink: 0,
          overflowX: isLandscape ? "hidden" : "auto",
          overflowY: isLandscape ? "auto" : "hidden"
        }}
      >
        {/* Turn info header */}
        <div
          style={{
            flexShrink: 0,
            display: isLandscape ? "flex" : "none",
            alignItems: "center",
            justifyContent: "space-between",
            padding: isLandscape ? "12px 16px" : "4px 8px",
            background: "#1C1C26",
            color: "#64748B",
            fontWeight: 700,
            fontSize: "16px"
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: !isLandscape ? "column" : "row",
              alignItems: "center",
              gap: 4
            }}
          >
            <span style={{ fontSize: 12 }}>{t("player_info_turn")}</span>
            <span style={{ color: "#a78bfa", fontWeight: 900, fontSize: 14 }}>
              {Math.floor((turnNumber + 1) / totalPlayers)}
            </span>
          </div>
          <span style={{ color: "#374151", fontSize: 12 }}>|</span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 12 }}>{t("player_info_move")}</span>
            <span style={{ color: "#a78bfa", fontWeight: 700, fontSize: 14 }}>
              {turnPositionInRound}/{totalPlayers}
            </span>
          </div>
          <span style={{ color: "#374151", fontSize: 12 }}>|</span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 12 }}>{t("player_info_win")}</span>
            <span style={{ color: "#facc15", fontWeight: 700, fontSize: 14 }}>
              {WIN_POINTS}pt
            </span>
          </div>
        </div>
        <div className="p-2 gap-2 flex  lg:flex-col w-full">
          {/* Players */}
          {[...sortedPlayers]?.map((player, idx) => {
            const isMe = player.playerId === myId;
            const isCurrentTurn = currentPlayerId === player.playerId;
            const totalGems = Object.values(player.gems ?? {}).reduce(
              (a, b) => a + b,
              0
            );
            const playerTurnOrder =
              (sortPlayers.findIndex(id => id === player.playerId) %
                totalPlayers) +
              1;

            return (
              <div
                key={player.playerId}
                style={{
                  flexShrink: 0,
                  width: isLandscape
                    ? "100%"
                    : `calc(${100 / totalPlayers}% - ${((totalPlayers - 1) * 6) / totalPlayers}px)`,
                  height: isLandscape ? "auto" : "100%",
                  borderRadius: 10,
                  border: `2px solid ${isCurrentTurn ? "#facc15" : "#374151"}`,
                  // outline: isMe ? "2px solid #3b82f6" : "none",
                  outlineOffset: 1,
                  background: "#1f2937",
                  boxShadow: isCurrentTurn
                    ? "0 0 16px rgba(250,204,21,0.25)"
                    : undefined,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  minWidth: 0,
                  position: "relative"
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "6px 10px",
                    flexShrink: 0,
                    background: isCurrentTurn
                      ? "rgba(250,204,21,0.12)"
                      : "rgba(55,65,81,0.5)"
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      minWidth: 0
                    }}
                  >
                    <span
                      style={{
                        background: isCurrentTurn ? "#facc15" : "#374151",
                        color: isCurrentTurn ? "#111" : "#9ca3af",
                        fontSize: 10,
                        fontWeight: 900,
                        borderRadius: 4,
                        padding: "1px 5px",
                        flexShrink: 0
                      }}
                    >
                      #{playerTurnOrder}
                    </span>
                    {isCurrentTurn && (
                      <span
                        style={{
                          color: "#facc15",
                          fontSize: 11,
                          flexShrink: 0
                        }}
                      >
                        ▶
                      </span>
                    )}
                    <span
                      style={{
                        color: "white",
                        fontWeight: 700,
                        fontSize: 13,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {player.name}
                    </span>
                    {isMe && (
                      <span
                        style={{
                          color: "#60a5fa",
                          fontSize: 10,
                          flexShrink: 0,
                          marginLeft: 2
                        }}
                      >
                        {t("player_info_you")}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      flexShrink: 0
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 2
                      }}
                    >
                      <span
                        style={{
                          color: "#facc15",
                          fontWeight: 900,
                          fontSize: 18
                        }}
                      >
                        {player.points}
                      </span>
                      <span style={{ color: "#ca8a04", fontSize: 10 }}>
                        /{WIN_POINTS}
                      </span>
                    </div>
                    <div
                      style={{
                        width: 40,
                        height: 3,
                        background: "#374151",
                        borderRadius: 2,
                        overflow: "hidden"
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min((player.points / WIN_POINTS) * 100, 100)}%`,
                          height: "100%",
                          background:
                            player.points >= WIN_POINTS ? "#4ade80" : "#facc15",
                          transition: "width 0.3s"
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div
                  style={{
                    padding: "6px 10px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 5,
                    flex: 1,
                    overflowY: "auto",
                    minHeight: 0
                  }}
                >
                  {/* Gems */}
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 3
                      }}
                    >
                      <span
                        style={{
                          fontSize: 9,
                          color: "#9ca3af",
                          textTransform: "uppercase",
                          letterSpacing: 1
                        }}
                      >
                        {t("player_info_gems")}
                      </span>
                      <span style={{ fontSize: 9, color: "#6b7280" }}>
                        {totalGems}/10
                      </span>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                      {Object.entries(player?.gems ?? {})
                        .filter(([, v]) => v > 0)
                        .map(([color, amount]) => (
                          <div
                            key={color}
                            ref={el =>
                              registerGemPlayer(player.playerId, color, el)
                            } // ← thêm
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 3,
                              background: "#374151",
                              borderRadius: 5,
                              padding: "2px 6px"
                            }}
                          >
                            <div
                              style={{
                                position: "relative",
                                width: 14,
                                height: 14
                              }}
                            >
                              <Image
                                src={
                                  gemIconMap[color as keyof typeof gemIconMap]
                                }
                                alt={color}
                                fill
                                className="object-contain"
                              />
                            </div>
                            <span
                              style={{
                                color: "white",
                                fontSize: 12,
                                fontWeight: 700
                              }}
                            >
                              {amount}
                            </span>
                          </div>
                        ))}

                      {/* Slot ẩn cho gem = 0: vẫn register để animation biết điểm đích dù chưa có gem */}
                      {Object.entries(player?.gems ?? {})
                        .filter(([, v]) => v === 0)
                        .map(([color]) => (
                          <div
                            key={`slot-${color}`}
                            ref={el =>
                              registerGemPlayer(player.playerId, color, el)
                            } // ← thêm
                            style={{
                              position: "absolute",
                              opacity: 0,
                              pointerEvents: "none",
                              width: 1,
                              height: 1
                            }}
                          />
                        ))}

                      {totalGems === 0 && (
                        <span style={{ color: "#6b7280", fontSize: 12 }}>
                          —
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bonuses */}
                  {Object.values(player?.bonuses ?? {}).some(v => v > 0) && (
                    <div>
                      <div style={{ marginBottom: 3 }}>
                        <span
                          style={{
                            fontSize: 9,
                            color: "#9ca3af",
                            textTransform: "uppercase",
                            letterSpacing: 1
                          }}
                        >
                          {t("player_info_bonuses")}
                        </span>
                      </div>
                      <div
                        style={{ display: "flex", flexWrap: "wrap", gap: 3 }}
                      >
                        {Object.entries(player?.bonuses ?? {})
                          .filter(([, v]) => v > 0)
                          .map(([color, amount]) => (
                            <div
                              key={color}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 3,
                                background: "#111827",
                                borderRadius: 5,
                                padding: "2px 6px"
                              }}
                            >
                              <div
                                style={{
                                  position: "relative",
                                  width: 14,
                                  height: 14
                                }}
                              >
                                <Image
                                  src={
                                    gemIconMap[color as keyof typeof gemIconMap]
                                  }
                                  alt={color}
                                  fill
                                  className="object-contain"
                                />
                              </div>
                              <span
                                style={{
                                  color: "#4ade80",
                                  fontSize: 12,
                                  fontWeight: 700
                                }}
                              >
                                +{amount}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer — registerCardSlot: điểm đích card bay về khi purchase/reserve */}
                <div
                  ref={el => registerCardSlot(player.playerId, el)} // ← thêm
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderTop: "1px solid #374151",
                    padding: "4px 10px",
                    flexShrink: 0
                  }}
                >
                  <span style={{ color: "#6b7280", fontSize: 10 }}>
                    {player?.totalOwnedCards} {t("player_info_cards")}
                  </span>
                  <button
                    onClick={() => {
                      if (currentStep) return;
                      if (!isMe) return;
                      setShowReserved(player?.playerId);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      background: "#374151",
                      borderRadius: 5,
                      padding: "2px 7px",
                      border: "none",
                      cursor: currentStep || !isMe ? "default" : "pointer"
                    }}
                  >
                    <span style={{ color: "#d1d5db", fontSize: 10 }}>
                      {t("player_info_reserved")}
                    </span>
                    <span
                      style={{
                        color: "#facc15",
                        fontSize: 10,
                        fontWeight: 700
                      }}
                    >
                      {player?.reservedCards?.length}/3
                    </span>
                  </button>
                </div>
                <div
                  ref={el => registerNoblePlayer(player.playerId, el)}
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 3,
                    minHeight: 2,
                    minWidth: 0
                  }}
                />

                {/* Noble slot ẩn — registerNoblePlayer: điểm đích noble bay về */}
              </div>
            );
          })}
        </div>
      </div>

      {/* Reserved modal */}
      {showReserved &&
        (() => {
          const p = players.find(p => p.playerId === showReserved);
          const isMe = p?.playerId === myId;
          return (
            <div
              className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
              onClick={() => setShowReserved(null)}
            >
              <div
                className="bg-gray-800 rounded-xl p-4 w-[500px] space-y-3"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold text-sm">
                    {t("player_info_reserved_title")}
                  </span>
                  <button
                    onClick={() => setShowReserved(null)}
                    className="text-gray-400 hover:text-white text-lg"
                  >
                    ✕
                  </button>
                </div>
                {!p?.reservedCards.length ? (
                  <div className="text-gray-500 text-sm text-center py-4">
                    {t("player_info_no_reserved")}
                  </div>
                ) : (
                  <div
                    className="grid grid-cols-3 gap-2"
                    style={{ minHeight: 160 }}
                  >
                    {p.reservedCards.map((card: SplendorCard) => (
                      // registerCardReserved: vị trí card trong reserved để animation biết điểm xuất phát khi mua từ reserved
                      <div
                        key={card.cardId}
                        ref={el => registerCardReserved(card.cardId, el)} // ← thêm
                      >
                        <SplendorCardUI
                          card={card}
                          isMyTurn={isMyTurn && currentStep == null}
                          onClick={() => {
                            if (currentStep != null) return;
                            if (!isMyTurn || !isMe) return;
                            setSelectedCard(card);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

      {selectedCard && (
        <ModalCardAction
          currentStep={currentStep}
          isOpen={!!selectedCard}
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onPurchase={() => {
            onPurchase?.(selectedCard.cardId);
            setSelectedCard(null);
            setShowReserved(null);
          }}
        />
      )}
    </>
  );
}
