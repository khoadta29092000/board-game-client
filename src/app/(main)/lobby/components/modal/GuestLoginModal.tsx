"use client";

import { useState, useEffect } from "react";
import { ModalCommon } from "@/src/components/common/modal";
import { Button } from "@/src/components/ui/button";
import { Loader2, RefreshCw, User } from "lucide-react";

const ADJECTIVES = [
  "Swift",
  "Brave",
  "Silent",
  "Golden",
  "Iron",
  "Crimson",
  "Shadow",
  "Storm",
  "Frost",
  "Ember",
  "Jade",
  "Neon",
  "Cosmic",
  "Wild",
  "Steel",
  "Onyx"
];
const NOUNS = [
  "Fox",
  "Wolf",
  "Eagle",
  "Tiger",
  "Dragon",
  "Phoenix",
  "Lynx",
  "Viper",
  "Hawk",
  "Raven",
  "Panda",
  "Shark",
  "Bear",
  "Falcon",
  "Cobra",
  "Lion"
];

function randomGuestName() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 900) + 100;
  return `${adj}${noun}${num}`;
}

type TProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string) => Promise<void>;
  loading: boolean; // ← từ useApi
};

export function GuestLoginModal({
  isOpen,
  onClose,
  onConfirm,
  loading
}: TProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName(randomGuestName());
      setError("");
    }
  }, [isOpen]);

  const handleRefresh = () => {
    setName(randomGuestName());
    setError("");
  };

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) return setError("Please enter a name");
    if (trimmed.length < 2)
      return setError("Name must be at least 2 characters");
    if (trimmed.length > 20)
      return setError("Name must be at most 20 characters");

    try {
      setError("");
      await onConfirm(trimmed);
    } catch {
      setError("Failed to create guest session. Please try again.");
    }
  };

  const ContentModal = (
    <div className="space-y-5">
      <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
          <User className="w-5 h-5 text-amber-600" />
        </div>
        <p className="text-sm text-amber-800">
          Playing as guest — your progress won&apos;t be saved after the session
          ends.
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          Display Name <span className="text-red-500">*</span>
        </label>

        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={e => {
              setName(e.target.value);
              setError("");
            }}
            onKeyDown={e => e.key === "Enter" && !loading && handleSubmit()}
            maxLength={20}
            placeholder="Enter your name..."
            disabled={loading}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            title="Generate random name"
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="flex justify-between items-center">
          {error ? (
            <p className="text-xs text-red-500">{error}</p>
          ) : (
            <p className="text-xs text-gray-400">
              Auto-generated — change it if you want
            </p>
          )}
          <span className="text-xs text-gray-400">{name.length}/20</span>
        </div>
      </div>
    </div>
  );

  const FooterModal = (
    <div className="flex gap-3 justify-end">
      <Button variant="outline" onClick={onClose} disabled={loading}>
        Cancel
      </Button>
      <Button
        onClick={handleSubmit}
        disabled={loading || !name.trim()}
        className="min-w-[130px] bg-amber-500 hover:bg-amber-600 text-white"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin mr-2 w-4 h-4" />
            Joining...
          </>
        ) : (
          "Play as Guest"
        )}
      </Button>
    </div>
  );

  return (
    <ModalCommon
      isOpen={isOpen}
      handleClose={onClose}
      title="Continue as Guest"
      description="Choose a display name to start playing right away."
      content={ContentModal}
      footer={FooterModal}
      positionTop="120px"
    />
  );
}
