import { api } from "./api";

export type PlanId = "free" | "pro" | "enterprise";
export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled";

interface Plan {
  id: PlanId;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: "month" | "year";
  features: string[];
}

interface Subscription {
  workspaceId: string;
  plan: PlanId;
  status: SubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  trialEndsAt?: string;
  trialStartedAt?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  automationRunsUsedThisPeriod?: number;
  aiCallsUsedThisPeriod?: number;
  storageUsedMB?: number;
}

interface UsageStats {
  memberCount: number;
  storageUsed: number;
  memberLimit: number | null;
  storageLimit: number | null;
  automationRunsUsed: number;
  automationRunLimit: number | null;
  aiCallsUsed: number;
  aiCallLimit: number | null;
  plan: PlanId;
}

interface PlansResponse {
  status: string;
  data: { plans: Plan[] };
}

interface SubscriptionResponse {
  status: string;
  data: { subscription: Subscription };
}

interface UsageStatsResponse {
  status: string;
  data: UsageStats;
}

interface CheckoutSessionResponse {
  status: string;
  data: { url: string; sessionId: string };
}

interface PortalSessionResponse {
  status: string;
  data: { url: string };
}

interface LimitsResponse {
  status: string;
  data: { allowed: boolean; type: string };
}

export const billingApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPlans: builder.query<Plan[], void>({
      query: () => "/billing/plans",
      transformResponse: (response: PlansResponse) => response.data.plans,
    }),
    getSubscription: builder.query<Subscription, string>({
      query: (workspaceId) => `/billing/${workspaceId}/subscription`,
      transformResponse: (response: SubscriptionResponse) =>
        response.data.subscription,
      providesTags: (_result, _error, workspaceId) => [
        { type: "Subscription", id: workspaceId },
      ],
    }),
    getUsageStats: builder.query<UsageStats, string>({
      query: (workspaceId) => `/billing/${workspaceId}/usage-stats`,
      transformResponse: (response: UsageStatsResponse) => response.data,
      providesTags: (_result, _error, workspaceId) => [
        { type: "Subscription", id: workspaceId },
      ],
    }),
    createCheckoutSession: builder.mutation<
      CheckoutSessionResponse["data"],
      {
        workspaceId: string;
        planId: "pro" | "enterprise";
        successUrl: string;
        cancelUrl: string;
      }
    >({
      query: ({ workspaceId, ...body }) => ({
        url: `/billing/${workspaceId}/create-checkout-session`,
        method: "POST",
        body,
      }),
      transformResponse: (response: CheckoutSessionResponse) => response.data,
    }),
    cancelSubscription: builder.mutation<Subscription, string>({
      query: (workspaceId) => ({
        url: `/billing/${workspaceId}/cancel`,
        method: "POST",
      }),
      transformResponse: (response: SubscriptionResponse) =>
        response.data.subscription,
      invalidatesTags: (_result, _error, workspaceId) => [
        { type: "Subscription", id: workspaceId },
      ],
    }),
    resumeSubscription: builder.mutation<Subscription, string>({
      query: (workspaceId) => ({
        url: `/billing/${workspaceId}/resume`,
        method: "POST",
      }),
      transformResponse: (response: SubscriptionResponse) =>
        response.data.subscription,
      invalidatesTags: (_result, _error, workspaceId) => [
        { type: "Subscription", id: workspaceId },
      ],
    }),
    startTrial: builder.mutation<Subscription, string>({
      query: (workspaceId) => ({
        url: `/billing/${workspaceId}/start-trial`,
        method: "POST",
      }),
      transformResponse: (response: SubscriptionResponse) =>
        response.data.subscription,
      invalidatesTags: (_result, _error, workspaceId) => [
        { type: "Subscription", id: workspaceId },
      ],
    }),
    getPortalSession: builder.mutation<
      PortalSessionResponse["data"],
      { workspaceId: string; returnUrl?: string }
    >({
      query: ({ workspaceId, returnUrl }) => ({
        url: `/billing/${workspaceId}/portal-session`,
        method: "POST",
        body: { returnUrl },
      }),
      transformResponse: (response: PortalSessionResponse) => response.data,
    }),
    checkLimits: builder.query<
      LimitsResponse["data"],
      { workspaceId: string; type: "member" | "project" }
    >({
      query: ({ workspaceId, type }) =>
        `/billing/${workspaceId}/check-limits?type=${type}`,
      transformResponse: (response: LimitsResponse) => response.data,
    }),
  }),
});

export const {
  useGetPlansQuery,
  useGetSubscriptionQuery,
  useGetUsageStatsQuery,
  useCreateCheckoutSessionMutation,
  useCancelSubscriptionMutation,
  useResumeSubscriptionMutation,
  useStartTrialMutation,
  useGetPortalSessionMutation,
  useCheckLimitsQuery,
  useLazyCheckLimitsQuery,
} = billingApi;
