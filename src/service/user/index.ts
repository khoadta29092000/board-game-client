import {
  TLogin,
  TLoginGoogle,
  TRegister,
  TResetPasssword,
  TSendCode,
  TVerify
} from "@/src/types/player";
import api from "../api";

export const callLogin = async (body: TLogin) => {
  try {
    const newData = {
      username: body.email,
      password: body.password
    };
    const response = await api.post(`/Players/Login`, newData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const callLoginGoogle = async (body: TLoginGoogle) => {
  try {
    const token = body.token;
    const response = await api.post(`/Players/Login_Google?token=${token}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const callRegister = async (body: TRegister) => {
  try {
    const response = await api.post(`/Players/Register`, body);
    return response;
  } catch (error) {
    throw error;
  }
};

export const callRefreshVerificationCode = async (data: TSendCode) => {
  try {
    const response = await api.post(`/Players/Refresh_Verification_Code`, data);
    return response;
  } catch (error) {
    throw error;
  }
};

export const callVerificationCode = async (data: TVerify) => {
  try {
    const response = await api.post(`/Players/Verification_Player`, data);
    return response;
  } catch (error) {
    throw error;
  }
};

export const callResetPassword = async (data: TResetPasssword) => {
  try {
    const response = await api.post(`/Players/Reset_Password`, data);
    return response;
  } catch (error) {
    throw error;
  }
};

export const callLostPassword = async (email: string) => {
  try {
    const response = await api.post(`/Players/Lost_Password`, {
      username: email
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const callLogout = async () => {
  try {
    const response = await api.post(`/auth/sign-out`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const callProfile = async () => {
  try {
    const response = await api.get(`/Players/Get_Profile`);
    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
