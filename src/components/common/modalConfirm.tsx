"use client";

import { FC } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "../ui/dialog";
import { Button } from "../ui/button";
import { useTranslations } from "next-intl";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  agree: () => void;
  isLoading: boolean;
  title: string;
  description?: React.ReactNode;
};

const ModalConfirmComponent: FC<Props> = ({
  isOpen,
  onClose,
  agree,
  isLoading,
  title,
  description = ""
}) => {
  const t = useTranslations();
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="capitalize">{title}</DialogTitle>
          <DialogDescription>
            {description ? (
              description
            ) : (
                <>{t("confirm_default_desc", { title: title.toLowerCase() })}</>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="destructive" onClick={onClose}>
            {t("confirm_no")}
          </Button>
          <Button onClick={agree} disabled={isLoading}>
            {isLoading ? t("confirm_loading") : t("confirm_yes")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModalConfirmComponent;
