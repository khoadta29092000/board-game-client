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

type Props = {
  isOpen: boolean;
  onClose: () => void;
  agree: () => void;
  isLoading: boolean;
  title: string;
};

const ModalConfirmComponent: FC<Props> = ({
  isOpen,
  onClose,
  agree,
  isLoading,
  title
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="capitalize">{title}</DialogTitle>
          <DialogDescription>
            Do you want <strong className="lowercase">{title}</strong>?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="destructive" onClick={onClose}>
            No
          </Button>
          <Button onClick={agree} disabled={isLoading}>
            {isLoading ? "Loading..." : "Yes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModalConfirmComponent;
