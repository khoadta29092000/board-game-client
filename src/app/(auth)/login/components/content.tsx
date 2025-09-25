"use client";

import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Link from "next/link";
import { TLogin } from "@/src/types/player";
import useApi from "@/src/hook/useApi";
import { GoogleLogin } from "@react-oauth/google";
import { FaGoogle } from "react-icons/fa";
import { MdDone } from "react-icons/md";
import Image from "next/image";
import { useDisclosure } from "@/src/hook/common/useDisclosure";
import { ModalForgetPassword } from "./reset-password/modalForgetPassword";
import { ModalVerifyCode } from "../../register/component/verifyCode/modalVerifyCode";
import { Loader2 } from "lucide-react";

const schema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required")
});

export default function ContentLogin() {
  const {
    isOpen: isOpenLostPassword,
    onClose: onCloseLostPassword,
    onOpen: onOpenLostPassword
  } = useDisclosure();
  const {
    isOpen: isOpenVerify,
    onClose: onCloseVerify,
    onOpen: onOpenVerify
  } = useDisclosure();

  const googleLoginRef = useRef<HTMLDivElement>(null);
  const handleCustomClick = () => {
    const googleBtn =
      googleLoginRef.current?.querySelector<HTMLDivElement>(
        'div[role="button"]'
      );
    console.log("googleBtn", googleBtn);
    if (googleBtn) {
      googleBtn.click();
    } else {
      console.warn("not find google button!");
    }
  };

  const [isChecked, setIsChecked] = useState(false);
  const toggleCheckbox = () => {
    setIsChecked(!isChecked);
  };
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  });
  const { login, loginGoogle, refreshToken, loading } = useApi();
  const onSubmit = async (data: TLogin) => {
    const res: { success: boolean; code: string } = await login(data);
    console.log("res", res);
    if (res.code.toString() == "402") {
      await refreshToken({
        username: getValues("email")
      });
      onOpenVerify();
      return;
    }
    if (res.code.toString() == "403") {
      return;
    }
  };

  return (
    <div className="text-black sm:min-h-[calc(100vh-17.5px)]  txt-14 sm:grid grid-cols-1 md:grid-cols-2 ">
      {/* Modal */}
      <ModalForgetPassword
        isOpen={isOpenLostPassword}
        onClose={onCloseLostPassword}
      />

      <ModalVerifyCode
        isOpen={isOpenVerify}
        onClose={onCloseVerify}
        username={getValues("email")}
        mode="login"
      />

      {/* Left - Image */}
      <div className="max-h-[200px] sm:max-h-[100%] flex items-center justify-center bg-white w-full rounded-xl p-2 sm:p-4 md:p-8">
        <Image
          priority
          src="/images/logo.svg"
          alt="Logo"
          className="w-full h-auto  max-w-[300px] sm:max-w-[400px] md:max-w-[500px] object-contain"
          width={500}
          height={500}
        />
      </div>

      {/* Right - Form (Card) */}
      <div className="flex mt-4 sm:mt-0 sm:items-center justify-center p-2 sm:p-6">
        <div className="bg-white w-full max-w-md rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.2)] p-4 sm:p-8">
          <h2 className="txt-46 font-bold text-primary-500 text-center">
            Login
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block txt-14 font-inter mb-2 text-black">
                Email address
                <span className="text-primary-400"> *</span>
              </label>
              <input
                type="text"
                {...register("email")}
                className="text-black w-full border border-gray-300 rounded px-4 py-2"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block txt-14 font-inter mb-2 text-black">
                Password
                <span className="text-primary-400"> *</span>
              </label>
              <input
                type="password"
                {...register("password")}
                className="text-black w-full border border-gray-300 rounded px-4 py-2"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember me */}
            <div
              className="flex items-center cursor-pointer"
              onClick={toggleCheckbox}
            >
              <div
                className={`mr-2 h-4 w-4 flex items-center justify-center rounded border border-gray-400 transition-colors
          ${isChecked ? "bg-primary-200 border-primary-200" : "bg-white"}`}
              >
                {isChecked && <MdDone className="text-white text-sm" />}
              </div>
              <span className="txt-14 font-inter text-black">Remember me</span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="flex justify-center items-center mt-2 w-full bg-primary-200 text-white py-2 rounded transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-2xl hover:opacity-80"
            >
              {loading ? (
                <Loader2 className="animate-spin " size={20} />
              ) : (
                "Login"
              )}
            </button>

            <div className="flex items-center mt-2">
              <hr className="flex-1 border-gray-300" />
              <span className="px-4 text-black txt-14 uppercase font-inter">
                or
              </span>
              <hr className="flex-1 border-gray-300" />
            </div>

            <button
              type="button"
              onClick={handleCustomClick}
              className="mt-5 gap-4 flex items-center justify-center w-full bg-primary-400 text-white p-2 rounded transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-2xl hover:opacity-80"
            >
              <FaGoogle size={20} className="left-12 " />
              <span>Login with Google</span>
            </button>

            <div ref={googleLoginRef} className="hidden">
              <GoogleLogin
                onSuccess={response => {
                  loginGoogle({ token: response.credential ?? "" });
                }}
                onError={() => console.error("Login Failed")}
              />
            </div>

            {/* Extra links */}
            <div className="text-left mt-2 space-y-2">
              <p
                onClick={onOpenLostPassword}
                className="text-sm text-primary-400 cursor-pointer hover:underline"
              >
                Lost your password?
              </p>
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <span className="text-primary-400 cursor-pointer hover:underline">
                  <Link href={"/register"}>Register here</Link>
                </span>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
