import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Variants } from "framer-motion";

interface ScrollFadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
}

export default function ScrollFadeIn({
  children,
  delay = 0,
  duration = 1
}: ScrollFadeInProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const blurFadeInVariant: Variants = {
    hidden: { opacity: 0, filter: "blur(10px)", y: 30 },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        delay,
        duration,
        ease: "easeOut"
      }
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const inView = rect.top <= window.innerHeight * 0.85;

      if (inView) {
        setIsVisible(true);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.div
      ref={ref}
      variants={blurFadeInVariant}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
    >
      {children}
    </motion.div>
  );
}
