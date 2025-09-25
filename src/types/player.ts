export type TLogin = {
  email: string;
  password: string;
};

export type TLoginGoogle = {
  token: string;
};

export type TRegister = {
  name: string;
  username: string;
  password: string;
  confirmPassword: string;
};

export type TResetPasssword = {
  code: string;
  username: string;
  newPassword: string;
};

export type TVerify = {
  code: string;
  username: string;
  mode: "login" | "register";
};

export type TSendCode = {
  username: string;
};

export type TProfile = {
  _id: string;
  name: string;
  username: string;
  isVerified: boolean;
  isActive: boolean;
};
