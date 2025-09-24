import { useCallback, useState } from "react";

export interface SimpleDisclosureProps {
  isOpen?: boolean;
  defaultIsOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

export const useDisclosure = ({
  isOpen: isOpenProp,
  defaultIsOpen = false,
  onOpen,
  onClose
}: SimpleDisclosureProps = {}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(defaultIsOpen);
  const isControlled = isOpenProp !== undefined;
  const isOpen = isControlled ? isOpenProp : internalIsOpen;

  const open = useCallback(() => {
    if (!isControlled) setInternalIsOpen(true);
    if (onOpen) onOpen();
  }, [isControlled, onOpen]);

  const close = useCallback(() => {
    if (!isControlled) setInternalIsOpen(false);
    if (onClose) onClose();
  }, [isControlled, onClose]);

  return { isOpen, onOpen: open, onClose: close };
};
