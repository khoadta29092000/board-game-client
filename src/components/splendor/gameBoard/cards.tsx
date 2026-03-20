import React, { useState } from "react";
import {
  VisibleCards,
  SplendorCard,
  SplendorNoble
} from "@/src/types/splendor";
import SplendorCardUI from "./SplendorCardUI";
import NobleCard from "./nobles";
import ModalCardAction from "./modal/modalCardAction";
import { TutorialStep } from "@/src/hook/game/useTutorialSteps";

type Props = {
  dataCards: VisibleCards | null;
  cardsNobles: SplendorNoble[] | null;
  cardDecks: Record<string, number>;
  isMyTurn?: boolean;
  onPurchase?: (cardId: string) => void;
  onReserve?: (cardId: string) => void;
  onReserveFromDeck?: (level: number) => void;
  currentStep: TutorialStep | null;
};

export default function CardsBoard({
  dataCards,
  cardDecks,
  isMyTurn = false,
  onPurchase,
  onReserve,
  onReserveFromDeck,
  cardsNobles,
  currentStep
}: Props) {
  const [selectedCard, setSelectedCard] = useState<SplendorCard | null>(null);
  const levels = dataCards ? Object.entries(dataCards) : [];
  const isTutorialLock =
    currentStep !== null && currentStep?.id !== 5 && currentStep?.id !== 6;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
        overflowX: "hidden"
      }}
    >
      {/* Nobles */}
      <div style={{ flexShrink: 0, marginBottom: 6 }}>
        <NobleCard nobles={cardsNobles} />
      </div>

      {/* 3 levels — col-reverse, fill remaining height */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column-reverse",
          gap: 6,
          minHeight: 500
        }}
      >
        {levels.map(([levelKey, cards]) => (
          <section
            key={levelKey}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minHeight: 0
            }}
            className="m-1 sm:m-3"
          >
            <div
              style={{
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: 1,
                color: "#9ca3af",
                marginBottom: 3,
                flexShrink: 0
              }}
            >
              Level {levelKey.replace(/\D/g, "")}
            </div>

            <div style={{ display: "flex", gap: 6, flex: 1, minHeight: 0 }}>
              {/* Deck button */}
              <div
                onClick={() => {
                  if (!isMyTurn || isTutorialLock) return;
                  onReserveFromDeck?.(Number(levelKey.replace(/\D/g, "")));
                }}
                style={{
                  flexShrink: 0,
                  width: 52,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 8,
                  border: "2px solid #4b5563",
                  background: "#1f2937",
                  color: "#9ca3af",
                  cursor: isMyTurn && !isTutorialLock ? "pointer" : "default",
                  transition: "border-color 0.15s",
                  minHeight: 0
                }}
                className=" sm:max-h-[200px] max-h-[160px]"
              >
                <span style={{ fontSize: 24 }}>≡</span>
                <span style={{ fontSize: 20, color: "#6b7280", marginTop: 2 }}>
                  x{cardDecks[levelKey] ?? 0}
                </span>
              </div>

              {/* 4 cards */}
              <div
                style={{
                  flex: 1,
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 6,
                  minHeight: 0
                }}
              >
                {(cards as SplendorCard[]).map(card => (
                  <SplendorCardUI
                    currentStep={currentStep}
                    key={card.cardId}
                    card={card}
                    isMyTurn={isMyTurn}
                    onClick={() => {
                      if (!isMyTurn) return;
                      setSelectedCard(card);
                    }}
                  />
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>

      {selectedCard && (
        <ModalCardAction
          currentStep={currentStep}
          isOpen={!!selectedCard}
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onPurchase={() => {
            onPurchase?.(selectedCard.cardId);
            setSelectedCard(null);
          }}
          onReserve={() => {
            onReserve?.(selectedCard.cardId);
            setSelectedCard(null);
          }}
        />
      )}
    </div>
  );
}
