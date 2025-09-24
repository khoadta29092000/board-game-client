/* eslint-disable @typescript-eslint/no-explicit-any */
import { showToast } from "@/src/components/common/toast";
import messages from "./message.json";
import { useRouter } from "next/navigation";

type Messages = Record<string, string>;

const useWrapAsync = () => {
  const router = useRouter();
  const wrapAsync = async (
    apiFunction: () => Promise<any>,
    title: string,
    showSuccess: boolean = true
  ) => {
    try {
      const response = await apiFunction();
      if (showSuccess) {
        const messageTitle =
          (messages as Messages)[title + "Title"] || title + "Title";
        const messageDesc =
          (messages as Messages)[title + "Des"] || title + "Des";
        showToast({
          type: "success",
          title: messageTitle,
          description: messageDesc
        });
      }
      return response;
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("user_token");
        await router.push("/login");
      }
      const messageTitle =
        (messages as Messages)[title + "Failed"] || title + "Failed";
      showToast({
        type: "error",
        title: messageTitle,
        description: error.response?.data?.message
      });

      throw error;
    }
  };

  return { wrapAsync };
};

export default useWrapAsync;
