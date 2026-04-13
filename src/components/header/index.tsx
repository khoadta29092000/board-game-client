"use client";
import { Link } from "@/src/i18n/navigation";
import Image from "next/image";
import Menu from "./menu";
import TextReveal from "../animation/textReveal";
import { Profile } from "./profile";
import Navbar from "./navbar";
import { useAuth } from "@/src/redux/global/selectors";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "./languageSwitcher";

export default function Header() {
  const t = useTranslations();
  const profile = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container max-w-11/12 mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 cursor-pointer">
            <Image
              src="/images/logo.svg"
              alt="Logo"
              className="w-auto h-10 object-contain"
              height={10}
              width={10}
              priority
            />
          </Link>
          <Menu />
          <div className="flex items-center space-x-4">
            {/* Language Switcher Dropdown */}
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>
            <TextReveal delay={0.5}>
              {mounted && profile?.Email ? (
                <Profile auth={profile} />
              ) : (
                <>
                  <Link
                    href="/login"
                    className="hidden sm:inline-flex items-center px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  >
                    {t("signIn")}
                  </Link>
                  {/* <Link
                    href="/register"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 font-medium shadow-lg"
                  >
                    {t("playNow")}
                  </Link> */}
                </>
              )}
            </TextReveal>

            <Navbar />
          </div>
        </nav>
      </div>
    </header>
  );
}
