import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const gemIconMap: Record<string, string> = {
  White: "/images/splendor/DiamondGem.svg", // Diamond = White
  Blue: "/images/splendor/BlueGem.svg",
  Green: "/images/splendor/GreenGem.svg",
  Red: "/images/splendor/RubyGem.svg",
  Black: "/images/splendor/PurpleGem.svg", // Purple dùng cho đen (nếu bạn không có BlackGem)
  Gold: "/images/splendor/GoldGem.svg"
};
