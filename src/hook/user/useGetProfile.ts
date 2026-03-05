// hooks/useProfileSWR.ts
"use client";

import useSWR from "swr";
import { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { callProfile } from "@/src/service/user";
import { setAuth } from "@/src/redux/global/slice";
import { TProfile } from "@/src/types/player";
import { useAuth } from "@/src/redux/global/selectors"; // <--- your selector

async function fetchProfile(): Promise<TProfile> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("user_token") : null;
  if (!token) throw new Error("NO_TOKEN");

  const res = await callProfile();
  const raw = res?.data?.data;
  if (!raw) throw new Error("NO_PROFILE");

  return {
    id: raw._id ?? raw.id,
    name: raw.name,
    username: raw.username,
    isVerified: raw.isVerified,
    isActive: raw.isActive
  } as TProfile;
}

export const useProfile = () => {
  const dispatch = useDispatch();
  const reduxProfile = useAuth(); // <-- use your selector

  // only fetch when reduxProfile is not present and token exists
  const shouldFetch =
    !reduxProfile &&
    typeof window !== "undefined" &&
    !!localStorage.getItem("user_token");

  const { data, error, isValidating, mutate } = useSWR<TProfile | null>(
    shouldFetch ? "profile" : null,
    fetchProfile,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 2000,
      shouldRetryOnError: false
    }
  );

  // sync SWR result into Redux
  useEffect(() => {
    if (data) {
      dispatch(setAuth(data));
    }
  }, [data, dispatch]);

  const profile = reduxProfile ?? data ?? null;
  const isLoading = shouldFetch && isValidating;

  const refresh = useCallback(async () => {
    await mutate();
  }, [mutate]);

  return { profile, isLoading, error, refresh };
};
