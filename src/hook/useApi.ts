import { useRouter } from "@/src/i18n/navigation";
import { useState } from "react";
import { useDispatch } from "react-redux";
import useWrapAsync from "./WrapAsync";
import { jwtDecode } from "jwt-decode";
import {
  TChangePassword,
  TJWTProfile,
  TLogin,
  TLoginGoogle,
  TLoginGuess,
  TProfile,
  TRegister,
  TResetPasssword,
  TSendCode,
  TVerify
} from "../types/player";
import {
  callChangePassword,
  callLogin,
  callLoginGoogle,
  callLoginGuess,
  callLostPassword,
  callRefreshVerificationCode,
  callRegister,
  callResetPassword,
  callVerificationCode
} from "../service/user";
import { setAuth } from "../redux/global/slice";
import { AxiosError } from "axios";

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
        setLoading(false);
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
      if (statusCode == 200) {
        const userToken = token;
        const decoded: TJWTProfile = jwtDecode(userToken);
        if (decoded) {
          localStorage.setItem("user_token", userToken);
          localStorage.setItem("user_data", JSON.stringify(decoded));
          dispatch(setAuth(decoded));
          router.push("/");
        }
        setLoading(false);
        return { success: true, code: "Ok" };
      }
      return { success: false, code: code };
    } catch (error: unknown) {
      let code: number | string = "Unknown";
      if (error instanceof AxiosError) {
        // message = error.response?.data?.message || error.message;
        code = error.response?.data?.status || "Unknown";
      }
      console.error(error);
      setLoading(false);
      return { success: false, code };
    }
  };

  const loginGuess = async (data: TLoginGuess) => {
    setLoading(true);
    try {
      const res = await wrapAsync(
        () => callLoginGuess(data),
        "loginGuess",
        false
      );

      const { statusCode, data: token, code } = res?.data;
      if (statusCode == 200) {
        const userToken = token;
        const decoded: TJWTProfile = jwtDecode(userToken);

        if (decoded) {
          localStorage.setItem("user_token", userToken);
          localStorage.setItem("user_data", JSON.stringify(decoded));
          dispatch(setAuth(decoded));
        }
        setLoading(false);
        return { success: true, code: "Ok", data: userToken };
      }
      return { success: false, code: code, data: null };
    } catch (error: unknown) {
      let code: number | string = "Unknown";
      if (error instanceof AxiosError) {
        // message = error.response?.data?.message || error.message;
        code = error.response?.data?.status || "Unknown";
      }
      console.error(error);
      setLoading(false);
      return { success: false, code, data: null };
    }
  };

  const loginGoogle = async (data: TLoginGoogle) => {
    setLoading(true);
    try {
      const res = await wrapAsync(() => callLoginGoogle(data), "login", false);
      const { statusCode, data: token } = res?.data;
      if (statusCode == 201 || statusCode == 200) {
        const userToken = token;
        const decoded: TJWTProfile = jwtDecode(userToken);

        if (decoded) {
          localStorage.setItem("user_token", userToken);
          localStorage.setItem("user_data", JSON.stringify(decoded));
          dispatch(setAuth(decoded));
          router.push("/");
        }
        setLoading(false);
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
        setLoading(false);
        return true;
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
      return false;
    }
  };

   const changePassword = async (data: TChangePassword) => {
    setLoading(true);
    try {
      const res = await wrapAsync(
        () => callChangePassword(data),
        "changePassword",
      );
      const { statusCode } = res?.data;
      if (statusCode == 200) {
        setLoading(false);
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
        setLoading(false);
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
        setLoading(false);
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
      const { statusCode, data: token } = res?.data;
      if (statusCode == 200 && statusCode == 201) {
        if (data.mode === "login") {
          const userToken = token;
          const decoded: TJWTProfile = jwtDecode(userToken);

          const profile: TProfile = {
            id: decoded.Id,
            name: decoded.Name,
            username: decoded.Email,
            isVerified: true,
            isActive: true
          };
          if (decoded) {
            localStorage.setItem("user_token", userToken);
            localStorage.setItem("user_data", JSON.stringify(decoded));
            dispatch(setAuth(profile));
            router.push("/");
          }
        } else {
          router.push("/login");
        }
        setLoading(false);
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
    loginGuess,
    loginGoogle,
    checkMail,
    resetPassword,
    refreshToken,
    verifyCode,
    changePassword
  };
};

export default useApi;
