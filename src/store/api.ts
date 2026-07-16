import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "@/lib/auth";
import type { RootState } from "./index";

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token =
      (getState() as RootState).auth.accessToken || getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: typeof baseQuery = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      const refreshResult = await baseQuery(
        {
          url: "/auth/refresh",
          method: "POST",
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        const { accessToken, refreshToken: newRefreshToken } =
          refreshResult.data as { accessToken: string; refreshToken: string };
        setTokens(accessToken, newRefreshToken);
        result = await baseQuery(args, api, extraOptions);
      } else {
        clearTokens();
        api.dispatch({ type: "auth/logout" });
      }
    } else {
      clearTokens();
      api.dispatch({ type: "auth/logout" });
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User", "Workspace", "Members", "Invitations", "Project", "Board"],
  endpoints: () => ({}),
});
