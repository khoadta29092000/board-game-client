"use client";
import React from "react";
import { GuestLoginModal } from "../lobby/components/modal/GuestLoginModal";
import { useDisclosure } from "@/src/hook/common/useDisclosure";
import useApi from "@/src/hook/useApi";
import { useRouter } from "@/src/i18n/navigation";
import { useAuth } from "@/src/redux/global/selectors";
import { useTranslations } from "next-intl";

export default function ModalPlayGuest() {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { loginGuess, loading } = useApi();
  const t = useTranslations();
  const router = useRouter();
  const handleGuestConfirm = async (guestName: string) => {
    const res: { success: boolean; code: string; data: string | null } =
      await loginGuess({
        name: guestName
      });
    if (res?.success && res.data) {
      router.push("/lobby");
      window.dispatchEvent(new Event("authChanged"));
      onClose();
    }
  };

  const profile = useAuth();
  return (
    <>
      <button
        onClick={() => {
          // if (profile) return router.push("/lobby");
          onOpen();
        }}
        className="cursor-pointer bg-transparent border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all transform hover:scale-105"
      >
        {t("playAsGuest")}
      </button>
      <GuestLoginModal
        isOpen={isOpen}
        loading={loading}
        onClose={onClose}
        onConfirm={handleGuestConfirm}
      />
    </>
  );
}
