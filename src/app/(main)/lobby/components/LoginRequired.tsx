"use client";

import { useRouter } from "next/navigation";
import { LogIn, UserRound } from "lucide-react";
import { useState } from "react";
import { GuestLoginModal } from "./modal/GuestLoginModal";
import useApi from "@/src/hook/useApi";
import { useDisclosure } from "@/src/hook/common/useDisclosure";

type TProps = {
  onTokenReceived: (token: string) => void;
};

export function LoginRequired({ onTokenReceived }: TProps) {
  const router = useRouter();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { loginGuess, loading } = useApi();

  const handleGuestConfirm = async (guestName: string) => {
    const res: { success: boolean; code: string; data: string | null } =
      await loginGuess({
        name: guestName
      });
    if (res?.success && res.data) {
      localStorage.setItem("user_token", res.data);
      onClose();
      onTokenReceived(res.data);
    }
  };

  return (
    <>
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-2xl mx-auto">
          {/* Title */}
          <div className="text-center mb-8 space-y-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Join the Game
            </h2>
            <p className="text-sm text-gray-500">Choose how you want to play</p>
          </div>

          {/* Options — stack on mobile, side-by-side on desktop */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Login with Account */}
            <button
              onClick={() => router.push("/login")}
              className="flex-1 flex sm:flex-col items-center sm:items-start gap-4 sm:gap-3 px-5 py-5 rounded-2xl border-2 border-blue-500 bg-blue-50 hover:bg-blue-100 transition-colors group text-left"
            >
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <LogIn className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-blue-700 text-sm sm:text-base">
                  Login with Account
                </p>
                <p className="text-xs text-blue-500 mt-0.5">
                  Save progress, track stats, climb ranks
                </p>
              </div>
            </button>

            {/* Divider — horizontal on mobile, vertical on desktop */}
            <div className="flex sm:flex-col items-center justify-center gap-2  sm:hidden">
              <div className="flex-1 sm:flex-none h-px sm:h-full sm:w-px sm:min-h-[80px] bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium shrink-0">
                or
              </span>
              <div className="flex-1 sm:flex-none h-px sm:h-full sm:w-px sm:min-h-[80px] bg-gray-200" />
            </div>

            {/* Continue as Guest */}
            <button
              onClick={() => onOpen()}
              className="flex-1 flex sm:flex-col items-center sm:items-start gap-4 sm:gap-3 px-5 py-5 rounded-2xl border-2 border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 transition-colors group text-left"
            >
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <UserRound className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-700 text-sm sm:text-base">
                  Continue as Guest
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Quick play, no registration needed
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Guest modal */}
      <GuestLoginModal
        isOpen={isOpen}
        loading={loading}
        onClose={onClose}
        onConfirm={handleGuestConfirm}
      />
    </>
  );
}
