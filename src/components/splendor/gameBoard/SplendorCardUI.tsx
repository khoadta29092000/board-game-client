import React from "react";
import { SplendorCard } from "@/src/types/splendor";
import { cn, gemIconMap } from "@/src/utils";
import Image from "next/image";
import { registerCardBoard } from "@/src/redux/animation/Animationrefs"; // ← thêm

type Props = { card: SplendorCard; isMyTurn?: boolean; onClick?: () => void };

export default function SplendorCardUI({
  card,
  isMyTurn = false,
  onClick
}: Props) {
  const bg =
    card.bonusColor === "White"
      ? "bg-slate-600"
      : card.bonusColor === "Blue"
        ? "bg-blue-900"
        : card.bonusColor === "Green"
          ? "bg-green-900"
          : card.bonusColor === "Red"
            ? "bg-red-900"
            : "bg-slate-800";

  const costEntries = Object.entries(card.cost).filter(
    ([, amount]) => amount > 0
  );
  const costCount = costEntries.length;

  return (
    <button
      ref={el => registerCardBoard(card.cardId, el as HTMLDivElement | null)} // ← thêm
      onClick={onClick}
      disabled={!isMyTurn}
      className={`
        ${bg} rounded-lg border w-full h-full
        sm:max-h-[200px] max-h-[160px]
        
        flex flex-col justify-between p-2 text-white
        transition-all duration-150
        ${
          isMyTurn
            ? "border-yellow-400 hover:scale-[1.03] hover:shadow-lg hover:shadow-yellow-400/30 active:scale-95 cursor-pointer"
            : "border-gray-600 opacity-75 cursor-default"
        }
      `}
    >
      {/* TOP: points + bonus gem */}
      <div className="flex justify-between items-start">
        <div
          className={cn(
            "text-yellow-400 font-black text-2xl drop-shadow",
            card.points === 0 ? "invisible" : "visible"
          )}
        >
          {card.points ?? 0}
        </div>
        {/* Bonus gem icon — 32×32 */}
        <div
          className="relative flex-shrink-0"
          style={{ width: 40, height: 40 }}
        >
          <Image
            src={gemIconMap[card.bonusColor]}
            alt={card.bonusColor}
            fill
            className="object-contain"
          />
        </div>
      </div>

      {/* COST */}
      <div
        className={`grid gap-1
        ${costCount >= 4 ? "grid-cols-2" : ""}
        ${costCount === 3 ? "grid-cols-2" : ""}
        ${costCount === 2 ? "grid-cols-2" : ""}
        ${costCount === 1 ? "grid-cols-1" : ""}
      `}
      >
        {costEntries.map(([color, amount]) => (
          <div key={color} className="flex items-center gap-1">
            {/* Cost gem icon — 20×20 */}
            <div
              className="relative flex-shrink-0"
              style={{ width: 28, height: 28 }}
            >
              <Image
                src={gemIconMap[color]}
                alt={color}
                fill
                className="object-contain"
              />
            </div>
            <span className="font-black text-xl drop-shadow">{amount}</span>
          </div>
        ))}
      </div>
    </button>
  );
}
