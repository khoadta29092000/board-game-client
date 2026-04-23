import { SplendorCard } from "@/src/types/splendor";
import {
  cn,
  COST_COLOR_MAP,
  costButtonClassMap,
  costIconMap,
  gemIconMap
} from "@/src/utils";
import Image from "next/image";
import { registerCardBoard } from "@/src/redux/animation/Animationrefs";
import { TutorialStep } from "@/src/hook/game/useTutorialSteps";
import React, { useState } from "react";

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
  const [imgLoaded, setImgLoaded] = useState(false);
  const costEntries = Object.entries(card.cost).filter(
    ([, amount]) => amount > 0
  );
  const bg = COST_COLOR_MAP[card.bonusColor as keyof typeof COST_COLOR_MAP];
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
      className={cn(
        " relative overflow-hidden rounded-lg border w-full h-full text-white transition-all duration-150",
        "sm:max-h-[200px] max-h-[160px]",
        isMyTurn
          ? isTutorialLock
            ? "border-gray-600"
            : "border-gray-600 hover:scale-[1.03] hover:shadow-lg hover:shadow-yellow-400/30 active:scale-95 cursor-pointer"
          : "border-gray-600 opacity-75 cursor-default",
        bg
      )}
    >
      {/* BACKGROUND IMAGE */}
      {card.imageUrl && (
        <div className="absolute inset-0 z-0">
          {/* subtle skeleton while loading */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br from-white/10 to-white/0 transition-opacity duration-300",
              imgLoaded ? "opacity-0" : "opacity-100"
            )}
          />
          <Image
            src={card.imageUrl}
            alt="card-bg"
            fill
            className={cn(
              "object-contain transition-opacity duration-300",
              imgLoaded ? "opacity-100" : "opacity-0"
            )}
            sizes="(max-width: 840px) 100vw, 200px"
            loading="lazy"
            placeholder="blur"
            blurDataURL="/images/placeholder.png"
            onLoadingComplete={() => setImgLoaded(true)}
          />

          <div className="absolute inset-0 bg-black/40" />
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
        <div className="grid grid-cols-2 gap-1">
          {[...costEntries].map(([color, amount], index) => (
            <div
              key={color}
              className={cn(
                "flex items-center pr-1",
                index % 2 === 0
                  ? "justify-self-start" // 0,2,4 → trái
                  : "justify-self-end", // 1,3,5 → phải
                costIconMap[color]
              )}
            >
              <div className="relative w-6 h-6 flex-shrink-0">
                <Image
                  src={gemIconMap[color]}
                  alt={`gems-${color}-${amount}`}
                  fill
                  className="object-contain"
                />
              </div>

              <span className="font-black text-lg drop-shadow ml-1">
                {amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </button>
  );
}
