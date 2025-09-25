"use client";

import { ModalCommon } from "@/src/components/common/modal";
import useApi from "@/src/hook/useApi";
import { useEffect, useState, useRef } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";

type TProps = {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  handleVerify?: () => void;
  mode: "login" | "register";
};

export function ModalVerifyCode({
  isOpen,
  onClose,
  username,
  handleVerify,
  mode
}: TProps) {
  const handleClose = () => {
    onClose();
  };

  const { refreshToken, verifyCode } = useApi();

  const [pinCode, setPinCode] = useState(["", "", "", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 minutes in seconds
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer countdown effect
  useEffect(() => {
    if (isOpen && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [isOpen, timeLeft]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) return;

    if (value && !/^\d$/.test(value)) return;

    const newPinCode = [...pinCode];
    newPinCode[index] = value;
    setPinCode(newPinCode);
    setSubmitError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      if (!pinCode[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const newPinCode = [...pinCode];
        newPinCode[index - 1] = "";
        setPinCode(newPinCode);
      } else if (pinCode[index]) {
        const newPinCode = [...pinCode];
        newPinCode[index] = "";
        setPinCode(newPinCode);
      }
    } else if (e.key === "Delete") {
      setPinCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  const handlePinPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pasteData)) return;

    const newPinCode = [...pinCode];
    for (let i = 0; i < Math.min(pasteData.length, 6); i++) {
      newPinCode[i] = pasteData[i];
    }
    setPinCode(newPinCode);

    const nextIndex = Math.min(pasteData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleRefreshToken = async () => {
    try {
      setIsRefreshing(true);
      setSubmitError("");

      const result = await refreshToken({ username });

      if (result) {
        setTimeLeft(10 * 60); // Reset to 10 minutes
        setPinCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        console.log("Token refreshed successfully");
      } else {
        setSubmitError("Failed to refresh verification code");
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      setSubmitError("Error refreshing code. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const onSubmit = async () => {
    const token = pinCode.join("");
    if (token.length !== 6) {
      setSubmitError("Please enter complete 6-digit verification code");
      return;
    }

    if (timeLeft <= 0) {
      setSubmitError(
        "Verification code has expired. Please refresh to get a new code."
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError("");

      const result = await verifyCode({
        username,
        code: token,
        mode
      });

      if (result) {
        if (handleVerify) {
          handleVerify();
        }
        handleClose();
      } else {
        setSubmitError("Invalid verification code or reset failed");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      setSubmitError("Error resetting password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPinComplete = pinCode.every(digit => digit !== "");
  const isFormValid = isPinComplete;

  const isLoading = isSubmitting || isRefreshing;

  useEffect(() => {
    if (!isOpen) {
      setPinCode(["", "", "", "", "", ""]);
      setSubmitError("");
      setIsSubmitting(false);
      setIsRefreshing(false);
      setTimeLeft(10 * 60);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [isOpen]);

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const ContentModal = (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium text-black">
            Verification Code
            <span className="text-red-500"> *</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Time left:</span>
            <span
              className={`text-sm font-mono font-bold ${
                timeLeft <= 60
                  ? "text-red-500"
                  : timeLeft <= 300
                  ? "text-orange-500"
                  : "text-green-500"
              }`}
            >
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        <div className="flex gap-2 justify-center">
          {pinCode.map((digit, index) => (
            <input
              key={index}
              ref={el => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handlePinChange(index, e.target.value)}
              onKeyDown={e => handlePinKeyDown(index, e)}
              onPaste={index === 0 ? handlePinPaste : undefined}
              className="w-12 h-12 text-center border-2 rounded-lg text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              placeholder="•"
              disabled={isLoading || timeLeft <= 0}
            />
          ))}
        </div>

        <div className="text-xs text-gray-500 text-center">
          {timeLeft > 0 ? (
            <>Enter the 6-digit code sent to your email</>
          ) : (
            <span className="text-red-500">
              Verification code has expired. Please refresh to get a new code.
            </span>
          )}
        </div>
      </div>

      {submitError && (
        <p className="text-red-500 text-sm text-center">{submitError}</p>
      )}
    </div>
  );

  const FooterModal = (
    <div className="flex gap-3 justify-end">
      <Button
        variant="destructive"
        onClick={handleRefreshToken}
        disabled={isLoading}
        className="min-w-[120px]"
      >
        {isRefreshing ? (
          <>
            <Loader2 className="animate-spin mr-2" size={16} />
            Refreshing...
          </>
        ) : (
          "Refresh Code"
        )}
      </Button>

      <Button
        onClick={onSubmit}
        disabled={!isFormValid || isLoading || timeLeft <= 0}
        className="min-w-[120px]"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="animate-spin mr-2" size={16} />
            Verifying...
          </>
        ) : (
          "Verify Code"
        )}
      </Button>
    </div>
  );

  return ModalCommon({
    isOpen,
    handleClose,
    title: "Verify Code",
    description:
      "Please enter the PIN sent to your email to verify your account.",
    content: ContentModal,
    footer: FooterModal,
    positionTop: "100px"
  });
}
