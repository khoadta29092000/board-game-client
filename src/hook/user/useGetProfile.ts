/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useAuthSWR.ts
"use client";

import { callProfile } from "@/src/service/user";
import { TProfile } from "@/src/types/player";
import { setAuth } from "@/src/redux/global/slice";
import { useCallback } from "react";
import { useDispatch } from "react-redux";

export const useFetchProfile = () => {
  const dispatch = useDispatch();

  return useCallback(async (): Promise<TProfile | null> => {
    const token = localStorage.getItem("user_token");
    if (!token) return null;

    try {
      const res = await callProfile();
      dispatch(setAuth(res.data.data));
      return res.data.data as TProfile;
    } catch (err: any) {
      if (err?.response?.status === 401) {
        localStorage.removeItem("user_token");
        localStorage.removeItem("user_data");
        window.location.href = "/login";
      }
      return null;
    }
  }, [dispatch]);
};
