"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "sonner";
import { useRouter } from "@/src/i18n/navigation";
import { useSignalR } from "@/src/components/signalR/signalRProvider";
import { ModalCommon } from "@/src/components/common/modal";
import { Button } from "@/src/components/ui/button";
import { useTranslations } from "next-intl";
import { Eye, EyeOff, Lock } from "lucide-react";

type TProps = {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
};

type FormData = {
  password: string;
};

export function JoinPrivateRoomModal({ isOpen, onClose, roomId }: TProps) {
  const router = useRouter();
  const { isConnected, invoke } = useSignalR();
  const [isJoining, setIsJoining] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const t = useTranslations();

  const schema = yup.object().shape({
    password: yup.string().required(t("lobby_join_pwd_required"))
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: { password: "" }
  });

  const handleClose = () => {
    reset();
    setShowPassword(false);
    onClose();
  };

  const submitJoinRoom = async (data: FormData) => {
    if (!isConnected) {
      toast.error("Not connected to server");
      return;
    }

    try {
      setIsJoining(true);
      const result = await invoke("JoinRoom", { roomId, password: data.password });

      if (result?.success) {
        handleClose();
        router.push(`/lobby/${roomId}`);
      } else {
        toast.error(result?.error ?? "Failed to join room");
        setIsJoining(false);
      }
    } catch (error) {
      console.error("Join private room error:", error);
      toast.error("Failed to join room");
      setIsJoining(false);
    }
  };

  const Content = (
    <form
      id="join-private-room-form"
      onSubmit={handleSubmit(submitJoinRoom)}
      className="space-y-4"
    >
      <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
        <Lock className="h-4 w-4 text-yellow-600 shrink-0" />
        <p className="text-sm text-yellow-700">
          {t("lobby_join_private_desc")}
        </p>
      </div>

      <div>
        <label className="block txt-14 font-inter mb-2 text-black">
          {t("lobby_join_pwd_lbl")}
          <span className="text-primary-400"> *</span>
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            {...register("password")}
            className="text-black w-full border border-gray-300 rounded px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t("lobby_join_pwd_placeholder")}
            autoFocus
          />
          <button
            type="button"
            onClick={() => setShowPassword(prev => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
        )}
      </div>
    </form>
  );

  const Footer = (
    <div className="flex gap-3 justify-end">
      <Button variant="outline" type="button" onClick={handleClose} disabled={isJoining}>
        {t("lobby_cancel_btn")}
      </Button>
      <Button
        type="submit"
        form="join-private-room-form"
        disabled={isJoining}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        {isJoining ? t("lobby_joining") : t("lobby_join_btn")}
      </Button>
    </div>
  );

  return (
    <ModalCommon
      isOpen={isOpen}
      handleClose={handleClose}
      title={t("lobby_join_private_title")}
      description={t("lobby_join_private_subtitle")}
      content={Content}
      footer={Footer}
      positionTop="120px"
    />
  );
}
