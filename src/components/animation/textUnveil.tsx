"use client";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface TextUnveilProps {
  delay?: number;
  duration?: number;
  children?: React.ReactNode;
}

const containerVariant = {
  hidden: { y: "-100%", opacity: 0 },
  visible: {
    y: "0",
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      delayChildren: 0.2, // Đảm bảo phần tử con xuất hiện sau khi phần tử cha đã hiện
      staggerChildren: 0.3 // Thời gian cách nhau giữa các phần tử con
    }
  }
};

const textVariant = {
  hidden: { y: "-100%", opacity: 0 },
  visible: (custom: { delay: number; duration: number }) => ({
    y: "0",
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      delay: custom.delay || 0,
      duration: custom.duration
    }
  })
};

export default function TextUnveil({
  delay = 0,
  duration = 1,
  children
}: TextUnveilProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight * 0.9;
      if (isVisible) setInView(true);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.div
      ref={ref}
      className="overflow-hidden"
      variants={containerVariant}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
    >
      {children && (
        <motion.div variants={textVariant} custom={{ delay, duration }}>
          {children}
        </motion.div>
      )}
    </motion.div>
  );
}
