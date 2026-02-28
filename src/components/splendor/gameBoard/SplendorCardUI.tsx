import React from "react";
import { SplendorCard } from "@/src/types/splendor";
import { cn, gemIconMap } from "@/src/utils";
import Image from "next/image";

type Props = {
  card: SplendorCard;
  isMyTurn?: boolean;
  onClick?: () => void;
};

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
      onClick={onClick}
      disabled={!isMyTurn}
      className={`
        ${bg}
        rounded-md border
        flex flex-col justify-between
        aspect-[2/3]  w-full sm:max-h-[180px]
        p-2 sm:p-3 text-white
        transition-all duration-150
        ${
          isMyTurn
            ? "border-yellow-400 hover:scale-[1.03] hover:shadow-lg hover:shadow-yellow-400/20 active:scale-95 cursor-pointer"
            : "border-gray-600 opacity-80 cursor-default"
        }
      `}
    >
      {/* TOP */}
      <div className="flex justify-between items-start">
        <div
          className={cn(
            "text-yellow-400 font-black text-xs sm:text-base lg:text-3xl drop-shadow",
            card.points === 0 ? "invisible" : "visible"
          )}
        >
          {card.points ?? 0}
        </div>
        <div className="relative w-5 h-5 sm:w-16 sm:h-16 shrink-0">
          <Image
            src={gemIconMap[card.bonusColor]}
            alt={card.bonusColor}
            fill
            className="object-contain"
          />
        </div>
      </div>

      {/* COST */}
      <div className="mt-auto">
        <div
          className={`grid gap-0.5
    ${costCount === 4 ? "grid-cols-2 grid-rows-2" : ""}
    ${costCount === 3 ? "grid-cols-2" : ""}
    ${costCount === 2 ? "grid-cols-2" : ""}
    ${costCount === 1 ? "grid-cols-1" : ""}
  `}
        >
          {costEntries.map(([color, amount]) => (
            <div key={color} className="flex items-center gap-0.5">
              <div className="relative w-4 h-4 sm:w-8 sm:h-8 shrink-0">
                <Image
                  src={gemIconMap[color]}
                  alt={color}
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-black text-xs sm:text-xl drop-shadow">
                {amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </button>
  );
}
