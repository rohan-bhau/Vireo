export interface SolutionItem {
  title: string;
  slug: string;
  description: string;
  categoryId: string;
}

export interface SolutionCategory {
  id: string;
  title: string;
  description: string;
  heroTitle?: string;
  heroSubtitle?: string;
  items: SolutionItem[];
}

export const solutionCategories: SolutionCategory[] = [
  {
    id: "engineering-teams",
    title: "Engineering Teams",
    description: "Ship better software faster with tools built for modern development workflows",
    heroTitle: "Built for the way engineering teams work",
    heroSubtitle:
      "From agile planning to continuous delivery — Vireo gives engineering teams the structure of enterprise tools with the speed and AI intelligence of modern software.",
    items: [
      {
        title: "Agile Development",
        slug: "agile-development",
        description: "Scrum, Kanban, and hybrid workflows with AI-powered estimation and sprint planning.",
        categoryId: "engineering-teams",
      },
      {
        title: "Code Quality & Review",
        slug: "code-quality-review",
        description: "Enforce code review checklists, quality gates, and automated checks before every merge.",
        categoryId: "engineering-teams",
      },
      {
        title: "CI/CD Pipeline Management",
        slug: "cicd-pipeline",
        description: "Track build and deploy status directly from your boards. Set quality gates that prevent tasks from moving forward.",
        categoryId: "engineering-teams",
      },
      {
        title: "Developer Experience",
        slug: "developer-experience",
        description: "Git integration, branch linking, and real-time sync so developers never leave their flow.",
        categoryId: "engineering-teams",
      },
    ],
  },
  {
    id: "product-teams",
    title: "Product Teams",
    description: "Connect strategy to execution with tools for product managers",
    heroTitle: "From vision to delivery, in one place",
    heroSubtitle:
      "Vireo helps product teams align around outcomes, prioritise effectively, and communicate progress with confidence.",
    items: [
      {
        title: "Product Planning",
        slug: "product-planning",
        description: "Roadmap planning, backlog prioritisation, and sprint management with AI-powered insights.",
        categoryId: "product-teams",
      },
      {
        title: "Stakeholder Communication",
        slug: "stakeholder-communication",
        description: "Executive summaries, scheduled reports, and real-time dashboards to keep everyone aligned.",
        categoryId: "product-teams",
      },
      {
        title: "Cross-Team Alignment",
        slug: "cross-team-alignment",
        description: "Shared roadmaps, dependency tracking, and portfolio-level visibility across teams.",
        categoryId: "product-teams",
      },
    ],
  },
  {
    id: "it-operations",
    title: "IT & Operations",
    description: "Enterprise-grade service management and operational control",
    heroTitle: "IT service management, reimagined",
    heroSubtitle:
      "Vireo helps IT teams manage requests, incidents, and assets with the same powerful workflow engine that drives development teams.",
    items: [
      {
        title: "IT Service Desk",
        slug: "it-service-desk",
        description: "Ticketing system with SLAs, auto-assignment, and knowledge base integration for faster resolution.",
        categoryId: "it-operations",
      },
      {
        title: "Incident Response",
        slug: "incident-response",
        description: "Track incidents from detection to resolution with severity levels, escalation policies, and post-mortems.",
        categoryId: "it-operations",
      },
      {
        title: "Asset Management",
        slug: "asset-management",
        description: "Track hardware and software assets across their lifecycle with CMDB integration.",
        categoryId: "it-operations",
      },
    ],
  },
  {
    id: "business-leaders",
    title: "Business Leaders",
    description: "Connect project execution to business outcomes",
    heroTitle: "Bridge the gap between strategy and execution",
    heroSubtitle:
      "Vireo gives business leaders visibility into delivery progress, resource allocation, and portfolio health — all in one place.",
    items: [
      {
        title: "Portfolio Oversight",
        slug: "portfolio-oversight",
        description: "Portfolio-level program boards with cross-project visibility. Track progress across teams and initiatives.",
        categoryId: "business-leaders",
      },
      {
        title: "Resource Optimisation",
        slug: "resource-optimisation",
        description: "Resource allocation and capacity planning. See who is working on what and where bottlenecks form.",
        categoryId: "business-leaders",
      },
      {
        title: "Executive Reporting",
        slug: "executive-reporting",
        description: "Stakeholder-friendly reports with burndown charts, cycle time analysis, and delivery insights.",
        categoryId: "business-leaders",
      },
    ],
  },
  {
    id: "startups",
    title: "Startups",
    description: "Move fast without breaking things — from idea to scale",
    heroTitle: "Ship faster, scale smarter",
    heroSubtitle:
      "Vireo gives startups the project management power of enterprise tools with the simplicity and speed that early-stage teams need.",
    items: [
      {
        title: "Fast Onboarding",
        slug: "fast-onboarding",
        description: "Get your team up and running in minutes. Pre-built templates for common workflows and instant invite links.",
        categoryId: "startups",
      },
      {
        title: "Lean Workflows",
        slug: "lean-workflows",
        description: "Lightweight Kanban boards and simple task tracking that adapts as your team grows.",
        categoryId: "startups",
      },
      {
        title: "Growth Analytics",
        slug: "growth-analytics",
        description: "Track velocity, cycle time, and delivery trends as you scale from a handful of engineers to dozens.",
        categoryId: "startups",
      },
    ],
  },
];

export function getSolutionCategoryById(id: string): SolutionCategory | undefined {
  return solutionCategories.find((c) => c.id === id);
}

export function getSolutionItemBySlug(slug: string): SolutionItem | undefined {
  return solutionCategories.flatMap((c) => c.items).find((i) => i.slug === slug);
}

export function getSolutionCategoryForSlug(slug: string): SolutionCategory | undefined {
  const item = getSolutionItemBySlug(slug);
  if (!item) return undefined;
  return getSolutionCategoryById(item.categoryId);
}
