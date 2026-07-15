import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8F9FF]">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <AIBenefitsSection />
        <CTASection />
      </main>
      <FooterSection />
    </div>
  );
}

function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#F8F9FF]/80 backdrop-blur-[12px] border-b border-[#C3C6D7]/20">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-black text-[#004AC6]">Vireo</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/login"
            className="text-sm font-semibold text-[#434655] transition-colors hover:text-[#004AC6]"
          >
            Product
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-[#434655] transition-colors hover:text-[#004AC6]"
          >
            Solutions
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-[#434655] transition-colors hover:text-[#004AC6]"
          >
            Pricing
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-[#434655] transition-colors hover:text-[#004AC6]"
          >
            Docs
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-semibold text-[#434655] transition-colors hover:text-[#004AC6]"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-[#004AC6] px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_6px_rgba(0,74,198,0.10),0_10px_15px_rgba(0,74,198,0.10)] transition-all hover:bg-[#003da8]"
          >
            Start free trial
          </Link>
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#D9DFF5_0%,_transparent_70%)]" />
      <div className="relative mx-auto max-w-7xl px-6 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#C3C6D7]/30 bg-white px-4 py-1.5 text-sm text-[#5C6274]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
          Vireo v2.4: Now with Automated Sprint Triaging
        </div>
        <h1 className="mx-auto max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-[#121C28] md:text-5xl lg:text-6xl">
          Plan, track, and ship software with{" "}
          <span className="text-[#004AC6]">AI-powered clarity</span>.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#434655] md:text-lg">
          Vireo combines Jira-style workflow rigor with real-time collaboration
          and AI assistance. Designed for engineering teams who value speed,
          precision, and intelligence.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/register"
            className="rounded-lg bg-[#004AC6] px-8 py-3.5 text-base font-bold text-white shadow-[0_4px_6px_rgba(0,74,198,0.10),0_10px_15px_rgba(0,74,198,0.10)] transition-all hover:bg-[#003da8]"
          >
            Start free trial
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-[#C3C6D7] px-8 py-3.5 text-base font-bold text-[#121C28] transition-colors hover:bg-[#F8F9FF]"
          >
            View demo
          </Link>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      title: "Issue tracking",
      description:
        "Rapid issue creation with custom fields, dependencies, and markdown support.",
    },
    {
      title: "Kanban",
      description:
        "Visualise your flow. Fully customizable swimlanes and automation triggers.",
    },
    {
      title: "Scrum sprints",
      description:
        "Iterative planning with velocity tracking and capacity management.",
    },
    {
      title: "Roadmaps",
      description:
        "Strategic alignment across teams with multi-project timeline views.",
    },
    {
      title: "AI ticket writing",
      description:
        "Generate detailed technical specs and ACs from a single prompt.",
    },
    {
      title: "Real-time sync",
      description:
        "Instant updates across all users. No refreshing, just building.",
    },
    {
      title: "Reports",
      description:
        "DORA metrics, burndown charts, and custom data exports.",
    },
    {
      title: "Team chat",
      description:
        "Threaded discussions integrated directly into every issue card.",
    },
  ];

  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-[#121C28] md:text-4xl">
            Engineering-first features
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[#434655]">
            Everything you need to manage complex software lifecycles without
            the bloat of traditional tools.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl bg-[#EEF4FF] p-6 transition-shadow hover:shadow-md"
            >
              <h3 className="text-lg font-semibold text-[#121C28]">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#434655]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AIBenefitsSection() {
  return (
    <section className="bg-[#F8F9FF] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-[#121C28] md:text-4xl">
            Intelligence in every action.
          </h2>
        </div>
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            {[
              {
                title: "Write better tickets",
                desc: "AI analyzes your intent and generates clear acceptance criteria and technical implementation hints.",
              },
              {
                title: "Summarize sprint status",
                desc: "Get a concise executive summary of your current sprint health and blockers in seconds.",
              },
              {
                title: "Triage bugs automatically",
                desc: "Vireo AI automatically categorizes incoming bugs by severity and suggests the best developer for the fix.",
              },
              {
                title: "Automated sprint planning",
                desc: "Balance workloads and schedule tasks based on historical velocity and priority levels.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
              >
                <h3 className="text-lg font-semibold text-[#121C28]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#434655]">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
          <div className="flex items-center">
            <div className="w-full rounded-2xl bg-white p-6 shadow-[0_8px_10px_rgba(0,0,0,0.10),0_20px_25px_rgba(0,0,0,0.10)]">
              <div className="mb-4 text-sm font-bold text-[#004AC6]">
                Vireo AI Assistant
              </div>
              <div className="space-y-4">
                <div className="rounded-xl bg-[#F8F9FF] p-4 text-sm text-[#434655]">
                  I&apos;ve analyzed the current backlog. We have 3 high-priority
                  bugs affecting checkout. Should I create a hotfix sprint for
                  the Core Team?
                </div>
                <div className="rounded-xl bg-[#004AC6] p-4 text-sm text-white">
                  Yes, please. Include &apos;VI-402&apos; and &apos;VI-398&apos;
                  as well.
                </div>
                <div className="rounded-xl bg-[#EEF4FF] p-4 text-sm">
                  <div className="font-semibold text-[#004AC6]">
                    Sprint created
                  </div>
                  <div className="mt-1 text-[#434655]">
                    Assigned to: @SarahM, @DavidK. Target completion: Friday,
                    4:00 PM.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="bg-[#005DA7] py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
          Ready to accelerate your shipping?
        </h2>
        <p className="mt-4 text-base text-[#D3E3FF] md:text-lg">
          Join 500+ teams who have increased their velocity by 40% with Vireo
          AI.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/register"
            className="rounded-lg bg-white px-8 py-3.5 text-base font-bold text-[#005DA7] transition-colors hover:bg-gray-100"
          >
            Get Started for Free
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-white/30 px-8 py-3.5 text-base font-bold text-white transition-colors hover:bg-white/10"
          >
            View Case Studies
          </Link>
        </div>
      </div>
    </section>
  );
}

function FooterSection() {
  return (
    <footer className="border-t border-[#C3C6D7]/20 bg-white py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <span className="text-lg font-black text-[#004AC6]">
              Vireo AI
            </span>
            <p className="mt-2 text-sm text-[#434655]">
              Professional-grade project management for modern software teams.
            </p>
          </div>
          {[
            {
              title: "Product",
              links: ["Changelog", "Documentation", "Integrations", "Security"],
            },
            {
              title: "Solutions",
              links: [
                "For Engineers",
                "For Managers",
                "For Startups",
                "Enterprise",
              ],
            },
            {
              title: "Company",
              links: ["About Us", "Blog", "Careers", "Contact"],
            },
          ].map((column) => (
            <div key={column.title}>
              <h4 className="mb-3 text-xs font-bold tracking-wider text-[#434655] uppercase">
                {column.title}
              </h4>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link}>
                    <Link
                      href="/login"
                      className="text-sm text-[#5C6274] transition-colors hover:text-[#004AC6]"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#C3C6D7]/20 pt-8 sm:flex-row">
          <p className="text-xs text-[#737686]">
            &copy; 2024 Vireo Pro Systems Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-[#737686]">
            <span className="h-2 w-2 rounded-full bg-[#22C55E]" />
            System Status: Operational
          </div>
        </div>
      </div>
    </footer>
  );
}
