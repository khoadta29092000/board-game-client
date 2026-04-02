"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import useSWR from "swr";
import { useCallback } from "react";
import { useRouter } from "@/src/i18n/navigation";
import { callProfile } from "@/src/service/user";
import { useAuth } from "@/src/redux/global/selectors";
import { setAuth } from "@/src/redux/global/slice";
import { useDispatch } from "react-redux";

async function verifyToken(): Promise<void> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("user_token") : null;
  if (!token) throw new Error("NO_TOKEN");
  await callProfile();
}

export const useProfile = () => {
  const reduxProfile = useAuth();
  const dispatch = useDispatch();
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
      onError: (err: any) => {
        if (err?.response?.status === 401) {
          localStorage.removeItem("user_token");
          localStorage.removeItem("user_data");
          dispatch(setAuth(null));
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
