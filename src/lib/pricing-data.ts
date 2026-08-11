export type PlanId = "free" | "pro" | "enterprise";

export interface PricingPlan {
  id: PlanId;
  name: string;
  price: number;
  period: string;
  description: string;
  highlighted?: boolean;
  cta: string;
  href: string;
  features: string[];
}

// Workspace-based (per-seat) pricing — mirrors server PLANS config.
// Prices are in USD per user per month. Stripe checkout uses the member
// count as the subscription quantity.
export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "forever",
    description: "For small teams getting started",
    cta: "Get started",
    href: "/register",
    features: [
      "Up to 10 team members",
      "Unlimited projects",
      "100 automation runs / month",
      "20 AI calls / month",
      "2 GB storage",
      "14-day free trial",
    ],
  },
  {
    id: "pro",
    name: "Standard",
    price: 24,
    period: "per user / month",
    description: "For growing teams that need more power",
    highlighted: true,
    cta: "Start free trial",
    href: "/register",
    features: [
      "Unlimited team members (per-seat)",
      "Unlimited projects",
      "Roadmap / Timeline view",
      "Custom fields & custom workflows",
      "1,000 automation runs per member / month",
      "500 AI calls / month",
      "10 GB storage",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 49,
    period: "per user / month",
    description: "For organizations with advanced needs",
    cta: "Start free trial",
    href: "/register",
    features: [
      "Everything in Standard",
      "Unlimited AI calls & storage",
      "SSO & audit logs",
      "Advanced security & permissions",
      "Dedicated support",
      "Custom contracts & invoicing",
    ],
  },
];

export interface ComparisonRow {
  label: string;
  free: string;
  pro: string;
  enterprise: string;
}

export const PRICING_COMPARISON: ComparisonRow[] = [
  { label: "Team members", free: "Up to 10", pro: "Unlimited (per-seat)", enterprise: "Unlimited (per-seat)" },
  { label: "Projects", free: "Unlimited", pro: "Unlimited", enterprise: "Unlimited" },
  { label: "Automation runs", free: "100 / month", pro: "1,000 per member / month", enterprise: "Unlimited" },
  { label: "AI calls", free: "20 / month", pro: "500 / month", enterprise: "Unlimited" },
  { label: "Storage", free: "2 GB", pro: "10 GB", enterprise: "Unlimited" },
  { label: "Roadmap / Timeline", free: "—", pro: "Included", enterprise: "Included" },
  { label: "Custom fields", free: "—", pro: "Included", enterprise: "Included" },
  { label: "Custom workflows", free: "—", pro: "Included", enterprise: "Included" },
  { label: "SSO & audit logs", free: "—", pro: "—", enterprise: "Included" },
  { label: "Support", free: "Community", pro: "Priority", enterprise: "Dedicated" },
];

export interface FaqEntry {
  question: string;
  answer: string;
}

export const PRICING_FAQ: FaqEntry[] = [
  {
    question: "How does workspace-based pricing work?",
    answer:
      "Plans are billed per user (seat) per month, based on the number of active members in your workspace. When you upgrade, your first invoice is prorated from your member count at checkout. Add or remove members anytime and your next invoice adjusts automatically.",
  },
  {
    question: "What happens when my free trial ends?",
    answer:
      "Every new workspace starts with a 14-day free trial of the Free plan limits. When the trial ends you keep the same Free plan limits — no surprise charges. Upgrade to Standard or Enterprise anytime to unlock higher limits and paid features.",
  },
  {
    question: "Can I change plans later?",
    answer:
      "Yes. Upgrades apply immediately and downgrades apply at the end of your current billing period. You can manage your plan from the Billing & Plan page in workspace settings.",
  },
  {
    question: "What counts as a member (seat)?",
    answer:
      "A seat is any active member in your workspace. Pending invitations also reserve a seat so you always stay within the member cap on the Free plan.",
  },
  {
    question: "Is there a limit on projects?",
    answer:
      "No. Projects are unlimited on every plan. Your plan determines usage limits like members, automation runs, AI calls, and storage.",
  },
];
