import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "user" | "admin";
  createdAt: string;
}

interface OnboardingData {
  role?: string;
  companySize?: string;
  useCase?: string;
  template?: string;
  workspaceName?: string;
  step?: string;
  completed: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  onboarding: OnboardingData;
  onboardingNeeded: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  onboarding: {
    completed: false,
    step: "role",
  },
  onboardingNeeded: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{
        user: User;
        accessToken: string;
        refreshToken: string;
      }>
    ) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.error = null;
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    setAccessToken(state, action: PayloadAction<string>) {
      state.accessToken = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setOnboarding(state, action: PayloadAction<Partial<OnboardingData>>) {
      state.onboarding = { ...state.onboarding, ...action.payload };
    },
    setOnboardingNeeded(state, action: PayloadAction<boolean>) {
      state.onboardingNeeded = action.payload;
    },
    completeOnboarding(state) {
      state.onboarding.completed = true;
      state.onboardingNeeded = false;
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      state.onboarding = { completed: false, step: "role" };
      state.onboardingNeeded = false;
    },
  },
});

export const {
  setCredentials,
  setUser,
  setAccessToken,
  setLoading,
  setError,
  setOnboarding,
  setOnboardingNeeded,
  completeOnboarding,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
