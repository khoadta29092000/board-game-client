"use client";

import { motion } from "framer-motion";
import { usePathname, useRouter } from "@/src/i18n/navigation";
import { TMenuItem } from "@/src/types/header";
import { menuData } from "@/src/utils/contants";
import { Variants } from "framer-motion";
import { useTranslations } from "next-intl";


const itemVariants: Variants = {
  hidden: { x: -20, opacity: 0 },
  show: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", damping: 20 }
  }
};
const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Menu() {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <motion.div
      className="hidden sm:flex items-center space-x-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      
      {menuData.map((item: TMenuItem) => (
        <motion.div
          key={item.title}
          variants={itemVariants}
          className="relative pl-1 cursor-pointer"
          onClick={() => router.push(item.href)}
        >
          <p className="font-medium txt-14 text-custom-green100 uppercase relative z-[20]">
            {t(item.title)}
          </p>
          {item.href === pathname && (
            <motion.div
              layoutId="underline"
              className="w-full h-[9px] bg-custom-green200 absolute bottom-0 left-0 z-[10]"
            />
          )}
        </motion.div>
      ))}
      
    </motion.div>
  );
}
