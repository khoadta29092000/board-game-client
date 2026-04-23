import React from "react";

export default function IdListModal(props: {
  isOpen: boolean;
  title: string;
  ids: string[];
  selectedId: string | null;
  onSelectId: (id: string) => void;
  onClose: () => void;
  onConfirm?: () => void;
  confirmLabel: string;
  onGiveUp?: () => void;
}) {
  const {
    isOpen,
    title,
    ids,
    selectedId,
    onSelectId,
    onClose,
    onConfirm,
    confirmLabel,
    onGiveUp
  } = props;

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 50
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(820px, 100%)",
          background: "#0b0b0b",
          border: "1px solid #333",
          borderRadius: 12,
          padding: 16
        }}
      >
        <div className="flex items-center justify-between gap-2">
          <div style={{ fontWeight: 700, fontSize: 16 }}>{title}</div>
          <button
            className="bg-gray-700 text-white px-3 py-1 rounded-md"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div style={{ marginTop: 10, opacity: 0.8, fontSize: 12 }}>
          Valid targets: {String(ids.length)}
        </div>

        <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
          {ids.length === 0 ? (
            <div style={{ opacity: 0.8, fontSize: 12 }}>No valid targets.</div>
          ) : (
            ids.map((id) => {
              const isSelected = id === selectedId;
              return (
                <button
                  key={id}
                  className="text-left px-3 py-2 rounded-md"
                  onClick={() => onSelectId(id)}
                  style={{
                    border: "1px solid " + (isSelected ? "#3b82f6" : "#333"),
                    background: isSelected ? "rgba(59,130,246,0.15)" : "#111",
                    color: "white",
                    overflowWrap: "anywhere",
                    fontFamily: "monospace",
                    fontSize: 12
                  }}
                >
                  {id}
                </button>
              );
            })
          )}
        </div>

        <div className="flex gap-2 justify-end" style={{ marginTop: 12 }}>
          <button className="bg-gray-700 text-white px-4 py-2 rounded-md" onClick={onClose}>
            Cancel
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
            onClick={onConfirm}
            disabled={!selectedId}
          >
            {confirmLabel}
          </button>
          <button className="bg-gray-700 text-white px-4 py-2 rounded-md" onClick={onGiveUp}>
            Give up
          </button>
        </div>
      </div>
    </div>
  );
}

