import React from "react";
import { SplendorCard } from "@/src/types/splendor";
import { cn, gemIconMap } from "@/src/utils";
import Image from "next/image";
import { registerCardBoard } from "@/src/redux/animation/Animationrefs";
import { TutorialStep } from "@/src/hook/game/useTutorialSteps";

type Props = {
  card: SplendorCard;
  isMyTurn?: boolean;
  onClick?: () => void;
  currentStep?: TutorialStep | null;
};

const gemButtonClassMap: Record<string, string> = {
  White: "DiamondButton",
  Blue: "BlueButton",
  Green: "GreenButton",
  Red: "RubyButton",
  Black: "PurpleButton",
  Gold: "GoldButton"
};

export default function SplendorCardUI({
  card,
  isMyTurn = false,
  onClick,
  currentStep = null
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

  const isTutorialLock =
    currentStep !== null && currentStep?.id !== 5 && currentStep?.id !== 6;

  return (
    <button
      ref={el => registerCardBoard(card.cardId, el as HTMLDivElement | null)}
      onClick={() => {
        if (!isTutorialLock) {
          onClick && onClick();
        }
      }}
      disabled={!isMyTurn}
      className={`
        bg-[#575a59]
        relative overflow-hidden
        rounded-lg border w-full h-full
        sm:max-h-[200px] max-h-[160px]
        text-white
        transition-all duration-150
        ${
          isMyTurn
            ? isTutorialLock
              ? "border-gray-600"
              : "border-gray-600 hover:scale-[1.03] hover:shadow-lg hover:shadow-yellow-400/30 active:scale-95 cursor-pointer"
            : "border-gray-600 opacity-75 cursor-default"
        }
      `}
    >
      {/* BACKGROUND IMAGE */}
      {card.imageUrl && (
        <div className="absolute inset-0 z-0">
          <Image
            src={card.imageUrl}
            alt="card-bg"
            fill
            className="object-contain"
            sizes="(max-width: 840px) 100vw, 200px"
          />

          {/* overlay giúp đọc text */}
          <div className="absolute inset-0 bg-black/40" />

          {/* optional blur */}
          {/* <div className="absolute inset-0 backdrop-blur-[2px]" /> */}
        </div>
      )}

      {/* CONTENT */}
      <div className="relative z-10 flex flex-col justify-between h-full p-1">
        {/* TOP: points + bonus gem */}
        <div className="w-full flex justify-between items-start">
          <div
            className={cn(
              "text-white font-bold text-3xl drop-shadow px-4 py-2",
              card.points === 0 ? "invisible" : "visible"
            )}
          >
            {card.points ?? 0}
          </div>

          {/* Bonus gem */}
          <div
            className={cn(
              "relative flex-shrink-0 flex items-center justify-center",
              gemButtonClassMap[card.bonusColor]
            )}
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
          className={`
            grid grid-cols-2
          `}
        >
          {[...costEntries].map(([color, amount], index) => (
            <div
              key={color}
              className={cn(
                "flex items-end  gap-1 p-1",
                index % 2 === 0 ? "justify-start" : "justify-end"
              )}
            >
              <div
                className="relative flex-shrink-0"
                style={{ width: 24, height: 24 }}
              >
                <Image
                  src={gemIconMap[color]}
                  alt={`gems-${color}-${amount}`}
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-black text-lg drop-shadow">{amount}</span>
            </div>
          ))}
        </div>
      </div>
    </button>
  );
}
