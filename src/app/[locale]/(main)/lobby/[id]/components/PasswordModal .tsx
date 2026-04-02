"use client";

import React, { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { useTranslations } from "next-intl";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";

export const PasswordModal = React.memo(({
  isOpen,
  isJoining,
  onClose,
  onSubmit
}: {
  isOpen: boolean;
  isJoining: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
}) => {
  const t = useTranslations();
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!password.trim()) {
      setError(t("lobby_join_pwd_required"));
      return;
    }
    setError("");
    onSubmit(password);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6 space-y-4">
        {/* Header */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {t("lobby_join_private_title")}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {t("lobby_join_private_subtitle")}
          </p>
        </div>

        {/* Warning */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
          <Lock className="h-4 w-4 text-yellow-600 shrink-0" />
          <p className="text-sm text-yellow-700">{t("lobby_join_private_desc")}</p>
        </div>

        {/* Input */}
        <div>
          <label className="block text-sm font-medium mb-2 text-black">
            {t("lobby_join_pwd_lbl")}
            <span className="text-red-500"> *</span>
          </label>
          <div className="relative">
            <input
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={e => { setPassword(e.target.value); setError(""); }}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              className="text-black w-full border border-gray-300 rounded px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t("lobby_join_pwd_placeholder")}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPwd(prev => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" onClick={onClose} disabled={isJoining}>
            {t("lobby_cancel_btn")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isJoining}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isJoining
              ? <><Loader2 className="animate-spin h-4 w-4 mr-2" />{t("lobby_joining")}</>
              : t("lobby_join_btn")
            }
          </Button>
        </div>
      </div>
    </div>
  );
});

PasswordModal.displayName = "PasswordModal";