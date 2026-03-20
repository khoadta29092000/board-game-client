// src/components/common/AuthInit.tsx
"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setAuth } from "@/src/redux/global/slice";
import { useProfile } from "@/src/hook/user/useGetProfile";

export function AuthInit() {
  const dispatch = useDispatch();

  // sync localStorage → Redux ngay khi mount
  useEffect(() => {
    const data = localStorage.getItem("user_data");
    if (data) {
      dispatch(setAuth(JSON.parse(data)));
    }
  }, [dispatch]);

  // verify token với server
  useProfile();

  return null;
}
