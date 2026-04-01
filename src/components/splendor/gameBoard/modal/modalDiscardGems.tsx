"use client";

import { ModalCommon } from "@/src/components/common/modal";
import { GemColor } from "@/src/types/splendor";
import { gemIconMap } from "@/src/utils";
import Image from "next/image";
import { useState, useMemo } from "react";
import { Button } from "@/src/components/ui/button";
import { useTranslations } from "next-intl";

export type GemSet = Record<GemColor, number>;

type TProps = {
  isOpen: boolean;
  onClose: () => void;
  currentGems: GemSet;
  excessCount: number;
  onConfirm: (toDiscard: GemSet) => void;
  isLoading?: boolean;
};

export function ModalDiscardGems({
  isOpen,
  onClose,
  currentGems,
  excessCount,
  onConfirm,
  isLoading = false
}: TProps) {
  const [discarding, setDiscarding] = useState<GemSet>({} as GemSet);
  const t = useTranslations();

  const totalDiscarding = useMemo(
    () => Object.values(discarding).reduce((a, b) => a + b, 0),
    [discarding]
  );

  const remaining = excessCount - totalDiscarding;
  const isValid = remaining === 0;

  const handleAdd = (color: GemColor) => {
    const available = currentGems[color] ?? 0;
    const alreadyPicked = discarding[color] ?? 0;
    if (alreadyPicked >= available) return;

    setDiscarding(prev => ({ ...prev, [color]: alreadyPicked + 1 }));
  };

  const handleRemove = (color: GemColor) => {
    const alreadyPicked = discarding[color] ?? 0;
    if (alreadyPicked <= 0) return;

    setDiscarding(prev => ({
      ...prev,
      [color]: alreadyPicked - 1
    }));
  };

  const handleConfirm = () => {
    if (!isValid || isLoading) return;
    // Chỉ gửi các màu có số lượng > 0
    const filtered = Object.fromEntries(
      Object.entries(discarding).filter(([, v]) => v > 0)
    ) as GemSet;
    onConfirm(filtered);
    onClose();
  };

  const handleClose = () => {
    if (isLoading) return;
    setDiscarding({} as GemSet);
    onClose();
  };

  const ContentModal = (
    <div className="space-y-5">
      {/* Status banner */}
      <div
        className={`rounded-lg px-4 py-2 text-sm font-semibold text-center transition-colors ${
          isValid
            ? "bg-green-900/50 text-green-300 border border-green-700"
            : "bg-yellow-900/50 text-yellow-300 border border-yellow-700"
        }`}
      >
        {isValid
          ? t("discard_ready")
          : t("discard_select_more", { count: remaining })}
      </div>

      {/* Gem list */}
      <div className="flex flex-col gap-3">
        {(Object.entries(currentGems) as [GemColor, number][])
          .filter(([, amount]) => amount > 0)
          .map(([color, amount]) => {
            const picked = discarding[color] ?? 0;
            const afterDiscard = amount - picked;

            return (
              <div
                key={color}
                className="flex items-center justify-between gap-3 bg-gray-800 rounded-lg px-4 py-2"
              >
                {/* Gem icon + color */}
                <div className="flex items-center gap-3 w-32">
                  <div className="relative w-8 h-8 shrink-0">
                    <Image
                      src={gemIconMap[color]}
                      alt={color}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-white text-sm font-medium capitalize">
                    {color}
                  </span>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleRemove(color)}
                    disabled={picked <= 0}
                    className="w-7 h-7 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold flex items-center justify-center transition"
                  >
                    −
                  </button>

                  <span
                    className={`w-5 text-center font-bold text-sm ${
                      picked > 0 ? "text-red-400" : "text-gray-400"
                    }`}
                  >
                    {picked > 0 ? `-${picked}` : "0"}
                  </span>

                  <button
                    onClick={() => handleAdd(color)}
                    disabled={picked >= amount}
                    className="w-7 h-7 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold flex items-center justify-center transition"
                  >
                    +
                  </button>
                </div>

                {/* Remaining after discard */}
                <div className="text-right w-20">
                  <span className="text-xs text-gray-400">{t("discard_after")}</span>
                  <div
                    className={`font-bold text-sm ${
                      afterDiscard < amount ? "text-red-400" : "text-white"
                    }`}
                  >
                    {afterDiscard} / {amount}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );

  const FooterModal = (
    <div className="flex gap-3 justify-end">
      <Button
        onClick={handleConfirm}
        disabled={!isValid || isLoading}
        className="min-w-[120px] bg-green-600 hover:bg-green-700 disabled:opacity-50"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
            {t("discard_discarding")}
          </span>
        ) : (
          `${t("discard_button")} ${totalDiscarding}`
        )}
      </Button>
    </div>
  );
  return (
    <ModalCommon
      isOpen={isOpen}
      handleClose={handleClose}
      title={t("discard_title")}
      description={t("discard_desc", { count: excessCount })}
      content={ContentModal}
      footer={FooterModal}
      positionTop="100px"
      inconRemove={true}
    />
  );
}
