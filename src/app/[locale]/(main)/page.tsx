"use client";
import { ArrowRight, Gamepad2, Play, Star, Trophy, Users } from "lucide-react";
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
        {/* Hero Section */}
        <section id="home" className="py-10 lg:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-5xl mx-auto">
              <div className="relative w-full max-w-[500px] aspect-[1/1] mx-auto">
                <Image
                  src="/images/logo.svg"
                  alt="Logo"
                  fill
                  priority
                  className="object-contain"
                />
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                {t("homeHeroPlayTogether")}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {t("homeHeroWinTogether")}
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed">
                {t("homeHeroPitch")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={"/lobby"} className="">
                  <button className="sm:w-auto w-full cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-xl flex items-center justify-center space-x-2">
                    <Play className="w-6 h-6" />
                    <span>{t("homeStartPlaying")}</span>
                  </button>
                </Link>
                <button className="bg-white text-gray-800 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-50 transition-all transform hover:scale-105 shadow-lg border border-gray-200 flex items-center justify-center space-x-2">
                  <Users className="w-6 h-6" />
                  <span>{t("homeJoinCommunity")}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {t("homeWhyChoosePlatform")}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t("homeWhyChoosePitch")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl hover:shadow-xl transition-all transform hover:-translate-y-1">
                <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center mb-6">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {t("homeRealTimeMultiplayer")}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t("homeRealTimeMultiplayerPitch")}
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl hover:shadow-xl transition-all transform hover:-translate-y-1">
                <div className="bg-purple-600 w-12 h-12 rounded-full flex items-center justify-center mb-6">
                  <Gamepad2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {t("homeInteractiveTutorials")}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t("homeInteractiveTutorialsPitch")}
                </p>
              </div>

              {/* <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl hover:shadow-xl transition-all transform hover:-translate-y-1">
                <div className="bg-green-600 w-12 h-12 rounded-full flex items-center justify-center mb-6">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Tournaments
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Compete in daily tournaments and seasonal championships. Win
                  prizes and bragging rights.
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-2xl hover:shadow-xl transition-all transform hover:-translate-y-1">
                <div className="bg-orange-600 w-12 h-12 rounded-full flex items-center justify-center mb-6">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Ranking System
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Track your progress with our comprehensive ranking and
                  achievement system.
                </p>
              </div> */}

              <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-8 rounded-2xl hover:shadow-xl transition-all transform hover:-translate-y-1">
                <div className="bg-pink-600 w-12 h-12 rounded-full flex items-center justify-center mb-6">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {t("homeCrossPlatform")}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t("homeCrossPlatformPitch")}
                </p>
              </div>

              {/* <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-8 rounded-2xl hover:shadow-xl transition-all transform hover:-translate-y-1">
                <div className="bg-indigo-600 w-12 h-12 rounded-full flex items-center justify-center mb-6">
                  <Gamepad2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Smart Matchmaking
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Our AI-powered matchmaking ensures you&rsquo;re always paired
                  with players of similar skill level.
                </p>
              </div> */}
            </div>
          </div>
        </section>

        {/* Popular Games Section */}
        <section
          id="games"
          className="py-20 bg-gradient-to-br from-gray-50 to-white"
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {t("homePopularGames")}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t("homePopularGamesPitch")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                "Splendor"
                // "Checkers",
                // "Monopoly",
                // "Scrabble",
                // "Risk",
                // "Backgammon"
              ].map((game, index) => (
                <div
                  key={game}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  <div
                    className={`h-48 bg-gradient-to-br ${
                      index % 3 === 0
                        ? "from-blue-500 to-purple-600"
                        : index % 3 === 1
                          ? "from-green-500 to-blue-600"
                          : "from-purple-500 to-pink-600"
                    } flex items-center justify-center`}
                  >
                    <Gamepad2 className="w-16 h-16 text-white" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {game}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {t("homeGameCardPitch")}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-green-600 font-semibold">
                        {t("homeOnlineNow", {
                          count: onlineCount
                        })}
                      </span>
                      <Link href={`/lobby`}>
                        <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all flex items-center space-x-2">
                          <span>{t("homePlay")}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {t("homeReadyToStartPlaying")}
            </h2>
            <p className="text-xl mb-12 max-w-2xl mx-auto opacity-90">
              {t("homeCtaPitch")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg inline-block text-center"
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
