import { api } from "./api";

export interface AuthData {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: "user" | "admin";
    isEmailVerified: boolean;
    createdAt: string;
  };
  accessToken: string;
  refreshToken: string;
}

interface AuthResponse {
  status: string;
  data: AuthData;
}

interface RegisterResponse {
  status: string;
  data: {
    message: string;
    email: string;
    otp?: string;
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
    user: AuthData["user"];
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

interface OnboardingInput {
  role: string;
  companySize: string;
  useCase: string;
  template?: string;
  workspaceName?: string;
}

interface OnboardingDraft {
  role?: string;
  companySize?: string;
  useCase?: string;
  template?: string;
  workspaceName?: string;
  step?: string;
  completedAt?: string;
}

interface OnboardingResponse {
  status: string;
  data: {
    message: string;
    redirect?: string;
  };
}

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<RegisterResponse["data"], RegisterInput>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
      transformResponse: (response: RegisterResponse) => response.data,
    }),
    verifyEmail: builder.mutation<AuthData, { email: string; code: string }>({
      query: (body) => ({
        url: "/auth/verify-email",
        method: "POST",
        body,
      }),
      transformResponse: (response: AuthResponse) => response.data,
    }),
    resendOtp: builder.mutation<{ message: string; otp?: string }, { email: string }>({
      query: (body) => ({
        url: "/auth/resend-otp",
        method: "POST",
        body,
      }),
      transformResponse: (response: {
        status: string;
        data: { message: string; otp?: string };
      }) => response.data,
    }),
    login: builder.mutation<AuthData, LoginInput>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      transformResponse: (response: AuthResponse) => response.data,
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
    submitOnboarding: builder.mutation<OnboardingResponse, OnboardingInput>({
      query: (body) => ({
        url: "/auth/onboarding",
        method: "POST",
        body,
      }),
    }),
    getOnboarding: builder.query<OnboardingDraft | null, void>({
      query: () => "/auth/onboarding",
      transformResponse: (response: { status: string; data: OnboardingDraft | null }) =>
        response.data,
      providesTags: ["Onboarding"],
    }),
    updateOnboarding: builder.mutation<OnboardingDraft, Partial<OnboardingDraft>>({
      query: (body) => ({
        url: "/auth/onboarding",
        method: "PUT",
        body,
      }),
      transformResponse: (response: { status: string; data: OnboardingDraft }) =>
        response.data,
      invalidatesTags: ["Onboarding"],
    }),
  }),
});

export const {
  useRegisterMutation,
  useVerifyEmailMutation,
  useResendOtpMutation,
  useLoginMutation,
  useRefreshMutation,
  useLogoutMutation,
  useGetProfileQuery,
  useLazyGetProfileQuery,
  useUpdateProfileMutation,
  useSubmitOnboardingMutation,
  useGetOnboardingQuery,
  useUpdateOnboardingMutation,
  useLazyGetOnboardingQuery,
} = authApi;
