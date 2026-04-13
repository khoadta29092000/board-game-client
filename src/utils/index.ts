import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const costButtonClassMap: Record<string, string> = {
  White: "CostDiamondButton",
  Blue: "CostBlueButton",
  Green: "CostGreenButton",
  Red: "CostRubyButton",
  Black: "CostPurpleButton"
};

export const gemIconMap: Record<string, string> = {
  White: "/images/splendor/DiamondGem.svg",
  Blue: "/images/splendor/BlueGem.svg",
  Green: "/images/splendor/GreenGem.svg",
  Red: "/images/splendor/RubyGem.svg",
  Black: "/images/splendor/PurpleGem.svg",
  Gold: "/images/splendor/GoldGem.svg"
};

export const costIconMap: Record<string, string> = {
  White: "bg-[#1E1E2D]  border border-[#FFFFFF]/10 rounded-[4px]",
  Blue: "bg-[#0C4A6E] border border-[#FFFFFF]/10 rounded-[4px]",
  Green: "bg-[#064E3B] border border-[#FFFFFF]/10 rounded-[4px]",
  Red: "bg-[#7F1D1D] border border-[#FFFFFF]/10 rounded-[4px]",
  Black: "bg-[#3B0764] border border-[#FFFFFF]/10 rounded-[4px]"
};

export const COST_COLOR_MAP: Record<string, string> = {
  Black: "bg-gradient-to-br from-[#4C1D95] to-[#1E0A3C]",
  Green: "bg-gradient-to-br from-[#047857] to-[#022C22]",
  Blue: "bg-gradient-to-br from-[#0369A1] to-[#082F49]",
  White: "bg-gradient-to-br from-[#9CA3AF] via-[#6B7280] to-[#374151]",
  Red: "bg-gradient-to-br from-[#B91C1C] to-[#450A0A]",
  Gold: "bg-gradient-to-br from-[#B8962E] to-[#78350F]"
};
