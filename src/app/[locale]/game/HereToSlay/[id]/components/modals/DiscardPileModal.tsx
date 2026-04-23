import React, { useMemo } from "react";
import CardPickerModal, { CardPickerItem } from "./CardPickerModal";

export default function DiscardPileModal(props: {
  isOpen: boolean;
  mode: "view" | "searchDiscard";
  discardCards: any[];
  discardCount: number;
  validIds: string[] | null;
  selectedCardId: string | null;
  onSelectCardId: (cardId: string) => void;
  onClose: () => void;
  onConfirmTake?: () => void;
  onGiveUp?: () => void;
  getCardId: (c: any) => string | null;
}) {
  const {
    isOpen,
    mode,
    discardCards,
    discardCount,
    validIds,
    selectedCardId,
    onSelectCardId,
    onClose,
    onConfirmTake,
    onGiveUp,
    getCardId
  } = props;

  const items: CardPickerItem[] = useMemo(() => {
    const validSet = validIds && validIds.length ? new Set(validIds) : null;
    const filtered =
      mode === "searchDiscard"
        ? discardCards.filter((c) => {
            const id = getCardId(c);
            if (!id) return false;
            return !validSet || validSet.has(String(id));
          })
        : discardCards;
    return filtered.map((card) => ({ card }));
  }, [discardCards, getCardId, mode, validIds]);

  const footer =
    mode === "searchDiscard" ? (
      <div className="flex gap-2 justify-end">
        <button
          className="bg-gray-700 text-white px-4 py-2 rounded-md"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
          onClick={onConfirmTake}
          disabled={!selectedCardId}
        >
          Take to hand
        </button>
        <button
          className="bg-gray-700 text-white px-4 py-2 rounded-md"
          onClick={onGiveUp}
        >
          Give up
        </button>
      </div>
    ) : (
      <div className="flex gap-2 justify-end">
        <button
          className="bg-gray-700 text-white px-4 py-2 rounded-md"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    );

  return (
    <CardPickerModal
      isOpen={isOpen}
      title={mode === "searchDiscard" ? "Search discard pile (choose a card)" : "Discard pile"}
      subtitle={
        <div style={{ opacity: 0.8, fontSize: 12 }}>
          Count: {String(discardCount)}
        </div>
      }
      items={items}
      selectedCardId={selectedCardId}
      onSelectCardId={onSelectCardId}
      onClose={onClose}
      footer={footer}
      getCardId={getCardId}
    />
  );
}

