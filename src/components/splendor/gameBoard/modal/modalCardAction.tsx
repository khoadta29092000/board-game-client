import React from "react";
import { SplendorCard } from "@/src/types/splendor";
import { ModalCommon } from "@/src/components/common/modal";
import { Button } from "@/src/components/ui/button";
import SplendorCardUI from "../SplendorCardUI";

type Props = {
  isOpen: boolean;
  card: SplendorCard;
  onClose: () => void;
  onPurchase?: () => void;
  onReserve?: () => void;
};

export default function ModalCardAction({
  isOpen,
  card,
  onClose,
  onPurchase,
  onReserve
}: Props) {
  return (
    <ModalCommon
      isOpen={isOpen}
      handleClose={onClose}
      title="Card Action"
      description="What would you like to do with this card?"
      content={
        <div className="flex justify-center py-2">
          <div className="w-[120px]">
            <SplendorCardUI card={card} />
          </div>
        </div>
      }
      footer={
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {onReserve && (
            <Button
              variant="secondary"
              onClick={onReserve}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              Reserve
            </Button>
          )}
          {onPurchase && (
            <Button
              onClick={onPurchase}
              className="bg-green-600 hover:bg-green-700"
            >
              Purchase
            </Button>
          )}
        </div>
      }
    />
  );
}