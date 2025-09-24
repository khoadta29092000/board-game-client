import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch } from "react-redux";
import useWrapAsync from "./WrapAsync";
import { jwtDecode } from "jwt-decode";
import {
  TLogin,
  TLoginGoogle,
  TRegister,
  TResetPasssword,
  TSendCode,
  TVerify
} from "../types/player";
import {
  callLogin,
  callLoginGoogle,
  callLostPassword,
  callRefreshVerificationCode,
  callRegister,
  callResetPassword,
  callVerificationCode
} from "../service/user";
import { setAuth } from "../redux/global/slice";

const useApi = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { wrapAsync } = useWrapAsync();
  const register = async (data: TRegister) => {
    setLoading(true);
    try {
      const res = await wrapAsync(() => callRegister(data), "register");

      const { message } = res.data;
      if (message) {
        return true;
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
      return false;
    }
  };

  const login = async (data: TLogin) => {
    setLoading(true);
    try {
      const res = await wrapAsync(() => callLogin(data), "login", false);

      const { statusCode, data: token, code } = res?.data;
      console.log("res?.data", res?.data);
      if (statusCode == 200) {
        const userToken = token;

        localStorage.setItem("user_token", userToken);
        const decoded = jwtDecode(userToken);
        if (decoded) {
          dispatch(setAuth(decoded));
          router.push("/");
        }
        return { success: true, code: "Ok" };
      }
      return { success: false, code: code };
    } catch (error) {
      console.error(error);
      setLoading(false);
      return { success: false, code: "Error" };
    }
  };

  const loginGoogle = async (data: TLoginGoogle) => {
    setLoading(true);
    try {
      const res = await wrapAsync(() => callLoginGoogle(data), "login", false);
      const { statusCode, data: token } = res?.data;
      if (statusCode == 200) {
        const userToken = token;

        localStorage.setItem("user_token", userToken);
        const decoded = jwtDecode(userToken);
        if (decoded) {
          dispatch(setAuth(decoded));
          router.push("/");
        }
        return true;
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
      return false;
    }
  };

  const checkMail = async (email: string) => {
    setLoading(true);
    try {
      const res = await wrapAsync(
        () => callLostPassword(email),
        "sendCode",
        false
      );
      const { statusCode } = res?.data;
      if (statusCode == 200) {
        return true;
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
      return false;
    }
  };

  const resetPassword = async (data: TResetPasssword) => {
    setLoading(true);
    try {
      const res = await wrapAsync(
        () => callResetPassword(data),
        "resetPassword"
      );
      const { statusCode } = res?.data;
      if (statusCode == 200) {
        return true;
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
      return false;
    }
  };

  const refreshToken = async (data: TSendCode) => {
    setLoading(true);
    try {
      const res = await wrapAsync(
        () => callRefreshVerificationCode(data),
        "sendCode",
        false
      );
      const { statusCode } = res?.data;
      if (statusCode == 200) {
        return true;
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
      return false;
    }
  };

  const verifyCode = async (data: TVerify) => {
    setLoading(true);
    try {
      const res = await wrapAsync(
        () => callVerificationCode(data),
        "verifyCode",
        false
      );
      const { statusCode } = res?.data;
      if (statusCode == 200) {
        return true;
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
      return false;
    }
  };

  return {
    loading,
    register,
    login,
    loginGoogle,
    checkMail,
    resetPassword,
    refreshToken,
    verifyCode
  };
};

export default useApi;
