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
};

export function ModalCommon({
  isOpen,
  handleClose,
  footer,
  title = "Modal Title",
  description,
  content,
  positionTop
}: TProps) {
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className={`max-w-lg ${
          positionTop ? `top-[${positionTop}] translate-y-0` : ""
        }`}
        style={positionTop ? { top: positionTop } : {}}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {content}

        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}
