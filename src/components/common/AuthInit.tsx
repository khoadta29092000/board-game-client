// src/components/common/AuthInit.tsx
"use client";

import { useProfile } from "@/src/hook/user/useGetProfile";

export function AuthInit() {
  useProfile();
  return null;
}
