import React, { useMemo } from "react";
import CardPickerModal, { CardPickerItem } from "./CardPickerModal";

export default function PartyTargetModal(props: {
  isOpen: boolean;
  title: string;
  confirmLabel: string;
  statePlayers: Record<string, any> | null | undefined;
  validIds: string[] | null;
  selectedCardId: string | null;
  onSelectCardId: (cardId: string) => void;
  onClose: () => void;
  onConfirm?: () => void;
  onGiveUp?: () => void;
  getCardId: (c: any) => string | null;
}) {
  const {
    isOpen,
    title,
    confirmLabel,
    statePlayers,
    validIds,
    selectedCardId,
    onSelectCardId,
    onClose,
    onConfirm,
    onGiveUp,
    getCardId
  } = props;

  const items: CardPickerItem[] = useMemo(() => {
    const validSet = validIds && validIds.length ? new Set(validIds) : null;
    const playersArr: any[] = Object.values(statePlayers || {}) as any[];
    const out: CardPickerItem[] = [];
    for (const p of playersArr) {
      const party: any[] = Array.isArray(p?.party) ? p.party : [];
      for (const card of party) {
        const id = getCardId(card);
        if (!id) continue;
        if (validSet && !validSet.has(String(id))) continue;
        out.push({
          card,
          meta: <span>owner: {String(p?.playerId ?? "")}</span>
        });
      }
    }
    return out;
  }, [getCardId, statePlayers, validIds]);

  const footer = (
    <div className="flex gap-2 justify-end">
      <button className="bg-gray-700 text-white px-4 py-2 rounded-md" onClick={onClose}>
        Cancel
      </button>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded-md"
        onClick={onConfirm}
        disabled={!selectedCardId}
      >
        {confirmLabel}
      </button>
      <button className="bg-gray-700 text-white px-4 py-2 rounded-md" onClick={onGiveUp}>
        Give up
      </button>
    </div>
  );

  return (
    <CardPickerModal
      isOpen={isOpen}
      title={title}
      subtitle={
        <div style={{ opacity: 0.8, fontSize: 12 }}>
          Valid targets: {String(validIds?.length ?? 0)}
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

