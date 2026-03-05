/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useAuthSWR.ts
"use client";

import { callMyHistoryApi } from "@/src/service/history";
import { useState } from "react";
import useSWR from "swr";

export const useGetMyHistory = () => {
  const [page, setPage] = useState(1);
  const [limit, setPageSize] = useState(100);

  const params = {
    key: "callMyHistoryApi",
    limit
  };

  const { data, error, isLoading, mutate } = useSWR(params, callMyHistoryApi, {
    revalidateOnFocus: false,
    revalidateOnMount: true,
    revalidateOnReconnect: true
  });
  return {
    data: data?.data ?? [],
    isLoading,
    isError: error,
    mutate,
    page,
    setPageSize,
    setPage,
    limit
  };
};
