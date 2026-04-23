/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from "react";
import CardPickerModal, { CardPickerItem } from "./CardPickerModal";

export default function HeroSelectModal(props: {
  isOpen: boolean;
  title: string;
  cards: any[];
  selectedCardId: string | null;
  onSelectCardId: (cardId: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  getCardId: (c: any) => string | null;
}) {
  const {
    isOpen,
    title,
    cards,
    selectedCardId,
    onSelectCardId,
    onClose,
    onConfirm,
    confirmLabel,
    getCardId
  } = props;

  const items: CardPickerItem[] = useMemo(
    () => (cards || []).map((card) => ({ card })),
    [cards]
  );

  const footer = (
    <div className="flex gap-2 justify-end">
      <button className="bg-gray-700 text-white px-4 py-2 rounded-md" onClick={onClose}>
        Cancel
      </button>
      <button className="bg-blue-500 text-white px-4 py-2 rounded-md" onClick={onConfirm}>
        {confirmLabel}
      </button>
    </div>
  );

  return (
    <CardPickerModal
      isOpen={isOpen}
      title={title}
      items={items}
      selectedCardId={selectedCardId}
      onSelectCardId={onSelectCardId}
      onClose={onClose}
      footer={footer}
      getCardId={getCardId}
    />
  );
}

