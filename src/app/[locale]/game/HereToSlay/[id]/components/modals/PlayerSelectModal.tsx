/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from "react";
import IdListModal from "./IdListModal";

export default function PlayerSelectModal(props: {
  isOpen: boolean;
  title: string;
  playerIds: string[];
  playersById: Record<string, any> | null | undefined;
  selectedPlayerId: string | null;
  onSelectPlayerId: (id: string) => void;
  onClose: () => void;
  onConfirm?: () => void;
  confirmLabel: string;
  onGiveUp?: () => void;
}) {
  const {
    isOpen,
    title,
    playerIds,
    playersById,
    selectedPlayerId,
    onSelectPlayerId,
    onClose,
    onConfirm,
    confirmLabel,
    onGiveUp
  } = props;

  const idsWithLabel = useMemo(() => {
    // Keep IdListModal simple: show playerId, but we can also log name in console if needed.
    return playerIds;
  }, [playerIds]);

  return (
    <IdListModal
      isOpen={isOpen}
      title={title}
      ids={idsWithLabel}
      selectedId={selectedPlayerId}
      onSelectId={id => {
        const p = playersById ? playersById[id] : null;
        if (p?.name) {
          console.log("Selected player:", id, p.name);
        }
        onSelectPlayerId(id);
      }}
      onClose={onClose}
      onConfirm={onConfirm}
      confirmLabel={confirmLabel}
      onGiveUp={onGiveUp}
    />
  );
}
