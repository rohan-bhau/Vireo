<div align="center">

<img src="./public/vireo-logo.svg" alt="VIREO" width="320" />

# VIREO

### AI-Powered Project Management Platform

A modern alternative to tools like Jira — plan sprints, track issues, automate busywork, and let an AI assistant write the tickets you'd rather not.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-vireo--client.vercel.app-blue?style=for-the-badge&logo=vercel)](https://vireo-client.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-2.12-764ABC?style=for-the-badge&logo=redux)](https://redux-toolkit.js.org/)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Source Code](#source-code)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Related Repositories](#related-repositories)
- [Author](#author)
- [Support](#support)
- [License](#license)

---

## Overview

VIREO is an AI-powered project management platform built to help teams plan, track, and ship work. It combines Jira-style planning (sprints, boards, workflows, automation) with an always-on AI assistant that drafts tickets, summarizes discussions, triages bugs, and plans sprints from a natural-language prompt.

The frontend is a Next.js 16 App Router application backed by a REST + WebSocket API, with Redux Toolkit state management, real-time board and notification updates, and full billing flows via Stripe. Try the [live demo](https://vireo-client.vercel.app/) or the [deployed API](https://vireo-server.onrender.com).

<!-- TODO: add screenshots before final submission -->

---

## Source Code

[![Client Repository](https://img.shields.io/badge/Client%20Repository-Vireo-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/rohan-bhau/Vireo)
[![Server Repository](https://img.shields.io/badge/Server%20Repository-Vireo--server-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/rohan-bhau/Vireo-server)

---

## Key Features

### Planning & Tracking
- **Workspaces & projects** — multi-team workspaces with role-based membership, invites, and 7 project templates (Scrum, Kanban, Bug Tracking, Project Management, DevOps, Task Tracking, Blank).
- **Kanban & Scrum boards** — drag-and-drop cards and columns powered by dnd-kit, WIP limits, quick-create, filters, and swimlanes.
- **Backlog & sprints** — sprint creation, planning, activation, completion, and sprint-level issue assignment.
- **Issues & tasks** — task types (task, bug, epic, story, subtask), priorities, story points, labels, components, versions, linked issues, and Cloudinary-hosted attachments.
- **Roadmap & timeline** — epic-based roadmap with sprint overlays and dependency arrows.
- **Reports** — burndown, velocity, sprint report, cumulative flow, control chart, and created-vs-resolved analytics.

### Customization
- **Custom workflows** — visual workflow editor (React Flow) with custom statuses, transitions, conditions, validators, and post-functions; workflow schemes per issue type.
- **Custom fields** — workspace-level custom fields attached to issues.
- **Permissions & security** — permission schemes, project roles, and issue security levels.
- **Admin console** — user, group, workflow, permission-scheme, and issue-security management. _Note: the "Screens" admin page is UI-only and not yet backed by an API._

### Automation
- **Rule builder** — trigger/condition/action rules (assign, set status/priority, labels, due dates, comments, webhooks, link issues) with branching and a natural-language input.
- **Scheduled rules** — cron-based rules executed server-side by a scheduler.

### AI Assistant
- Draft tickets, summarize issue threads, suggest comment replies, triage incoming work, and plan sprints from prompts.
- Chat-style assistant with conversation history (LLM-backed, with a graceful fallback when no API key is configured).

### Collaboration
- **Comments & activity** — threaded comments, rich-text editing, per-issue activity history.
- **Notifications & watching** — email + in-app notifications, granular preferences, watch/unwatch, and live counts.
- **Real-time** — WebSocket (Socket.io) pushes for board, task, column, and notification events. (Event-based only — no built-in chat.)

### Search
- **JQL-style search** with autocomplete, saved filters, advanced filtering, bulk actions, and global search across tasks, projects, and workspaces.

### Auth & Billing
- Email + password with OTP verification, Google & GitHub OAuth, and JWT access/refresh token rotation.
- Stripe-powered **Free / Pro / Enterprise** plans with member, AI-call, storage, and automation-run limits enforced by the API.

---

## Tech Stack

| Category     | Technology                                             |
| ------------ | ------------------------------------------------------ |
| Framework    | Next.js 16.2.10 (App Router)                           |
| UI Library   | React 19.2.4                                           |
| Language     | TypeScript 5                                           |
| Styling      | Tailwind CSS v4 (`@tailwindcss/postcss`)               |
| State        | Redux Toolkit 2.12 + RTK Query                         |
| Drag & Drop  | dnd-kit (core, sortable, utilities)                    |
| Flow Editor  | @xyflow/react 12.11.2 (workflow editor)                |
| Animation    | framer-motion 12.42.2                                  |
| Icons        | lucide-react                                           |
| Realtime     | socket.io-client 4.8.3                                 |
| Utilities    | clsx, tailwind-merge                                   |
| Deployment   | Vercel                                                 |

---

## Project Structure

```
src
├── app/                # Next.js App Router: pages, routes & layouts
│   ├── (marketing)/    #   public marketing site (pricing, docs, solutions, legal)
│   ├── admin/          #   platform admin console (users, groups, workflows…)
│   ├── w/[workspaceId]/#   workspace pages (dashboard, members, settings…)
│   ├── p/[projectId]/  #   project pages (board, backlog, sprints, roadmap…)
│   └── …               #   auth, profile, search, notifications, AI assistant, task detail
├── components/         # feature components grouped by domain (board, sprint, ai, workflows…)
├── hooks/              # shared custom hooks (e.g. use-hotkeys)
├── lib/                # utilities: auth/token helpers, socket client, pricing & product data
└── store/              # Redux Toolkit store + per-domain RTK Query APIs (taskApi, projectApi…)
```

---

## Getting Started

### Prerequisites

- **Node.js 20+** (Next.js 16 requirement) and npm
- A running instance of the [VIREO API server](https://github.com/rohan-bhau/Vireo-server)

### Clone & Install

```bash
git clone https://github.com/rohan-bhau/Vireo.git
cd Vireo
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

| Variable                 | Description                                  | Example                                      |
| ------------------------ | -------------------------------------------- | -------------------------------------------- |
| `NEXT_PUBLIC_API_URL`    | Base URL of the VIREO API (`/api` included)  | `https://vireo-server.onrender.com/api`       |
| `NEXT_PUBLIC_SOCKET_URL` | WebSocket URL for real-time events           | `https://vireo-server.onrender.com`           |

For local development against a local server, use `http://localhost:5000/api` and `http://localhost:5000`.

### Run

```bash
npm run dev        # start the dev server on http://localhost:3000
npm run build      # production build
npm start          # serve the production build
```

---

## Available Scripts

| Script            | Description                                              |
| ----------------- | -------------------------------------------------------- |
| `npm run dev`     | Starts the Next.js development server on port 3000       |
| `npm run build`   | Creates an optimized production build                    |
| `npm start`       | Starts the production server (requires a prior `build`)  |
| `npm run lint`    | Runs ESLint (flat config, `eslint-config-next`)          |

---

## Deployment

The app is deployed on **Vercel**. Set both environment variables (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SOCKET_URL`) in the Vercel project settings, then push to the `main` branch.

- **Live demo:** https://vireo-client.vercel.app/

---

## Roadmap

Honest status of what's built vs. next up — nothing below has a backend wired yet:

- [ ] **Messaging / chat** — real-time is currently board & notification events only
- [ ] **Admin "Screens" backend** — the admin Screens page is UI-only today
- [ ] **Automated tests** — no test framework is installed yet
- [ ] **CI pipeline** — verified manually via `npm run lint` + `npm run build`
- [ ] **Internationalization** — single-locale UI at present

---

## Related Repositories

- **VIREO API server** — Express 5 + Prisma/PostgreSQL + MongoDB backend: [github.com/rohan-bhau/Vireo-server](https://github.com/rohan-bhau/Vireo-server)

---

## Author

**MD Rohan Mia** — Full-Stack Developer

[![GitHub](https://img.shields.io/badge/GitHub-@rohan--bhau-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/rohan-bhau)

---

## Support

If you find VIREO useful, consider giving the repository a ⭐ on GitHub.

---

## License

This repository does not currently include a license file. All rights are reserved by the author until a license is added.

---

<div align="center">

Built with ❤️ using Next.js, React, TypeScript, Tailwind CSS & Redux Toolkit

</div>
