import { getRequestConfig } from "next-intl/server";

const validLocales = ["en", "vi"];

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const resolvedLocale = validLocales.includes(requested ?? "")
    ? requested!
    : "en";

  const messages = (await import(`../../messages/${resolvedLocale}.json`))
    .default;

  return {
    locale: resolvedLocale,
    messages,
    getMessageFallback: ({ key }) => key,
    onError: error => {
      if (error.code === "MISSING_MESSAGE") {
        console.warn(`[next-intl] Missing translation: ${error.originalMessage || error.message}`);
        return;
      }
      console.error("[next-intl] Error:", error);
    }
  };
});
