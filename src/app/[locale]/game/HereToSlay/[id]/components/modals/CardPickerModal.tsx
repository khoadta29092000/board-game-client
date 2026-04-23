/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

type CardLike = any;

export type CardPickerItem = {
  card: CardLike;
  meta?: React.ReactNode;
};

export default function CardPickerModal(props: {
  isOpen: boolean;
  title: string;
  subtitle?: React.ReactNode;
  items: CardPickerItem[];
  selectedCardId: string | null;
  onSelectCardId: (cardId: string) => void;
  onClose: () => void;
  footer?: React.ReactNode;
  getCardId: (c: any) => string | null;
}) {
  const {
    isOpen,
    title,
    subtitle,
    items,
    selectedCardId,
    onSelectCardId,
    onClose,
    footer,
    getCardId
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

        {subtitle ? <div style={{ marginTop: 10 }}>{subtitle}</div> : null}

        <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
          {items.length === 0 ? (
            <div style={{ opacity: 0.8, fontSize: 12 }}>No cards to show.</div>
          ) : (
            items.map((x) => {
              const cardId = getCardId(x.card);
              if (!cardId) return null;
              const isSelected = cardId === selectedCardId;
              const card = x.card;
              return (
                <button
                  key={cardId}
                  className="text-left px-3 py-2 rounded-md"
                  onClick={() => onSelectCardId(cardId)}
                  style={{
                    border: "1px solid " + (isSelected ? "#3b82f6" : "#333"),
                    background: isSelected ? "rgba(59,130,246,0.15)" : "#111",
                    color: "white",
                    overflowWrap: "anywhere",
                    display: "flex",
                    gap: 10,
                    alignItems: "center"
                  }}
                >
                  {card?.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={card.imageUrl}
                      alt={cardId}
                      style={{
                        width: 44,
                        height: 64,
                        objectFit: "cover",
                        borderRadius: 6,
                        border: "1px solid #333",
                        flex: "0 0 auto"
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 44,
                        height: 64,
                        borderRadius: 6,
                        border: "1px solid #333",
                        background: "#0f0f0f",
                        flex: "0 0 auto"
                      }}
                    />
                  )}

                  <div style={{ minWidth: 0, flex: "1 1 auto" }}>
                    <div style={{ fontWeight: 700 }}>
                      {card?.heroClass ?? card?.type ?? "Card"}
                    </div>
                    {card?.configId ? (
                      <div style={{ fontSize: 12, opacity: 0.85 }}>
                        config: {String(card.configId)}
                      </div>
                    ) : null}
                    <div style={{ fontFamily: "monospace", fontSize: 12, opacity: 0.9 }}>
                      {cardId}
                    </div>
                    {x.meta ? (
                      <div style={{ marginTop: 6, fontSize: 12, opacity: 0.85 }}>
                        {x.meta}
                      </div>
                    ) : null}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {footer ? <div style={{ marginTop: 12 }}>{footer}</div> : null}
      </div>
    </div>
  );
}

