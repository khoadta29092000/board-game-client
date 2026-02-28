import React, { useState } from "react";
import {
  VisibleCards,
  SplendorCard,
  fakeNobles,
  SplendorNoble
} from "@/src/types/splendor";
import SplendorCardUI from "./SplendorCardUI";
import NobleCard from "./nobles";
import ModalCardAction from "./modal/modalCardAction";

type Props = {
  dataCards: VisibleCards | null;
  cardsNobles: SplendorNoble[] | null;
  cardDecks: Record<string, number>;
  isMyTurn?: boolean;
  onPurchase?: (cardId: string) => void;
  onReserve?: (cardId: string) => void;
  onReserveFromDeck?: (level: number) => void;
};

export default function CardsBoard({
  dataCards,
  cardDecks,
  isMyTurn = false,
  onPurchase,
  onReserve,
  onReserveFromDeck,
  cardsNobles
}: Props) {
  const [selectedCard, setSelectedCard] = useState<SplendorCard | null>(null);

  const levels = dataCards && Object.entries(dataCards);

  return (
    <div className="w-full lg:min-h-[calc(100vh-48px)]">
      <NobleCard nobles={cardsNobles} />
      <div className="flex flex-col-reverse gap-3 sm:gap-6 px-2 pb-6">
        {levels &&
          levels.map(([levelKey, cards]) => (
            <section key={levelKey} className="space-y-2">
              <div className="text-xs uppercase tracking-wider text-gray-300">
                Level {levelKey.replace(/\D/g, "")}
              </div>

              <div className="flex gap-2">
                {/* Deck - click để reserve blind */}
                <div
                  onClick={() => {
                    if (!isMyTurn) return;
                    const level = Number(levelKey.replace(/\D/g, ""));
                    onReserveFromDeck?.(level);
                  }}
                  className={`
                    flex-shrink-0 relative flex items-center justify-center
                    rounded-lg border-2 border-gray-600
                    bg-gray-800 text-gray-300 italic
                    w-[32px] h-[32px] sm:w-[80px] sm:h-[80px]
                    ${isMyTurn ? "cursor-pointer hover:border-yellow-400 transition" : "cursor-default"}
                  `}
                >
                  <span className="text-[10px] sm:text-sm">...</span>
                  <div className="absolute bottom-[2px] right-[2px] sm:bottom-1 sm:right-1 text-[8px] sm:text-xs">
                    x{cardDecks[levelKey] ?? 0}
                  </div>
                </div>

                <div className="flex-1 grid gap-1.5 grid-cols-4 sm:grid-cols-[repeat(auto-fit,minmax(100px,1fr))]">
                  {(cards as SplendorCard[]).map(card => (
                    <SplendorCardUI
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
