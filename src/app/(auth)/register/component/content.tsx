"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Image from "next/image";
import Link from "next/link";
import useApi from "@/src/hook/useApi";
import { TRegister } from "@/src/types/player";
import { useDisclosure } from "@/src/hook/common/useDisclosure";
import { ModalVerifyCode } from "./verifyCode/modalVerifyCode";
import { useRouter } from "next/navigation";

const schema = yup.object().shape({
  fullName: yup.string().required("Full Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Please confirm your password")
});

export default function ContentRegister() {
  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  });
  const router = useRouter();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { register: registerApi } = useApi();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    const newData: TRegister = {
      name: data?.fullName,
      password: data?.password,
      username: data?.email,
      confirmPassword: data?.confirmPassword
    };
    const res = await registerApi(newData);
    if (res) {
      onOpen();
    }
  };

  return (
    <div className="text-black sm:min-h-[calc(100vh-17.5px)]  txt-14 sm:grid grid-cols-1 md:grid-cols-2 ">
      {/* Modal Verify Code */}
      <ModalVerifyCode
        isOpen={isOpen}
        onClose={onClose}
        username={getValues("email")}
        handleVerify={() => {
          reset();
          router.push("/login");
        }}
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
      <div className="flex mt-12 sm:mt-0 sm:items-center justify-center p-2 sm:p-6">
        <div className="bg-white w-full max-w-md rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.2)] p-4 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <h2 className="txt-46 font-bold text-primary-500 text-center">
              Register
            </h2>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-inter text-gray-700 mb-1">
                Full Name <span className="text-primary-400">*</span>
              </label>
              <input
                type="text"
                {...register("fullName")}
                className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring focus:ring-primary-200"
              />
              {errors.fullName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-inter text-gray-700 mb-1">
                Email Address <span className="text-primary-400">*</span>
              </label>
              <input
                type="email"
                {...register("email")}
                className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring focus:ring-primary-200"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-inter text-gray-700 mb-1">
                Password <span className="text-primary-400">*</span>
              </label>
              <input
                type="password"
                {...register("password")}
                className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring focus:ring-primary-200"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-inter text-gray-700 mb-1">
                Confirm Password <span className="text-primary-400">*</span>
              </label>
              <input
                type="password"
                {...register("confirmPassword")}
                className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring focus:ring-primary-200"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="mt-2 w-full bg-primary-200 text-white py-2 rounded transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-2xl hover:opacity-80"
            >
              Register
            </button>

            <p className="text-center text-sm text-gray-600 mt-4">
              Already have an account?{" "}
              <Link href="/login" className="text-primary-400 underline">
                Login here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
