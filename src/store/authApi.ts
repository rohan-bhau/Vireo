import { api } from "./api";

interface AuthResponse {
  status: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
      role: "user" | "admin";
      createdAt: string;
    };
    accessToken: string;
    refreshToken: string;
  };
}

interface RefreshResponse {
  status: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

interface ProfileResponse {
  status: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
      role: "user" | "admin";
      createdAt: string;
    };
  };
}

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<AuthResponse, RegisterInput>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
    }),
    login: builder.mutation<AuthResponse, LoginInput>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
    }),
    refresh: builder.mutation<RefreshResponse, { refreshToken: string }>({
      query: (body) => ({
        url: "/auth/refresh",
        method: "POST",
        body,
      }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),
    getProfile: builder.query<ProfileResponse["data"], void>({
      query: () => "/users/profile",
      transformResponse: (response: ProfileResponse) => response.data,
    }),
    updateProfile: builder.mutation<
      ProfileResponse,
      { name?: string; avatar?: string }
    >({
      query: (body) => ({
        url: "/users/profile",
        method: "PUT",
        body,
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useRefreshMutation,
  useLogoutMutation,
  useGetProfileQuery,
  useLazyGetProfileQuery,
  useUpdateProfileMutation,
} = authApi;
