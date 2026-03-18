export type TLogin = {
  email: string;
  password: string;
};

export type TLoginGuess = {
  name: string;
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
  id: string;
  name: string;
  username: string;
  isVerified: boolean;
  isActive: boolean;
};

export type TJWTProfile = {
  Email: string;
  Id: string;
  Name: string;
  TokenId: string;
  nbf: number;
  exp: number;
  iat: number;
};

export type TDataToken = {
  Email: string;
  Id: string;
  Name: string;
  TokenId: string;
  nbf: number;
  exp: number;
  iat: number;
};
