"use client";

import useSWR from "swr";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { callProfile } from "@/src/service/user";
import { useAuth } from "@/src/redux/global/selectors";

async function verifyToken(): Promise<void> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("user_token") : null;
  if (!token) throw new Error("NO_TOKEN");
  await callProfile();
}

export const useProfile = () => {
  const reduxProfile = useAuth();
  const router = useRouter();

  const shouldFetch =
    typeof window !== "undefined" && !!localStorage.getItem("user_token");

  const { error, isValidating, mutate } = useSWR(
    shouldFetch ? "profile/verify" : null,
    verifyToken,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 6000,
      shouldRetryOnError: false,
      onError: err => {
        if (err?.response?.status === 401) {
          localStorage.removeItem("user_token");
          localStorage.removeItem("user_data");
          router.push("/login");
        }
      }
    }
  );

  const refresh = useCallback(async () => {
    await mutate();
  }, [mutate]);

  return {
    auth: reduxProfile,
    isLoading: isValidating,
    error,
    refresh
  };
};
