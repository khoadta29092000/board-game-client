import { SplendorNoble } from "@/src/types/splendor";
import { gemIconMap } from "@/src/utils";
import Image from "next/image";
import { registerNoble } from "@/src/redux/animation/Animationrefs"; // ← thêm

type Props = { nobles: SplendorNoble[] | null };

export default function NobleCard({ nobles }: Props) {
  return (
    <div
      className="w-full grid gap-2"
      style={{
        gridTemplateColumns: nobles
          ? `repeat(${nobles.length}, minmax(0, 1fr))`
          : `repeat(5, minmax(0, 1fr))`
      }}
    >
      {nobles &&
        nobles.map(noble => (
          <div
            key={noble.nobleId}
            ref={el => registerNoble(noble.nobleId, el)} // ← thêm
            className="rounded-lg border-2 border-purple-400 bg-gray-800 text-white p-2 flex justify-between items-center"
          >
            <div className="text-shadow-accent font-bold text-yellow-400 text-3xl">
              {noble.points}
            </div>
            <div className="flex flex-col gap-1">
              {Object.entries(noble.requirements).map(
                ([color, amount]) =>
                  amount > 0 && (
                    <div key={color} className="flex items-center relative">
                      <div className="w-8 h-8 bg-black/70 border border-white text-sm flex items-center justify-center z-0">
                        {amount}
                      </div>
                      <div className="absolute -right-4 -bottom-2 w-8 h-8 z-10">
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
