"use client";
import { Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";
import { useTranslations } from "next-intl";

export const Footer = () => {
  const t = useTranslations();
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Image
              src="/images/logo.svg"
              alt="Logo"
              className="w-auto h-12 object-contain filter brightness-0 invert"
              height={12}
              width={12}
              priority
            />
            <p className="text-gray-400 leading-relaxed">
              {t("footerDescription")}
            </p>
            <div className="flex space-x-4">
              <FaFacebook className="w-5 h-5 text-gray-400 hover:text-blue-500 cursor-pointer transition-colors" />
              <FaTwitter className="w-5 h-5 text-gray-400 hover:text-blue-400 cursor-pointer transition-colors" />
              <FaInstagram className="w-5 h-5 text-gray-400 hover:text-pink-500 cursor-pointer transition-colors" />
              <FaYoutube className="w-5 h-5 text-gray-400 hover:text-red-500 cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">
              {t("footerQuickLinks")}
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#games"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {t("footerPopularGames")}
                </a>
              </li>
              <li>
                <a
                  href="#leaderboard"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {t("footerLeaderboard")}
                </a>
              </li>
              <li>
                <a
                  href="#community"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {t("footerCommunity")}
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">
              {t("footerSupport")}
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#help"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {t("footerHelpCenter")}
                </a>
              </li>
              <li>
                <a
                  href="#rules"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {t("footerGameRules")}
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {t("footerFaq")}
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {t("footerContactUs")}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">
              {t("footerContact")}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400">khoadta.job@gmail.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400">+84 335739928</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400">Viet Nam</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">{t("footerCopyright")}</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a
              href="#privacy"
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              {t("footerPrivacyPolicy")}
            </a>
            <a
              href="#terms"
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              {t("footerTermsOfService")}
            </a>
            <a
              href="#cookies"
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              {t("footerCookiePolicy")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
