/* eslint-disable @typescript-eslint/no-explicit-any */
import { showToast } from "@/src/components/common/toast";
import { useRouter } from "@/src/i18n/navigation";
import { useTranslations } from "next-intl";

const useWrapAsync = () => {
  const router = useRouter();
  const t = useTranslations();
  const wrapAsync = async (
    apiFunction: () => Promise<any>,
    title: string,
    showSuccess: boolean = true
  ) => {
    try {
      const response = await apiFunction();
      if (showSuccess) {
        const messageTitle = t(title + "Title");
        const messageDesc = t(title + "Des");
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
        localStorage.removeItem("user_data");
        await router.push("/login");
      }
      const messageTitle =
        t(title + "Failed");
      showToast({
        type: "error",
        title: messageTitle,
        description: error.response?.data?.error
      });

      throw error;
    }
  };

  return { wrapAsync };
};

export default useWrapAsync;
