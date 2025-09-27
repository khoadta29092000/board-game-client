"use client";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface TextRevealProps {
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
      delayChildren: 0.2
    }
  }
};

const textVariant = {
  hidden: { opacity: 0 },
  visible: (custom: { delay: number; duration: number }) => ({
    opacity: 1,
    transition: {
      delay: custom.delay,
      duration: custom.duration
    }
  })
};

export default function TextReveal({
  delay = 0,
  duration = 1,
  children
}: TextRevealProps) {
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
