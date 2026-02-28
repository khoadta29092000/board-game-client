import React from "react";
import { GemColor, GemsBankType } from "@/src/types/splendor";
import { gemIconMap } from "@/src/utils";
import Image from "next/image";
import { X } from "lucide-react";
import { useGemCollect } from "@/src/hook/game/useGemCollect";

type Props = {
  bankGems: GemsBankType | null;
  isMyTurn?: boolean;
  onConfirm?: (gems: Record<GemColor, number>) => void;
};

export default function GemsCard({
  bankGems,
  isMyTurn = false,
  onConfirm
}: Props) {
  const {
    selectedGems,
    totalSelected,
    handleSelectGem,
    handleRemoveGem,
    handleConfirm,
    isGemSelectable
  } = useGemCollect(bankGems, onConfirm);

  return (
    <div className="flex flex-col gap-4 min-h-12">
      <div className="lg:grid grid-rows-4 flex gap-2 sm:gap-8 sm:mx-8">
        {bankGems &&
          Object.entries(bankGems).map(([color, amount]) => {
            const numAmount = +amount;
            const selectedCount = selectedGems[color] || 0;
            const selectable = isMyTurn && isGemSelectable(color, numAmount);

            return (
              <div key={color} className="relative flex items-center gap-2">
                {/* Số lượng gem trong bank */}

                <div
                  onClick={() => {
                    if (!isMyTurn) return;
                    if (color == "Gold") return;
                    handleSelectGem(color, numAmount);
                  }}
                  className={`relative
                              h-11 w-11
                              sm:h-14 sm:w-14
                              lg:h-20 lg:w-20
                              rounded-full
                              border-2
                            bg-gray-800
                              flex items-center justify-center
                              transition-all duration-200
                             ${
                               selectedCount > 0
                                 ? "border-yellow-400 ring-4 ring-yellow-300 scale-[1.05] sm:scale-110 shadow-lg shadow-yellow-400/30"
                                 : "border-gray-600"
                             }
                            `}
                >
                  {/* Gem image */}
                  <div
                    className={`${
                      selectable
                        ? "hover:scale-105 hover:border-gray-400 cursor-pointer"
                        : "opacity-40 cursor-not-allowed"
                    } relative h-full w-full p-2`}
                  >
                    <Image
                      src={gemIconMap[color as keyof typeof gemIconMap]}
                      alt={color}
                      fill
                      className="object-contain"
                    />
                  </div>

                  {/* Selected count badge — góc trên trái, dễ thấy */}
                  {selectedCount > 0 && (
                    <div className="absolute -top-2 -left-2 bg-yellow-400 text-gray-900 text-xs font-black rounded-full h-4 w-4 sm:w-6 sm:h-6 flex items-center justify-center shadow-md ring-2 ring-yellow-200 z-10">
                      {selectedCount}
                    </div>
                  )}

                  {/* Remove button — góc trên phải */}
                  {selectedCount > 0 && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleRemoveGem(color);
                      }}
                      className="absolute -top-2 -right-1 bg-red-500 hover:bg-red-400 text-white rounded-full h-4 w-4 sm:w-6 sm:h-6 flex items-center justify-center shadow-md transition-colors z-10"
                    >
                      <X size={12} />
                    </button>
                  )}
                  <div className="absolute -bottom-2 -right-1 bg-white text-gray-900 border-gray-300 rounded-full h-4 w-4 sm:w-6 sm:h-6 flex items-center justify-center shadow-md transition-colors z-10">
                    {numAmount}
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {isMyTurn && Object.keys(selectedGems).length > 0 && (
        <button
          onClick={handleConfirm}
          disabled={totalSelected === 0}
          className={`
           px-2 py-1 sm:px-4 sm:py-2 rounded-lg font-bold transition
            ${
              totalSelected === 0
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }
          `}
        >
          Confirm ({totalSelected})
        </button>
      )}
    </div>
  );
}
