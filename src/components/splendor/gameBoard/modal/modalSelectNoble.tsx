import { ModalCommon } from "@/src/components/common/modal";
import { SplendorNoble } from "@/src/types/splendor";
import { gemIconMap } from "@/src/utils";
import Image from "next/image";

type Props = {
  isOpen: boolean;
  nobles: string[];
  gameNobles?: SplendorNoble[];
  onConfirm: (nobleId: string) => void;
  onClose: () => void;
};

export function ModalSelectNoble({
  isOpen,
  nobles,
  gameNobles,
  onConfirm,
  onClose
}: Props) {
  const eligibleNoblesData =
    gameNobles?.filter(n => nobles.includes(n.nobleId)) ?? [];

  return (
    <ModalCommon
      isOpen={isOpen}
      handleClose={onClose}
      title="Select a Noble"
      description="You qualify for multiple nobles. Please select one."
      content={
        <div className="flex gap-3 justify-center py-2">
          {eligibleNoblesData.map(noble => (
            <button
              key={noble.nobleId}
              onClick={() => onConfirm(noble.nobleId)}
              className="rounded-lg border-2 border-gray-600 hover:border-yellow-400 hover:scale-105 transition-all duration-150 p-0 overflow-hidden"
            >
              <div className="rounded-lg border-2 border-purple-400 bg-gray-800 text-white p-2 flex justify-between items-center sm:h-[120px] px-4 gap-3 pointer-events-none">
                <div className="text-center font-bold text-yellow-400 text-[20px] sm:text-[24px]">
                  {noble.points}
                </div>

                <div className="flex flex-col gap-1 mt-auto">
                  {Object.entries(noble.requirements).map(
                    ([color, amount]) =>
                      amount > 0 && (
                        <div key={color} className="flex items-center relative">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-black/70 border border-white text-[14px] sm:text-[16px] flex items-center justify-center z-1">
                            {amount}
                          </div>
                          <div className="absolute -right-3 -bottom-3 sm:-right-4 sm:-bottom-3 w-7 h-7 sm:w-9 sm:h-9 z-10">
                            <Image
                              src={gemIconMap[color]}
                              alt={color}
                              fill
                              className="object-contain"
                            />
                          </div>
                        </div>
                      )
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      }
    />
  );
}
