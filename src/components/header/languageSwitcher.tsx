"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/src/i18n/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";

const containerVariant: Variants = {
  hidden: { y: "-100%", opacity: 0 },
  visible: {
    y: "0",
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      delay: 0.5
    }
  }
};

export default function LanguageSwitcher() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isLangOpen, setIsLangOpen] = useState(false);

  const itemFlag = [
    {
      title: t('english'),
      alt: 'Flag-America',
      src: '/images/language/flagAmerica.svg',
      key: 'en',
    },
    {
      title: t('vietnamese'),
      alt: 'Flag-Vietnamese',
      src: '/images/language/flagVietnamese.svg',
      key: 'vi',
    },
  ];
  const currentFlag = itemFlag.find(f => f.key === locale) || itemFlag[0];

  return (
    <motion.div 
      className="relative"
      variants={containerVariant}
      initial="hidden"
      animate="visible"
    >
      <button
        onClick={() => setIsLangOpen(!isLangOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white/70 shadow-sm hover:bg-gray-50 transition-colors"
        title={t("switch_language")}
      >
        <div className="relative w-[22px] h-[22px] rounded-full overflow-hidden border border-gray-100 shadow-sm flex-shrink-0">
          <Image src={currentFlag.src} alt={currentFlag.alt} fill className="object-cover" />
        </div>
        <span className="text-sm font-semibold text-gray-700">
          {locale === "vi" ? "VI" : "EN"}
        </span>
        <motion.svg
          animate={{ rotate: isLangOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-4 h-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {isLangOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsLangOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50 origin-top-right"
            >
              {itemFlag.map((item, i) => (
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 + 0.1 }}
                  key={item.key}
                  onClick={() => {
                    setIsLangOpen(false);
                    router.replace(pathname, { locale: item.key as any });
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                    locale === item.key ? "bg-gray-50 font-semibold text-blue-600" : "text-gray-700"
                  }`}
                >
                  <div className="relative w-[22px] h-[22px] rounded-full overflow-hidden border border-gray-100 shadow-sm flex-shrink-0">
                    <Image src={item.src} alt={item.alt} fill className="object-cover" />
                  </div>
                  {item.title}
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
