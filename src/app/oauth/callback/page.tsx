"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/store/authSlice";
import { useLazyGetProfileQuery } from "@/store/authApi";
import { setTokens } from "@/lib/auth";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const [getProfile] = useLazyGetProfileQuery();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");

    if (!accessToken || !refreshToken) {
      router.replace("/login");
      return;
    }

    setTokens(accessToken, refreshToken);

    getProfile()
      .unwrap()
      .then((data) => {
        dispatch(
          setCredentials({
            user: data.user,
            accessToken,
            refreshToken,
          })
        );
        router.replace("/dashboard");
      })
      .catch(() => {
        router.replace("/login");
      });
  }, [searchParams, router, dispatch, getProfile]);

  return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#2563EB] border-t-transparent" />
    </div>
  );
}
