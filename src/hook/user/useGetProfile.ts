/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useAuthSWR.ts
"use client";

import useSWR from "swr";
import { useDispatch, useSelector } from "react-redux";
import { callProfile } from "@/src/service/user";
import { TProfile } from "@/src/types/player";
import { RootState } from "@/src/redux/store";
import { setAuth } from "@/src/redux/global/slice";

const fetchProfile = async () => {
  const token = localStorage.getItem("user_token");
  if (!token) return null;
  const res = await callProfile();

  return res.data.data as TProfile;
};

export const useGetProfile = () => {
  const auth = useSelector((state: RootState) => state.global.auth);
  const dispatch = useDispatch();

  const hasToken =
    typeof window !== "undefined" && !!localStorage.getItem("user_token");

  const shouldFetch = hasToken && !auth?.username;

  const { data, isLoading, error } = useSWR(
    shouldFetch ? "auth/profile" : null,
    fetchProfile,
    {
      onSuccess: (data: any) => {
        if (data) {
          dispatch(setAuth(data));
        }
      },
      revalidateOnFocus: false
    }
  );

  return {
    auth: auth?.username ? auth : data,
    isLoading,
    error
  };
};
