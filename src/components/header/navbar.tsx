"use client";

import * as React from "react";
import { IoIosMenu } from "react-icons/io";
import { CiShoppingBasket } from "react-icons/ci";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { FiUser, FiClock, FiLogOut, FiLogIn } from "react-icons/fi";
import { useRouter } from "next/navigation";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerTitle
} from "@/src/components/ui/drawer";

import { menuData } from "@/src/utils/contants";
import { TMenuItem } from "@/src/types/header";
import { History } from "lucide-react";
import { useAuth } from "@/src/redux/global/selectors";
import { useProfile } from "@/src/hook/user/useGetProfile";
import { setAuth } from "@/src/redux/global/slice";
import { useDispatch } from "react-redux";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useProfile();
  const reduxProfile = useAuth();
  const dispatch = useDispatch();

  // derive hasToken/LoggedIn from profile or localStorage (fallback)
  const hasToken = Boolean(
    profile ||
    reduxProfile ||
    (typeof window !== "undefined" && localStorage.getItem("user_token"))
  );
  const handleLogout = () => {
    dispatch(setAuth(null));
    localStorage.removeItem("user_token");
    localStorage.removeItem("user_data");
    router.push("/login");
  };

  return (
    <Drawer direction="left">
      <DrawerTrigger className="block sm:hidden">
        <IoIosMenu size={24} />
      </DrawerTrigger>
      <DrawerContent className="h-full" style={{ width: "70%" }}>
        <DrawerTitle></DrawerTitle>
        <div className="card w-full bg-white p-5 rounded-md">
          <ul className="w-full flex flex-col gap-1">
            {menuData.map((item: TMenuItem) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <li
                  key={item.title}
                  className="flex-center cursor-pointer p-16-semibold w-full whitespace-nowrap"
                >
                  <Link href={item.href} passHref>
                    <button
                      className={`p-16-semibold flex size-full gap-4 p-4 group font-semibold rounded-lg
                        bg-cover hover:bg-custom-green200 hover:shadow-inner focus:bg-custom-green200
                        to-custom-green300 text-gray-700 transition-all ease-linear
                        focus:shadow-inner shadow-purple-200/50 
                        ${isActive ? "bg-custom-green200 shadow-inner" : ""}`}
                    >
                      <Icon size={24} />
                      {item.title}
                    </button>
                  </Link>
                </li>
              );
            })}
          </ul>

          {hasToken && (
            <ul className="w-full flex-col mt-1 flex sm:hidden">
              <li className="flex-center cursor-pointer p-16-semibold w-full whitespace-nowrap">
                <Link href="/profile" passHref>
                  <button className="p-16-semibold flex size-full gap-4 p-4 group font-semibold rounded-lg bg-cover hover:bg-custom-green200 hover:shadow-inner focus:bg-custom-green200 text-gray-700 transition-all ease-linear focus:shadow-inner shadow-purple-200/50">
                    <FiUser size={24} />
                    Profile
                  </button>
                </Link>
              </li>
            </ul>
          )}

          {hasToken && (
            <ul className="w-full flex-col mt-1 flex sm:hidden">
              <li className="flex-center cursor-pointer p-16-semibold w-full whitespace-nowrap">
                <Link href="/history" passHref>
                  <button className="p-16-semibold flex size-full gap-4 p-4 group font-semibold rounded-lg bg-cover hover:bg-custom-green200 hover:shadow-inner focus:bg-custom-green200 text-gray-700 transition-all ease-linear focus:shadow-inner shadow-purple-200/50">
                    <History size={24} />
                    History
                  </button>
                </Link>
              </li>
            </ul>
          )}

          {hasToken ? (
            <ul className="w-full flex-col mt-1 flex sm:hidden">
              <li className="flex-center cursor-pointer p-16-semibold w-full whitespace-nowrap">
                <button
                  onClick={handleLogout}
                  className="p-16-semibold flex size-full gap-4 p-4 group font-semibold rounded-lg bg-cover hover:bg-custom-green200 hover:shadow-inner focus:bg-custom-green200 text-gray-700 transition-all ease-linear focus:shadow-inner shadow-purple-200/50"
                >
                  <FiLogOut size={24} />
                  Log out
                </button>
              </li>
            </ul>
          ) : (
            <ul className="w-full flex-col mt-1 flex sm:hidden">
              <li className="flex-center cursor-pointer p-16-semibold w-full whitespace-nowrap">
                <Link href="/login" passHref>
                  <button className="p-16-semibold flex size-full gap-4 p-4 group font-semibold rounded-lg bg-cover hover:bg-custom-green200 hover:shadow-inner focus:bg-custom-green200 text-gray-700 transition-all ease-linear focus:shadow-inner shadow-purple-200/50">
                    <FiLogIn size={24} />
                    Login
                  </button>
                </Link>
              </li>
            </ul>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
