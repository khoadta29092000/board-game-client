/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "sonner";
import { useRouter } from "@/src/i18n/navigation";
import { useSignalR } from "@/src/components/signalR/signalRProvider";
import { ModalCommon } from "@/src/components/common/modal";
import { Button } from "@/src/components/ui/button";
import { RoomType } from "@/src/types/room";
import { useGetAvailableGameName } from "@/src/hook/game/useGetAvailableGameName";
import { useTranslations } from "next-intl";
import { Eye, EyeOff } from "lucide-react";

type TProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function CreateRoomModal({ isOpen, onClose }: TProps) {
  const router = useRouter();
  const { isConnected, invoke, off } = useSignalR();
  const [isCreating, setIsCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { data: gamesData, isLoading: isGamesLoading } = useGetAvailableGameName();
  const gameNames = useMemo(() => Object.keys(gamesData || {}), [gamesData]);
  const t = useTranslations();

  const schema = useMemo(
    () =>
      yup.object().shape({
        gameName: yup.string().required(t("lobby_create_err_game")),
        quantityPlayer: yup
          .number()
          .required(t("lobby_create_err_players")),
        roomType: yup.string().required(t("lobby_create_err_type")),
        password: yup.string().when("roomType", {
          is: (val: string) => val === RoomType.Private,
          then: schema => schema.required(t("lobby_create_err_pwd")),
          otherwise: schema => schema.notRequired()
        })
      }),
    [t]
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      gameName: "Splendor",
      quantityPlayer: 4,
      roomType: RoomType.Public,
      password: ""
    }
  });

  const watchRoomType = watch("roomType");
  const watchGameName = watch("gameName");
  const watchQuantityPlayer = watch("quantityPlayer");

  const availablePlayers = useMemo(() => {
    if (!watchGameName || !gamesData || !gamesData[watchGameName]) return [];
    return gamesData[watchGameName];
  }, [watchGameName, gamesData]);

  useEffect(() => {
    if (availablePlayers.length > 0 && (!watchQuantityPlayer || !availablePlayers.includes(watchQuantityPlayer))) {
      setValue("quantityPlayer", availablePlayers[0]);
    }
  }, [availablePlayers, watchQuantityPlayer, setValue]);

  useEffect(() => {
    if (isOpen && gameNames.length > 0) {
      reset({
        gameName: gameNames[0],
        quantityPlayer: gamesData[gameNames[0]]?.[0] || 4,
        roomType: RoomType.Public,
        password: ""
      });
    }
  }, [isOpen, gameNames, gamesData, reset]);

  const submitCreateRoom = async (data: any) => {
    if (!isConnected) {
      toast.error("Not connected to server");
      return;
    }

    try {
      setIsCreating(true);
      off("RoomUpdated");
      
      const payload = {
        ...data,
        password: data.roomType === RoomType.Private ? data.password : null
      };

      const roomId = await invoke("CreateSettingRoom", payload);
      if (roomId && roomId.room) {
        onClose();
        sessionStorage.setItem(`room_pwd_${roomId.room.id}`, data.password);
        router.push(`/lobby/${roomId.room.id}`);
      } else {
        setIsCreating(false);
      }
    } catch (error) {
      console.error("Create room error:", error);
      toast.error("Failed to create room");
      setIsCreating(false);
    }
  };

  const CreateRoomContent = (
    <form
      id="create-room-form"
      onSubmit={handleSubmit(submitCreateRoom)}
      className="space-y-4"
    >
      <div>
        <label className="block txt-14 font-inter mb-2 text-black">
          {t("lobby_create_game_lbl")}
          <span className="text-primary-400"> *</span>
        </label>
        <select
          {...register("gameName")}
          className="text-black w-full border border-gray-300 rounded px-4 py-2 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isGamesLoading}
        >
          {isGamesLoading ? (
            <option value="">{t("lobby_create_loading")}</option>
          ) : (
            gameNames
              .filter((name: string) => name.toLowerCase().includes("splendor"))
              .map((name: string) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))
          )}
        </select>
        {errors.gameName && (
          <p className="text-red-500 text-sm mt-1">{errors.gameName.message}</p>
        )}
      </div>

      <div>
        <label className="block txt-14 font-inter mb-2 text-black">
          {t("lobby_create_players_lbl")}
          <span className="text-primary-400"> *</span>
        </label>
        <select
          {...register("quantityPlayer", { valueAsNumber: true })}
          className="text-black w-full border border-gray-300 rounded px-4 py-2 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={availablePlayers.length === 0}
        >
          {availablePlayers.map((num: number) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
        {errors.quantityPlayer && (
          <p className="text-red-500 text-sm mt-1">
            {errors.quantityPlayer.message}
          </p>
        )}
      </div>

      <div>
        <label className="block txt-14 font-inter mb-2 text-black">
          {t("lobby_create_type_lbl")}
          <span className="text-primary-400"> *</span>
        </label>
        <select
          {...register("roomType")}
          className="text-black w-full border border-gray-300 rounded px-4 py-2 bg-white"
        >
          <option value={RoomType.Public}>{t("lobby_create_public")}</option>
          <option value={RoomType.Private}>{t("lobby_create_private")}</option>
        </select>
        {errors.roomType && (
          <p className="text-red-500 text-sm mt-1">{errors.roomType.message}</p>
        )}
      </div>

      {watchRoomType === RoomType.Private && (
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
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>
      )}
    </form>
  );

  const CreateRoomFooter = (
    <div className="flex gap-3 justify-end">
      <Button variant="outline" type="button" onClick={onClose} disabled={isCreating}>
        {t("lobby_cancel_btn")}
      </Button>
      <Button
        type="submit"
        form="create-room-form"
        disabled={isCreating}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        {isCreating ? t("lobby_creating_btn") : t("lobby_create_title")}
      </Button>
    </div>
  );

  return (
    <ModalCommon
      isOpen={isOpen}
      handleClose={onClose}
      title={t("lobby_create_title")}
      description={t("lobby_create_desc")}
      content={CreateRoomContent}
      footer={CreateRoomFooter}
      positionTop="120px"
    />
  );
}
