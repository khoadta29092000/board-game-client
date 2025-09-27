"use client";

import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { FiUser, FiLogOut } from "react-icons/fi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { TDataToken } from "@/src/types/player";
import { setAuth } from "@/src/redux/global/slice";
import { Avatar, AvatarFallback } from "../ui/avatar";

type TProps = {
  auth: TDataToken;
};

export function Profile({ auth }: TProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const handleLogout = () => {
    dispatch(setAuth(null));
    localStorage.removeItem("user_token");
    router.push("/");
  };
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="focus:outline-none">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-blue-500 text-white font-semibold">
              {auth.Name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="
       mt-8 md:mt-0 
       bg-white 
       rounded-[8px] 
       p-[8px_10px] 
       shadow-lg 
       flex flex-col 
       text-gray-800
       border border-gray-200
     "
        align="center"
        side="bottom"
      >
        <div className="flex flex-col">
          <div className="flex gap-2 w-full rounded-[4px] bg-gray-200 backdrop-blur-none md:backdrop-blur-[15px] py-4 px-2">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-blue-500 text-white font-semibold">
                {auth.Name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <h2 className="txt-16 font-bold break-all">{auth?.Email}</h2>
              <p className="txt-14  font-medium break-all">{auth?.Name}</p>
            </div>
          </div>
          <Link href={"/profile"}>
            <button
              type="button"
              className="txt-18 px-4 py-2 flex items-center gap-4 text-left hover:bg-custom-hover-bg-200 transition-colors w-full cursor-pointer"
            >
              <FiUser className="w-5 h-5" />
              Profile
            </button>
          </Link>

          <button
            onClick={handleLogout}
            type="button"
            className="txt-18 px-4 py-2 flex items-center gap-4 text-left text-red-500 hover:bg-custom-hover-bg-200 hover:text-red-600 transition-colors w-full cursor-pointer"
          >
            <FiLogOut className="w-5 h-5" />
            Log Out
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
