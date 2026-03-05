import React from "react";
import { GemColor, GemsBankType } from "@/src/types/splendor";
import { gemIconMap } from "@/src/utils";
import Image from "next/image";
import { X } from "lucide-react";
import { useGemCollect } from "@/src/hook/game/useGemCollect";
import { registerGemBank } from "@/src/redux/animation/Animationrefs";

type Props = {
  bankGems: GemsBankType | null;
  isMyTurn?: boolean;
  isLandscape?: boolean;
  onConfirm?: (gems: Record<GemColor, number>) => void;
};

export default function GemsCard({
  bankGems,
  isMyTurn = false,
  isLandscape = true,
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
  const gemSize = isLandscape ? 64 : 72;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        height: "100%",
        minHeight: "140px"
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: isLandscape ? "column" : "row",
          gap: isLandscape ? 8 : 6,
          flex: 1,
          alignItems: "center",
          justifyContent: isLandscape ? "flex-start" : "center",
          overflowX: isLandscape ? "hidden" : "auto",
          overflowY: isLandscape ? "auto" : "hidden",
          paddingBottom: isLandscape ? 0 : 2,
          paddingTop: isLandscape ? 16 : 0
        }}
      >
        {bankGems &&
          Object.entries(bankGems).map(([color, amount]) => {
            const numAmount = +amount;
            const selectedCount = selectedGems[color] || 0;
            const selectable = isMyTurn && isGemSelectable(color, numAmount);
            return (
              <div
                key={color}
                style={{
                  position: "relative",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                {/* ← ref gắn vào circle div (có đúng width/height = gemSize) */}
                <div
                  ref={el => registerGemBank(color, el)}
                  data-gem={color}
                  onClick={() => {
                    if (!isMyTurn || color === "Gold") return;
                    handleSelectGem(color, numAmount);
                  }}
                  style={{
                    width: gemSize,
                    height: gemSize,
                    borderRadius: "50%",
                    border: `2px solid ${isMyTurn && selectedCount > 0 ? "#facc15" : "#4b5563"}`,
                    background: "#1f2937",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    transition: "all 0.15s",
                    boxShadow:
                      isMyTurn && selectedCount > 0
                        ? "0 0 14px rgba(250,204,21,0.4)"
                        : undefined,
                    transform:
                      isMyTurn && selectedCount > 0 ? "scale(1.08)" : undefined,
                    cursor: selectable ? "pointer" : "not-allowed",
                    opacity:
                      selectable || (isMyTurn && selectedCount > 0) ? 1 : 0.45
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "100%",
                      padding: 8
                    }}
                  >
                    <Image
                      src={gemIconMap[color as keyof typeof gemIconMap]}
                      alt={color}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  {isMyTurn && selectedCount > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: -8,
                        left: -8,
                        background: "#facc15",
                        color: "#111",
                        fontSize: 11,
                        fontWeight: 900,
                        borderRadius: "50%",
                        width: 20,
                        height: 20,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 10
                      }}
                    >
                      {selectedCount}
                    </div>
                  )}
                  {isMyTurn && selectedCount > 0 && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleRemoveGem(color);
                      }}
                      style={{
                        position: "absolute",
                        top: -8,
                        right: -6,
                        background: "#ef4444",
                        borderRadius: "50%",
                        width: 20,
                        height: 20,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "none",
                        cursor: "pointer",
                        zIndex: 10
                      }}
                    >
                      <X size={10} color="white" />
                    </button>
                  )}
                  <div
                    style={{
                      position: "absolute",
                      bottom: -8,
                      right: -6,
                      background: "white",
                      color: "#111",
                      fontSize: 11,
                      fontWeight: 700,
                      borderRadius: "50%",
                      width: 20,
                      height: 20,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid #d1d5db",
                      zIndex: 10
                    }}
                  >
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
          style={{
            padding: "5px 10px",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 12,
            background: totalSelected === 0 ? "#6b7280" : "#16a34a",
            color: "white",
            border: "none",
            cursor: totalSelected === 0 ? "not-allowed" : "pointer",
            flexShrink: 0
          }}
        >
          Take ({totalSelected})
        </button>
      )}
    </div>
  );
}
