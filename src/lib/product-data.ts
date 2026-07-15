export interface ProductItem {
  title: string;
  slug: string;
  description: string;
  categoryId: string;
}

export interface ProductCategory {
  id: string;
  title: string;
  description: string;
  heroTitle?: string;
  heroSubtitle?: string;
  items: ProductItem[];
}

export const productCategories: ProductCategory[] = [
  {
    id: "features",
    title: "Features",
    description: "Everything Vireo offers to streamline your development workflow",
    heroTitle: "Project management that works the way your team does",
    heroSubtitle:
      "From backlog grooming to sprint retrospectives — Vireo gives your team the structure of enterprise tools with the speed and AI intelligence of modern software.",
    items: [
      {
        title: "Issue & Bug Tracking",
        slug: "issue-tracking",
        description: "Custom issue types, rich text fields, dependencies, and linked repositories. Keep every detail in one place.",
        categoryId: "features",
      },
      {
        title: "Kanban Boards",
        slug: "kanban-boards",
        description: "Drag-and-drop workflow management with WIP limits, swimlanes, and automation rules for your team's unique process.",
        categoryId: "features",
      },
      {
        title: "Scrum Sprints",
        slug: "scrum-sprints",
        description: "Plan sprints with velocity tracking, capacity management, and AI-powered story point estimation.",
        categoryId: "features",
      },
      {
        title: "Roadmaps",
        slug: "roadmaps",
        description: "Align teams around a shared timeline. Track epics, milestones, and cross-team dependencies at a glance.",
        categoryId: "features",
      },
      {
        title: "Reports & Analytics",
        slug: "analytics",
        description: "DORA metrics, burndown charts, cycle time analysis, and custom dashboards for data-driven decisions.",
        categoryId: "features",
      },
      {
        title: "Team Collaboration",
        slug: "collaboration",
        description: "Threaded issue discussions, real-time mentions, and integrated team chat so context never gets lost.",
        categoryId: "features",
      },
      {
        title: "AI Assistant",
        slug: "ai-assistant",
        description: "Generate acceptance criteria, summarise threads, and estimate effort — all from natural language prompts.",
        categoryId: "features",
      },
      {
        title: "Real-Time Sync",
        slug: "real-time-sync",
        description: "Multi-user collaboration with instant updates. No page refreshes, no stale data, no friction.",
        categoryId: "features",
      },
    ],
  },
  {
    id: "developers",
    title: "Developers",
    description: "Built for engineering teams who care about velocity and code quality",
    heroTitle: "Ship better code, faster",
    heroSubtitle:
      "Vireo integrates deeply with your development workflow — from git commits to CI/CD pipelines — so you never have to leave your flow.",
    items: [
      {
        title: "Git Integration",
        slug: "git-integration",
        description: "GitHub / GitLab integration with branch linking. View commit history, create branches from issues, and automate workflows.",
        categoryId: "developers",
      },
      {
        title: "CI/CD Pipeline",
        slug: "ci-cd",
        description: "CI/CD pipeline status on every issue. See build and deploy status directly from your boards.",
        categoryId: "developers",
      },
      {
        title: "Code Review",
        slug: "code-review",
        description: "Code review checklists and quality gates. Ensure every PR meets your team's standards before merging.",
        categoryId: "developers",
      },
      {
        title: "API & Extensibility",
        slug: "api",
        description: "REST and GraphQL APIs, webhooks, and custom automations. Extend Vireo to fit your exact workflow.",
        categoryId: "developers",
      },
    ],
  },
  {
    id: "product-manager",
    title: "Product Manager",
    description: "Align your team around outcomes, not output",
    heroTitle: "From vision to delivery",
    heroSubtitle:
      "Vireo helps product managers connect strategy to execution with roadmaps, prioritisation frameworks, and cross-team visibility.",
    items: [
      {
        title: "Roadmap Planning",
        slug: "roadmap-planning",
        description: "Cross-team roadmap views with epics, milestones, and dependency tracking. Communicate strategy clearly.",
        categoryId: "product-manager",
      },
      {
        title: "Backlog Prioritization",
        slug: "backlog-prioritization",
        description: "AI-powered backlog prioritisation using weighted scoring across business value, effort, and dependencies.",
        categoryId: "product-manager",
      },
      {
        title: "Sprint Management",
        slug: "sprint-management",
        description: "Plan sprints with velocity tracking, capacity management, and automated sprint retrospection.",
        categoryId: "product-manager",
      },
      {
        title: "Stakeholder Reports",
        slug: "stakeholder-reports",
        description: "Stakeholder-friendly report exports with burndown charts, cycle time analysis, and delivery insights.",
        categoryId: "product-manager",
      },
    ],
  },
  {
    id: "it-professionals",
    title: "IT Professionals",
    description: "Enterprise-grade security and control for your organisation",
    heroTitle: "Enterprise security meets modern agility",
    heroSubtitle:
      "Vireo provides the security, compliance, and administrative controls that IT teams need, with the modern experience users love.",
    items: [
      {
        title: "Security & Compliance",
        slug: "security",
        description: "SOC 2 compliant with end-to-end encryption. Enterprise-grade security for your most sensitive data.",
        categoryId: "it-professionals",
      },
      {
        title: "SSO & Identity",
        slug: "sso",
        description: "Single sign-on with Okta, Azure AD, and Google Workspace. SCIM provisioning for automated user management.",
        categoryId: "it-professionals",
      },
      {
        title: "Audit Trail",
        slug: "audit",
        description: "Security and compliance audit trails. Track every change with immutable logs and user activity monitoring.",
        categoryId: "it-professionals",
      },
      {
        title: "Self-Hosted Deployment",
        slug: "deployment",
        description: "On-premise deployment option with dedicated infrastructure, SLA guarantees, and dedicated support.",
        categoryId: "it-professionals",
      },
    ],
  },
  {
    id: "business-teams",
    title: "Business Teams",
    description: "Connect project execution to business outcomes",
    heroTitle: "Bridge the gap between strategy and execution",
    heroSubtitle:
      "Vireo gives business leaders visibility into delivery progress, resource allocation, and portfolio health — all in one place.",
    items: [
      {
        title: "Portfolio Management",
        slug: "portfolio-management",
        description: "Portfolio-level program boards with cross-project visibility. Track progress across teams and initiatives.",
        categoryId: "business-teams",
      },
      {
        title: "Resource Planning",
        slug: "resource-planning",
        description: "Resource allocation and capacity planning. See who is working on what and where bottlenecks form.",
        categoryId: "business-teams",
      },
      {
        title: "Cross-Team Collaboration",
        slug: "cross-team-collab",
        description: "Cross-team dependency management and shared workspaces. Break down silos across your organisation.",
        categoryId: "business-teams",
      },
    ],
  },
  {
    id: "it-teams",
    title: "IT Teams",
    description: "Streamline IT service management and support operations",
    heroTitle: "IT service management reimagined",
    heroSubtitle:
      "Vireo helps IT teams manage requests, incidents, and assets with the same powerful workflow engine that drives your development teams.",
    items: [
      {
        title: "Service Desk",
        slug: "service-desk",
        description: "Ticketing system with SLAs, auto-assignment, and knowledge base integration. Resolve requests faster.",
        categoryId: "it-teams",
      },
      {
        title: "Incident Management",
        slug: "incident-management",
        description: "Incident tracking with severity levels, escalation policies, and post-mortem automation.",
        categoryId: "it-teams",
      },
      {
        title: "Asset Tracking",
        slug: "asset-tracking",
        description: "Track hardware and software assets across their lifecycle. Integrate with your existing CMDB and procurement tools.",
        categoryId: "it-teams",
      },
    ],
  },
];

export function getCategoryById(id: string): ProductCategory | undefined {
  return productCategories.find((c) => c.id === id);
}

export function getItemBySlug(slug: string): ProductItem | undefined {
  return productCategories.flatMap((c) => c.items).find((i) => i.slug === slug);
}

export function getCategoryForSlug(slug: string): ProductCategory | undefined {
  const item = getItemBySlug(slug);
  if (!item) return undefined;
  return getCategoryById(item.categoryId);
}
