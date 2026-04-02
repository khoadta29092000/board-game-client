"use client";
import { ArrowRight, Gamepad2, Play, Users } from "lucide-react";
import Image from "next/image";
import { Link } from "@/src/i18n/navigation";
import ModalPlayGuest from "./_components/modalPlayGuest";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations();
  const onlineCount = 123;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <main>
        {/* ─── Hero Section ─────────────────────────────────────── */}
        <section id="home" className="py-10 lg:py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-5xl mx-auto">
              {/* Logo */}
              <div className="relative w-full max-h-[160px] sm:max-h-[180px] lg:max-h-[200px] max-w-[280px] sm:max-w-[380px] lg:max-w-[500px] aspect-square mx-auto mb-4">
                <Image
                  src="/images/logo.svg"
                  alt="Logo"
                  fill
                  priority
                  className="object-contain"
                />
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
                {t("homeHeroPlayTogether")}
                <span className="block text-sm sm:text-xl lg:text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-1">
                  {t("homeHeroWinTogether")}
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-8 sm:mb-12 leading-relaxed max-w-3xl mx-auto px-2">
                {t("homeHeroPitch")}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
                <Link href="/lobby" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-xl flex items-center justify-center gap-2">
                    <Play className="w-5 h-5" />
                    <span>{t("homeStartPlaying")}</span>
                  </button>
                </Link>
                <button className="w-full sm:w-auto bg-white text-gray-800 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-gray-50 transition-all transform hover:scale-105 shadow-lg border border-gray-200 flex items-center justify-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>{t("homeJoinCommunity")}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Features Section ─────────────────────────────────── */}
        <section id="features" className="py-14 sm:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                {t("homeWhyChoosePlatform")}
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-2">
                {t("homeWhyChoosePitch")}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
              {/* Card 1 */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 sm:p-8 rounded-2xl hover:shadow-xl transition-all transform hover:-translate-y-1">
                <div className="bg-blue-600 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-4">
                  {t("homeRealTimeMultiplayer")}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {t("homeRealTimeMultiplayerPitch")}
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 sm:p-8 rounded-2xl hover:shadow-xl transition-all transform hover:-translate-y-1">
                <div className="bg-purple-600 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                  <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-4">
                  {t("homeInteractiveTutorials")}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {t("homeInteractiveTutorialsPitch")}
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 sm:p-8 rounded-2xl hover:shadow-xl transition-all transform hover:-translate-y-1 sm:col-span-2 lg:col-span-1">
                <div className="bg-pink-600 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-4">
                  {t("homeCrossPlatform")}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {t("homeCrossPlatformPitch")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Popular Games Section ────────────────────────────── */}
        <section id="games" className="py-14 sm:py-20 bg-gradient-to-br from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                {t("homePopularGames")}
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-2">
                {t("homePopularGamesPitch")}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
              {["Splendor"].map((game, index) => (
                <div
                  key={game}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  <div
                    className={`h-36 sm:h-48 bg-gradient-to-br ${
                      index % 3 === 0
                        ? "from-blue-500 to-purple-600"
                        : index % 3 === 1
                        ? "from-green-500 to-blue-600"
                        : "from-purple-500 to-pink-600"
                    } flex items-center justify-center`}
                  >
                    <Gamepad2 className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                  </div>
                  <div className="p-4 sm:p-6">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                      {game}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-4">
                      {t("homeGameCardPitch")}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-green-600 font-semibold">
                        {t("homeOnlineNow", { count: onlineCount })}
                      </span>
                      <Link href="/lobby">
                        <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm sm:text-base hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-1.5">
                          <span>{t("homePlay")}</span>
                          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA Section ──────────────────────────────────────── */}
        <section className="py-14 sm:py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
              {t("homeReadyToStartPlaying")}
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-8 sm:mb-12 max-w-2xl mx-auto opacity-90 px-2">
              {t("homeCtaPitch")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
              <Link
                href="/register"
                className="w-full sm:w-auto bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg inline-block text-center"
              >
                {t("homeCreateFreeAccount")}
              </Link>
              <ModalPlayGuest />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
