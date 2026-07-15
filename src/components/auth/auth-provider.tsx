"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { setCredentials, setLoading, logout } from "@/store/authSlice";
import { authApi } from "@/store/authApi";
import { getAccessToken, clearTokens } from "@/lib/auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isLoading } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      dispatch(setLoading(false));
      return;
    }

    dispatch(setLoading(true));

    dispatch(authApi.endpoints.getProfile.initiate(undefined))
      .unwrap()
      .then((data: any) => {
        const accessToken = getAccessToken();
        dispatch(
          setCredentials({
            user: data.user,
            accessToken: accessToken || "",
            refreshToken: "",
          })
        );
      })
      .catch(() => {
        clearTokens();
        dispatch(logout());
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#004AC6] border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
