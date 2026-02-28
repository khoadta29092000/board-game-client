"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/src/components/ui/dialog";
import { ReactNode } from "react";

type TProps = {
  isOpen: boolean;
  handleClose: () => void;
  positionTop?: string;
  title?: string;
  description?: string;
  content?: ReactNode;
  footer?: ReactNode;
  inconRemove?: boolean; // nếu true => không cho đóng
};

export function ModalCommon({
  isOpen,
  handleClose,
  footer,
  title = "Modal Title",
  description,
  content,
  positionTop,
  inconRemove
}: TProps) {
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      if (!inconRemove) {
        handleClose();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        hideCloseButton={inconRemove}
        onPointerDownOutside={e => inconRemove && e.preventDefault()}
        onEscapeKeyDown={e => inconRemove && e.preventDefault()}
        onInteractOutside={e => inconRemove && e.preventDefault()}
        className={`max-w-lg ${positionTop ? `top-[${positionTop}] translate-y-0` : ""}`}
        style={positionTop ? { top: positionTop } : {}}
      >
        <DialogHeader className="flex items-start justify-between">
          <div>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </div>
        </DialogHeader>

        {content}

        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}
