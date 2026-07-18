import { api } from "./api";

interface Plan {
  id: "free" | "pro" | "enterprise";
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: "month" | "year";
  memberLimit: number;
  projectLimit: number;
  features: string[];
}

interface Subscription {
  workspaceId: string;
  plan: "free" | "pro" | "enterprise";
  status: "active" | "canceled" | "past_due" | "trialing" | "incomplete";
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  trialEndsAt?: string;
  trialStartedAt?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  memberLimit: number;
  projectLimit: number;
}

interface PlansResponse {
  status: string;
  data: { plans: Plan[] };
}

interface SubscriptionResponse {
  status: string;
  data: { subscription: Subscription };
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
  useCreateCheckoutSessionMutation,
  useCancelSubscriptionMutation,
  useResumeSubscriptionMutation,
  useStartTrialMutation,
  useGetPortalSessionMutation,
  useCheckLimitsQuery,
  useLazyCheckLimitsQuery,
} = billingApi;
