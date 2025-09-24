// components/ui/toast.tsx
"use client";

import { toast } from "sonner";

export type ToastType = "success" | "error" | "info" | "warning";

export type ShowToastProps = {
  type?: ToastType;
  title: string;
  description?: string;
  duration?: number;
  closeAll?: boolean;
};

export const showToast = ({
  type = "success",
  title,
  description,
  duration = 3000,
  closeAll = false
}: ShowToastProps) => {
  if (closeAll) toast.dismiss();

  toast[type](title, {
    description,
    duration
  });
};
