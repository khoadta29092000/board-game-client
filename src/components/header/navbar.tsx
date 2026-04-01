"use client";

import { IoIosMenu } from "react-icons/io";
import { Link, usePathname, useRouter } from "@/src/i18n/navigation";
import { FiUser, FiLogOut, FiLogIn } from "react-icons/fi";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerTitle
} from "@/src/components/ui/drawer";

import { menuData } from "@/src/utils/contants";
import { TMenuItem } from "@/src/types/header";
import { History } from "lucide-react";
import { setAuth } from "@/src/redux/global/slice";
import { useDispatch } from "react-redux";
import { useAuth } from "@/src/redux/global/selectors";
import { useTranslations } from "next-intl";

export default function Navbar() {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const profile = useAuth();

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
                      {t(item.title)}
                    </button>
                  </Link>
                </li>
              );
            })}
          </ul>

          {profile && (
            <ul className="w-full flex-col mt-1 flex sm:hidden">
              <li className="flex-center cursor-pointer p-16-semibold w-full whitespace-nowrap">
                <Link href="/profile" passHref>
                  <button className="p-16-semibold flex size-full gap-4 p-4 group font-semibold rounded-lg bg-cover hover:bg-custom-green200 hover:shadow-inner focus:bg-custom-green200 text-gray-700 transition-all ease-linear focus:shadow-inner shadow-purple-200/50">
                    <FiUser size={24} />
                    {t("profile")}
                  </button>
                </Link>
              </li>
            </ul>
          )}

          {profile && (
            <ul className="w-full flex-col mt-1 flex sm:hidden">
              <li className="flex-center cursor-pointer p-16-semibold w-full whitespace-nowrap">
                <Link href="/history" passHref>
                  <button className="p-16-semibold flex size-full gap-4 p-4 group font-semibold rounded-lg bg-cover hover:bg-custom-green200 hover:shadow-inner focus:bg-custom-green200 text-gray-700 transition-all ease-linear focus:shadow-inner shadow-purple-200/50">
                    <History size={24} />
                    {t("history")}
                  </button>
                </Link>
              </li>
            </ul>
          )}

          {profile ? (
            <ul className="w-full flex-col mt-1 flex sm:hidden">
              <li className="flex-center cursor-pointer p-16-semibold w-full whitespace-nowrap">
                <button
                  onClick={handleLogout}
                  className="p-16-semibold flex size-full gap-4 p-4 group font-semibold rounded-lg bg-cover hover:bg-custom-green200 hover:shadow-inner focus:bg-custom-green200 text-gray-700 transition-all ease-linear focus:shadow-inner shadow-purple-200/50"
                >
                  <FiLogOut size={24} />
                  {t("logOut")}
                </button>
              </li>
            </ul>
          ) : (
            <ul className="w-full flex-col mt-1 flex sm:hidden">
              <li className="flex-center cursor-pointer p-16-semibold w-full whitespace-nowrap">
                <Link href="/login" passHref>
                  <button className="p-16-semibold flex size-full gap-4 p-4 group font-semibold rounded-lg bg-cover hover:bg-custom-green200 hover:shadow-inner focus:bg-custom-green200 text-gray-700 transition-all ease-linear focus:shadow-inner shadow-purple-200/50">
                    <FiLogIn size={24} />
                    {t("login")}
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
