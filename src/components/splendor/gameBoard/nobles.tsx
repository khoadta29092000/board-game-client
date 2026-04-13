import { SplendorNoble } from "@/src/types/splendor";
import { costButtonClassMap, gemIconMap } from "@/src/utils";
import Image from "next/image";
import { registerNoble } from "@/src/redux/animation/Animationrefs";

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
            ref={el => registerNoble(noble.nobleId, el)}
            className="relative overflow-hidden rounded-lg border-2 border-purple-400 text-white p-2 flex justify-between bg-[#575a59]"
          >
            {/* 🖼️ Background image */}
            {noble.imageUrl && (
              <div className="absolute inset-0 z-0">
                <Image
                  src={noble.imageUrl}
                  alt="noble-bg"
                  fill
                  sizes="(max-width: 768px) 100vw, 20vw"
                  className="object-contain"
                />
                <div className="absolute inset-0 bg-black/50" />
              </div>
            )}

            {/* CONTENT */}
            <div className="relative z-10 flex w-full justify-between">
              {/* POINT */}
              <div className="font-bold text-white text-3xl drop-shadow">
                {noble.points}
              </div>

              {/* REQUIREMENTS */}
              <div className="flex flex-col gap-1">
                {Object.entries(noble.requirements).map(
                  ([color, amount]) =>
                    amount > 0 && (
                      <div
                        key={color}
                        className={`flex items-center justify-between gap-1 ${costButtonClassMap[color]} px-1 `}
                      >
                        {/* Box theo design system */}
                        <div
                          className={`flex items-center justify-center text-base font-bold`}
                        >
                          {amount}
                        </div>

                        {/* Icon */}
                        <div className="relative w-6 h-6">
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
          </div>
        ))}
    </div>
  );
}
