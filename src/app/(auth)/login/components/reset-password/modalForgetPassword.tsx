"use client";

import { ModalCommon } from "@/src/components/common/modal";
import { useDebounce } from "@/src/hook/common/useDebounce";
import useApi from "@/src/hook/useApi";
import { useEffect, useState, useRef } from "react";
import { MdDone, MdClose } from "react-icons/md";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/src/components/ui/button";

type TProps = {
  isOpen: boolean;
  onClose: () => void;
};

type TResetPassword = {
  password: string;
  confirmPassword: string;
};

const schema = yup.object().shape({
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm password is required")
});

export function ModalForgetPassword({ isOpen, onClose }: TProps) {
  const handleClose = () => {
    onClose();
  };
  const [email, setEmail] = useState("");
  const debouncedEmail = useDebounce(email, 1500);
  const { checkMail, resetPassword } = useApi();

  const [status, setStatus] = useState<
    "idle" | "loading" | "valid" | "invalid" | "error"
  >("idle");

  const [pinCode, setPinCode] = useState(["", "", "", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const isCheckingRef = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset: resetForm,
    watch
  } = useForm<TResetPassword>({
    resolver: yupResolver(schema)
  });

  const passwordValues = watch();

  useEffect(() => {
    if (email.trim() && email !== debouncedEmail) {
      setStatus("loading");
    }
  }, [email, debouncedEmail]);

  useEffect(() => {
    if (!debouncedEmail.trim()) {
      setStatus("idle");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(debouncedEmail)) {
      setStatus("invalid");
      return;
    }

    if (isCheckingRef.current) {
      return;
    }

    const checkEmailExists = async () => {
      try {
        isCheckingRef.current = true;
        setStatus("loading");

        const res = await checkMail(debouncedEmail);

        if (res) {
          setStatus("valid");
          setPinCode(["", "", "", "", "", ""]);
          setSubmitError("");
        } else {
          setStatus("invalid");
        }
      } catch (err) {
        console.error("Error checking email:", err);
        setStatus("error");
      } finally {
        isCheckingRef.current = false;
      }
    };

    checkEmailExists();
  }, [debouncedEmail]);

  const renderIcon = () => {
    switch (status) {
      case "loading":
        return <Loader2 className="animate-spin text-gray-400" size={20} />;
      case "valid":
        return <MdDone className="text-green-500" size={20} />;
      case "invalid":
      case "error":
        return <MdClose className="text-red-500" size={20} />;
      default:
        return null;
    }
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

  const onSubmit = async (data: TResetPassword) => {
    const token = pinCode.join("");
    if (token.length !== 6) {
      setSubmitError("Please enter complete 6-digit verification code");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError("");

      const result = await resetPassword({
        username: email,
        code: token,
        newPassword: data.password
      });

      if (result) {
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
  const isFormValid =
    status === "valid" &&
    isPinComplete &&
    passwordValues.password &&
    passwordValues.confirmPassword;
  const isLoading = isSubmitting || status === "loading";

  useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setStatus("idle");
      setPinCode(["", "", "", "", "", ""]);
      setSubmitError("");
      setIsSubmitting(false);
      resetForm();
      isCheckingRef.current = false;
    }
  }, [isOpen, resetForm]);

  const ContentModal = (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border rounded-lg px-4 py-3 text-sm pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={status === "valid"}
        />
        {status !== "idle" && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2">
            {renderIcon()}
          </span>
        )}
      </div>

      {status === "invalid" && (
        <p className="text-sm text-red-500">❌ User not found</p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-500">⚠️ Error checking email</p>
      )}

      {status === "valid" && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <p className="text-sm text-green-500">
            ✅ Email exists, please enter verification code and new password
          </p>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-black">
              Verification Code
              <span className="text-red-500"> *</span>
            </label>
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
                  className="w-12 h-12 text-center border-2 rounded-lg text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="•"
                  disabled={isSubmitting}
                />
              ))}
            </div>
            <div className="text-xs text-gray-500 text-center">
              Enter the 6-digit code sent to your email
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-black">
              New Password
              <span className="text-red-500"> *</span>
            </label>
            <input
              type="password"
              {...register("password")}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter new password"
              disabled={isSubmitting}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-black">
              Confirm Password
              <span className="text-red-500"> *</span>
            </label>
            <input
              type="password"
              {...register("confirmPassword")}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Confirm new password"
              disabled={isSubmitting}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {submitError && (
            <p className="text-red-500 text-sm text-center">{submitError}</p>
          )}
        </form>
      )}
    </div>
  );

  const FooterModal = (
    <div className="flex gap-3 justify-end">
      <Button variant="destructive" onClick={handleClose} disabled={isLoading}>
        Cancel
      </Button>
      {status === "valid" && (
        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={!isFormValid || isLoading}
          className="min-w-[120px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin mr-2" size={16} />
              Resetting...
            </>
          ) : (
            "Reset Password"
          )}
        </Button>
      )}
    </div>
  );
  return (
    <ModalCommon
      isOpen={isOpen}
      handleClose={handleClose}
      title="Reset Password"
      description={`Please fill in all required information to reset your password.`}
      content={ContentModal}
      footer={FooterModal}
      positionTop="100px"
    />
  );
}
