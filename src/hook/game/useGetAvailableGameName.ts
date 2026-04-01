import { callGetAvailableGameName } from "@/src/service/game";
import useSWR from "swr";

export const useGetAvailableGameName = () => {
  const { data, error, isLoading, mutate } = useSWR(
    "callGetAvailableGameName",
    callGetAvailableGameName,
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      dedupingInterval: 60 * 60 * 1000
    }
  );

  return {
    data: data?.data?.data ?? {},
    isLoading,
    isError: error,
    mutate
  };
};
