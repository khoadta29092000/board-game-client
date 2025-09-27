"use client";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface ZoomBlurRevealProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
}

export default function ScrollImage({
  children,
  delay = 0,
  duration = 0.5
}: ZoomBlurRevealProps) {
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
      initial={{
        opacity: 0.6,
        y: 100
      }}
      animate={
        inView
          ? {
              opacity: 1,
              y: 0,
              transition: {
                duration,
                delay,
                ease: "easeOut"
              }
            }
          : {}
      }
      className="overflow-hidden"
    >
      {children}
    </motion.div>
  );
}
