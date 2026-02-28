/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { SplendorCard, SplendorGameState } from "@/src/types/splendor";
import { cn, gemIconMap } from "@/src/utils";
import Image from "next/image";
import React, { useState } from "react";
import SplendorCardUI from "../gameBoard/SplendorCardUI";
import ModalCardAction from "../gameBoard/modal/modalCardAction";

type TProps = {
  gameState: SplendorGameState;
  myId: string;
  isMyTurn?: boolean;
  onPurchase?: (cardId: string) => void;
};

export default function PlayerInfo({
  gameState,
  myId,
  isMyTurn,
  onPurchase
}: TProps) {
  const [showReserved, setShowReserved] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<SplendorCard | null>(null);

  return (
    <aside className="w-full lg:w-[260px] xl:w-80 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lg:overflow-x-visible flex-shrink-0">
      {gameState.players &&
        Object.values(gameState.players).map(player => {
          const isMe = player.playerId === myId;
          const isCurrentTurn =
            gameState.turn?.currentPlayer === player.playerId;
          const totalGems = Object.values(player.gems).reduce(
            (a, b) => a + b,
            0
          );

          return (
            <div
              key={player.playerId}
              className={`
                flex-shrink-0 w-[190px] sm:w-[240px] lg:w-full rounded-xl shadow-md
                border-2 transition-all duration-200 bg-gray-800
                ${isCurrentTurn ? "border-yellow-400 shadow-yellow-400/10 shadow-lg" : "border-gray-700"}
                ${isMe ? "ring-2 ring-blue-500" : ""}
              `}
            >
              {/* Header */}
              <div
                className={`flex items-center justify-between px-3 py-[2px] sm:py-2 rounded-t-xl ${isCurrentTurn ? "bg-yellow-400/10" : "bg-gray-700/40"}`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  {isCurrentTurn && (
                    <span className="text-yellow-400 text-xs animate-pulse">
                      ▶
                    </span>
                  )}
                  <span className="text-white font-bold text-xs sm:text-sm truncate max-w-[90px]">
                    {player.name}
                  </span>
                  {isMe && (
                    <span className="text-blue-400 text-[9px] shrink-0">
                      (you)
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-0.5 shrink-0">
                  <span className="text-yellow-400 font-black text-sm sm:text-xl">
                    {player.points}
                  </span>
                  <span className="text-yellow-600 text-[9px]">pt</span>
                </div>
              </div>

              <div className="px-2.5 py-2 space-y-2">
                {/* Gems */}
                <div>
                  <div
                    className={cn(
                      "items-center justify-between mb-1",
                      "sm:flex hidden"
                    )}
                  >
                    <span className="text-[9px] text-gray-400 uppercase tracking-wider">
                      Gems
                    </span>
                    <span className="text-[9px] text-gray-500">
                      {totalGems}/10
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(player.gems)
                      .filter(([, v]) => v > 0)
                      .map(([color, amount]) => (
                        <div
                          key={color}
                          className="flex items-center gap-0.5 bg-gray-700 rounded-md px-1.5 py-0.5"
                        >
                          <div className="relative w-3 h-3 sm:w-4 sm:h-4">
                            <Image
                              src={gemIconMap[color as keyof typeof gemIconMap]}
                              alt={color}
                              fill
                              className="object-contain"
                            />
                          </div>
                          <span className="text-white text-xs sm:text-sm font-bold">
                            {amount}
                          </span>
                        </div>
                      ))}
                    {totalGems === 0 && (
                      <span className="text-gray-600 text-[8px] sm:text-sm">
                        none
                      </span>
                    )}
                  </div>
                </div>

                {/* Bonuses */}
                <div>
                  <span
                    className={cn(
                      "text-[9px] text-gray-400 uppercase tracking-wider",
                      "sm:flex hidden"
                    )}
                  >
                    Bonuses
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {Object.entries(player.bonuses)
                      .filter(([, v]) => v > 0)
                      .map(([color, amount]) => (
                        <div
                          key={color}
                          className="flex items-center gap-0.5 bg-gray-900 rounded-md px-1.5 py-0.5"
                        >
                          <div className="relative w-3 h-3 sm:w-4 sm:h-4">
                            <Image
                              src={gemIconMap[color as keyof typeof gemIconMap]}
                              alt={color}
                              fill
                              className="object-contain"
                            />
                          </div>
                          <span className="text-green-400 text-xs sm:text-sm font-bold">
                            +{amount}
                          </span>
                        </div>
                      ))}
                    {Object.values(player.bonuses).every(v => v === 0) && (
                      <span className="text-gray-600 text-[8px] sm:text-sm">
                        none
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-gray-700 pt-1.5">
                  <span className="text-gray-500 text-[8px] sm:text-[10px]">
                    {player.totalOwnedCards} purchased cards
                  </span>
                  <button
                    onClick={() => setShowReserved(player.playerId)}
                    className="flex items-center gap-1 bg-gray-700 hover:bg-gray-600 rounded-md px-2 py-0.5 transition"
                  >
                    <span className="text-[8px] sm:text-[10px] text-gray-300">
                      Reserved
                    </span>
                    <span className="text-yellow-400 text-[8px] sm:text-[10px] font-bold">
                      {player.reservedCards.length}/3
                    </span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

      {/* Modal reserved cards */}
      {showReserved &&
        (() => {
          const p = Object.values(gameState.players).find(
            p => p.playerId === showReserved
          );
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
                    Reserved Cards
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
                    No reserved cards
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {p.reservedCards.map((card: SplendorCard) => (
                      <SplendorCardUI
                        key={card.cardId}
                        card={card}
                        isMyTurn={isMyTurn}
                        onClick={() => {
                          if (!isMyTurn || !isMe) return;
                          setSelectedCard(card);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      {selectedCard && (
        <ModalCardAction
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
    </aside>
  );
}
