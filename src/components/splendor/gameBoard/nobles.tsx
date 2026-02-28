// NobleCard.tsx
import { SplendorNoble } from "@/src/types/splendor";
import { gemIconMap } from "@/src/utils";
import Image from "next/image";
import { useIsMobile } from "@/src/hook/common/useIsMobile";

type Props = {
  nobles: SplendorNoble[] | null;
};

export default function NobleCard({ nobles }: Props) {
  const isMobile = useIsMobile(1024);

  return (
    <div
      className={`
        w-full
       grid 
       gap-2
      `}
      style={{
        gridTemplateColumns: nobles
          ? `repeat(${nobles.length}, minmax(0, 1fr))`
          : `repeat(5, minmax(0, 1fr))`
      }}
    >
      {nobles && nobles.map(noble => (
        <div
          key={noble.nobleId}
          className="
            rounded-lg border-2 border-purple-400
            bg-gray-800 text-white
            p-2 flex justify-between text-center items-center
            sm:h-[120px]
            px-4
          "
        >
          <div className="text-center font-bold text-yellow-400 text-[20px] sm:text-[24px]">
            {noble.points}
          </div>

          <div className="flex flex-col gap-1 mt-auto">
            {Object.entries(noble.requirements).map(
              ([color, amount]) =>
                amount > 0 && (
                  <div key={color} className="flex items-center relative ">
                    <div
                      className="
                        w-6 h-6
                        sm:w-8 sm:h-8
                        bg-black/70 border border-white
                        text-[14px] sm:text-[16px]
                        flex items-center justify-center
                        z-1
                      "
                    >
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
      ))}
    </div>
  );
}
