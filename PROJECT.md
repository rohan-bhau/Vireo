# VIREO — Frontend / Client Project Documentation

> Complete guide to the VIREO client: what's in the project, every feature, and how it all works.

## 1. Overview

VIREO is an **AI-powered project management platform** — a modern, Jira-style alternative. It combines classic agile planning (workspaces, projects, boards, sprints, backlog, roadmaps, reports) with an **always-on AI assistant** that drafts tickets, summarizes discussions, triages bugs, estimates story points, and plans sprints from a natural-language prompt.

The client is a **Next.js 16 App Router** application (React 19), styled with **Tailwind CSS v4**, state-managed with **Redux Toolkit + RTK Query**, and made real-time with a **Socket.io** client.

| | |
|---|---|
| Framework | Next.js 16.2 (App Router) |
| UI | React 19.2 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`) |
| State | Redux Toolkit 2.12 + RTK Query |
| Drag & drop | dnd-kit |
| Flow editor | @xyflow/react 12 (workflow editor) |
| Animation | framer-motion 12 |
| Realtime | socket.io-client 4.8 |
| Icons | lucide-react + inline brand SVGs |

---

## 2. Project Structure

```
src
├── app/                    # Next.js App Router — every page & route
│   ├── page.tsx            #   marketing landing page
│   ├── (marketing)/        #   public site (about, blog, careers, changelog, contact, docs,
│   │                       #   enterprise, gdpr, guide, integrations, privacy, security, terms)
│   ├── product/            #   product categories + per-feature deep dives
│   ├── solutions/          #   solution categories + deep dives
│   ├── pricing/            #   pricing plans & comparison
│   ├── admin/              #   platform admin console
│   ├── w/[workspaceId]/    #   workspace pages (dashboard, members, audit-log, admin, settings)
│   ├── p/[projectId]/      #   project pages (board, backlog, sprint, roadmap, reports…)
│   ├── task/[taskKey]/     #   task detail
│   ├── dashboard/          #   workspace picker
│   ├── search/             #   global search
│   ├── ai-assistant/       #   full AI chat assistant
│   ├── notifications/      #   notification center
│   ├── profile/            #   profile + notification preferences
│   ├── login, register, forgot-password, reset-password, oauth/callback
│   ├── invite/accept, invite/decline
│   └── not-found.tsx       #   custom branded 404 page
├── components/             # feature components grouped by domain
│   ├── ai/                 #   AI assistant UI (chat, ticket writer, triage, sprint planner…)
│   ├── auth/               #   guards, providers, OAuth buttons, OTP verification
│   ├── automation/         #   rule builder (triggers/conditions/actions/branches)
│   ├── billing/            #   upgrade prompt / plan gates
│   ├── board/              #   Kanban board (columns, cards, swimlanes, quick-create)
│   ├── dashboard/          #   dashboards + gadgets
│   ├── integrations/       #   webhook config
│   ├── layout/             #   app shell, sidebar, workspace header, navbar
│   ├── nav/                #   search bar, notification bell, keyboard shortcuts
│   ├── notifications/      #   notification list, preferences, watchers
│   ├── onboarding/         #   onboarding checklist popup
│   ├── projects/           #   project tabs + project settings
│   ├── reports/            #   burndown, velocity, CFD, control chart…
│   ├── roadmap/            #   epic timeline, dependency arrows, sprint overlay
│   ├── search/             #   JQL search, filters, bulk actions
│   ├── sections/           #   marketing blocks + MarketingShell
│   ├── sprint/             #   backlog, scrum board, sprint dialogs
│   ├── tasks/              #   issue cards, detail, comments, attachments
│   ├── theme/              #   theme provider/toggle
│   ├── ui/                 #   button, dialog, avatar, toast…
│   ├── workflows/          #   visual workflow editor + scheme editor
│   ├── workspace/          #   workspace tabs (board/list/summary/timeline/reports)
│   ├── workspace-settings/ #   workspace settings panels
│   └── brand-logo.tsx      #   reusable third-party brand SVG set
├── hooks/                  # use-hotkeys, use-can-edit
├── lib/                    # auth/tokens, socket client, product/solutions/pricing data, plans, roles
└── store/                  # Redux store + per-domain RTK Query APIs
```

---

## 3. Feature Inventory (Everything the App Does)

### 3.1 Public / Marketing
- Landing page with hero, features, product preview, template showcase, AI benefits, integrations, pricing and CTA sections.
- Full marketing site under `(marketing)/`: about, blog, careers, changelog, contact, docs, enterprise, GDPR, interactive guide, integrations, privacy, security, terms.
- **Product pages** (`/product`) — data-driven feature deep dives across 6 categories (features, developers, product-manager, IT professionals, business teams, IT teams).
- **Solutions pages** (`/solutions`) — 5 categories (engineering teams, product teams, IT operations, business leaders, startups).
- **Pricing page** — Free / Standard / Enterprise per-seat plans + comparison table + FAQ.
- Custom **branded 404** page.
- All marketing copy lives in `src/lib/` data files — pages are data-driven, not hardcoded.

### 3.2 Authentication
- Email + password registration with **6-digit OTP email verification**.
- **Google & GitHub OAuth** sign-in.
- Password reset via email token.
- **JWT access + refresh token rotation**, auto-refresh on 401 (RTK Query reauth wrapper).
- Guest/auth guards, email verification gate.

### 3.3 Workspaces & Teams
- Create / edit / delete workspaces, upload avatar, transfer ownership.
- Member management with roles: **Owner, Admin, Edit, View**.
- Invite members by email or shareable link; accept/decline invitation.
- Star workspaces, recent workspaces, workspace picker dashboard.

### 3.4 Projects & Planning
- Create projects from templates (Scrum, Kanban, Bug Tracking, Project Management, DevOps, Task Tracking, Blank).
- Configure enabled **issue types** (Story, Task, Bug, Epic, Subtask).
- **Kanban & Scrum boards** with drag-and-drop (dnd-kit), WIP limits, swimlanes, quick-create, filters, board switching.
- **Backlog & sprints** — create/start/complete sprints, assign tasks, backlog ranking.
- **Roadmap & timeline** — epic-based timeline, dependency arrows, sprint overlays.
- **Components & versions** — project components, release versions with progress.
- **Reports** — burndown, velocity, sprint report, cumulative flow, control chart, created-vs-resolved, average age, time-to-resolution.

### 3.5 Issues & Tasks
- Full issue model: type, priority, story points, labels, components, versions, assignee, reporter.
- **Linked issues & subtasks**, rich-text descriptions, **attachments** (Cloudinary).
- Comments with **@-mentions** and activity history.
- **Watch/unwatch** tasks.
- Drag-and-drop reordering across board / backlog.

### 3.6 Customization
- **Custom fields** (workspace-level) attached to issues.
- **Visual workflow editor** (React Flow / @xyflow) — custom statuses, transitions, conditions, validators, post-functions; workflow **schemes** mapped to issue types.
- **Permission schemes**, **project roles**, and **issue security levels** (Jira-style).
- Full **admin console** — users, groups, workflows, permission schemes, issue security, custom fields, system, billing.

### 3.7 Automation
- **Rule builder**: trigger → condition → action (assign, set status/priority, labels, due dates, comments, webhooks, link issues, create issue, add subtask), with branching.
- **Scheduled (cron) rules** executed server-side.
- **Natural-language** rule creation (`parseNaturalLanguage`).
- Rule audit log.

### 3.8 AI Assistant
- Draft tickets, summarize issue threads, suggest comment replies, **smart triage**, plan sprints, and a full **chat assistant** with conversation history.
- AI contextual launcher on boards, AI ticket writer, AI description generator, AI sprint planner, AI triage, AI summary card.

### 3.9 Collaboration & Realtime
- Threaded comments, activity history, notifications with **live unread badge**.
- Notification preferences per user/workspace; notification schemes per project.
- **Socket.io realtime** — board, task, column, comment and notification events push live with no page refresh.
- Watchers on tasks.

### 3.10 Search
- JQL-style search with autocomplete, saved filters, advanced filtering, bulk actions, and global search across tasks, projects, workspaces.

### 3.11 Billing
- **Free / Pro / Enterprise** plans, usage counters (members, AI calls, storage, automation runs), plan-limit gating.
- Stripe checkout, **plan activation** (with webhook-independent recovery + polling), cancel/resume, trial, billing portal.

---

## 4. How the Client Works

### 4.1 State Management (Redux Toolkit + RTK Query)
- One central store (`src/store/index.ts`) with the RTK Query `api` slice plus `auth`, `sidebar`, and `workspace` slices.
- **RTK Query** (`api.ts`) provides typed, cached data access for every domain — each feature area has its own endpoint slice (`authApi`, `taskApi`, `projectApi`, `workspaceApi`, `sprintApi`, `epicApi`, `workflowApi`, `versionApi`, `componentApi`, `labelApi`, `customFieldApi`, `notificationApi`, `permissionApi`, `searchApi`, `savedFilterApi`, `reportApi`, `auditLogApi`, `integrationApi`, `dashboardApi`, `billingApi`, `automationApi`, `aiApi`, `adminApi`, `watchApi`).
- `keepUnusedDataFor: Infinity` keeps fetched data in cache for fast revisit.

### 4.2 Persistence (localStorage)
- Tokens stored as `vireo_access_token` / `vireo_refresh_token` (`lib/auth.ts`).
- Workspace state (active workspace, recent/starred workspaces, visible sections/menu items, per-workspace tabs) persisted under `vireo_workspace_state`.
- On a user change, cached API state resets and workspace state clears.

### 4.3 Authentication Flow
- On boot, `AuthProvider` rehydrates credentials by calling `getProfile`, then connects the socket.
- Every API request attaches `Authorization: Bearer <accessToken>`.
- On a **401**, the reauth wrapper posts the refresh token to `/auth/refresh`, stores the new pair, and retries the original request. If refresh fails, it logs out.

### 4.4 Realtime (Socket.io)
- `lib/socket.ts` connects to `NEXT_PUBLIC_SOCKET_URL` with the access token in the handshake.
- Joins rooms for the active board and workspace.
- Listens for board/task/comment/notification/subscription events and dispatches them into RTK Query cache updates for live UI.
- Rejoins rooms automatically on reconnect.

### 4.5 Design System
- Tailwind v4 utility classes with a consistent blue (`#004AC6`-family) + neutral palette.
- Premium marketing UI: gradient accents, glow orbs, grid patterns, glass chips, brand-colored logos, smooth framer-motion entrances.
- Dark theme via `theme/` provider.

---

## 5. Data Sources (marketing copy)

| File | Purpose |
|---|---|
| `lib/product-data.ts` | Product categories + feature deep-dive content |
| `lib/solutions-data.ts` | Solution categories + content |
| `lib/pricing-data.ts` | Pricing plans, comparison, FAQ |
| `lib/plans.ts` | Plan limits + feature gating (mirrors server `plan.ts`) |
| `lib/workspace-roles.ts` | Role labels, matrix, permissions |

---

## 6. Scripts & Environment

```bash
npm run dev      # dev server on :3000
npm run build    # production build
npm run start    # serve production build
npm run lint     # ESLint (flat config, eslint-config-next)
```

| Env var | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the VIREO API (includes `/api`) |
| `NEXT_PUBLIC_SOCKET_URL` | WebSocket URL for realtime events |

---

## 7. Deployment

- Deployed on **Vercel**.
- Set both `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SOCKET_URL` in the Vercel project, then push to `main`.

> **Note on scope:** two project routes (`/p/[projectId]/issues` and `/p/[projectId]/timeline`) are intentionally left as "Coming soon" placeholders.
