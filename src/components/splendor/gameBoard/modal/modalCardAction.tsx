import React from "react";
import { SplendorCard } from "@/src/types/splendor";
import { ModalCommon } from "@/src/components/common/modal";
import { Button } from "@/src/components/ui/button";
import SplendorCardUI from "../SplendorCardUI";
import { TutorialStep } from "@/src/hook/game/useTutorialSteps";
import { useTranslations } from "next-intl";

type Props = {
  isOpen: boolean;
  card: SplendorCard;
  onClose: () => void;
  onPurchase?: () => void;
  onReserve?: () => void;
  currentStep: TutorialStep | null;
};

export default function ModalCardAction({
  isOpen,
  card,
  onClose,
  onPurchase,
  onReserve,
  currentStep = null
}: Props) {
  const t = useTranslations();
  const isReserve = currentStep !== null && currentStep.id !== 5;
  const isPurchase = currentStep !== null && currentStep.id !== 6;
  return (
    <ModalCommon
      isOpen={isOpen}
      handleClose={onClose}
      title={t("card_action_title")}
      description={t("card_action_desc")}
      content={
        <div className="flex justify-center py-2">
          <div className="w-48 h-48">
            <SplendorCardUI card={card} />
          </div>
        </div>
      }
      footer={
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>
            {t("cancel")}
          </Button>
          {onReserve && (
            <Button
              variant="secondary"
              onClick={onReserve}
              disabled={isPurchase}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              {t("card_action_reserve")}
            </Button>
          )}
          {onPurchase && (
            <Button
              onClick={onPurchase}
              disabled={isReserve}
              className="bg-green-600 hover:bg-green-700"
            >
              {t("card_action_purchase")}
            </Button>
          )}
        </div>
      }
    />
  );
}
