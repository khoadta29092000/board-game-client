import { TProfile } from "@/src/types/player";
import { createSlice } from "@reduxjs/toolkit";

export type GlobalState = {
  isOpen: boolean;
  auth: TProfile;
};

const initialState = {
  isOpen: false,
  auth: {
    _id: "",
    name: "",
    username: "",
    isVerified: true,
    isActive: true
  }
};

export const userSlice = createSlice({
  name: "global",
  initialState: initialState,
  reducers: {
    setOpen: (state, action) => {
      state.isOpen = action.payload;
    },
    setAuth: (state, action) => {
      state.auth = action.payload;
    }
  }
});

export const { setOpen, setAuth } = userSlice.actions;
