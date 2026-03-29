# Mission Marketplace MVP — Product Document

**Version:** 1.0
**Date:** March 29, 2026
**Status:** Prototype (Functional MVP)
**Repository:** [github.com/itocazo/mission-marketplace-mvp](https://github.com/itocazo/mission-marketplace-mvp)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement & Whitepaper Foundation](#2-problem-statement--whitepaper-foundation)
3. [Product Vision & Validation Goals](#3-product-vision--validation-goals)
4. [Architecture & Technology Stack](#4-architecture--technology-stack)
5. [Data Model & Type System](#5-data-model--type-system)
6. [Core Features](#6-core-features)
7. [Mission Lifecycle](#7-mission-lifecycle)
8. [Dynamic Pricing Algorithm](#8-dynamic-pricing-algorithm)
9. [Reputation & Points Economy](#9-reputation--points-economy)
10. [Pages & User Interface](#10-pages--user-interface)
11. [Component Library](#11-component-library)
12. [Seed Data & Demo Personas](#12-seed-data--demo-personas)
13. [State Management & Persistence](#13-state-management--persistence)
14. [Known Limitations & Technical Debt](#14-known-limitations--technical-debt)
15. [Future Roadmap](#15-future-roadmap)
16. [File Structure](#16-file-structure)
17. [Running the Application](#17-running-the-application)

---

## 1. Executive Summary

The Mission Marketplace MVP is a functional web prototype that validates the core concept described in the companion whitepaper: **an internal mission-based marketplace where employees post organizational challenges as "missions," other employees solve them, and peer validation determines rewards and reputation.**

The whitepaper identifies a fundamental "coordination paradox" — AI has dramatically reduced task execution costs, yet 78% of AI initiatives fail to capture savings because coordination overhead (approvals, routing, status tracking) consumes the gains. The Mission Marketplace proposes a market mechanism as an alternative to bureaucratic coordination: instead of managers assigning work top-down, work is posted as priced missions that self-organize through incentives.

This MVP implements a complete marketplace loop in a single-page application. A user can:
- **Create** a mission with dynamic pricing
- **Apply** to solve a mission
- **Assign** a solver from a pool of applicants
- **Submit** completed work for review
- **Approve** or request revisions on submissions
- **Earn** points and reputation through participation

Five pre-built personas allow a single evaluator to experience every role (creator, solver, validator, curator) without needing multiple accounts or a backend.

---

## 2. Problem Statement & Whitepaper Foundation

The whitepaper spans 11 chapters building the theoretical and practical case for internal mission marketplaces:

| Chapter | Title | Key Contribution |
|---------|-------|------------------|
| 0 | Executive Summary | Frames the coordination paradox |
| 1 | Introduction | Coase's theory of the firm applied to internal markets |
| 1b | Case Studies | Analyzes Kaggle, Topcoder, Stack Overflow, GitHub, hackathons |
| 2 | Reputation & Incentives | Reputation decay, multi-review, staking, anti-gaming |
| 3 | Theory & Economics | Principal-agent theory, Goodhart's Law, network effects |
| 4 | Marketplace Design | Dynamic pricing, task flow, points economy, auction models |
| 5 | Governance & Alignment | OKR integration, strategic alignment, innovation boards |
| 6 | Open Questions | IP, GDPR, labor law, fairness, ethics |
| 7 | Implementation Roadmap | Technology stack, pilot design, blockchain vs. databases |
| 8 | Appendices | Comparative tables, architecture diagrams |
| 9 | Next Steps | AI-agent workspace, research agenda |

**The MVP specifically validates Chapter 4 (Marketplace Design)** — the practical mechanics of mission creation, solver selection, reward distribution, and reputation accumulation. It implements the dynamic pricing formula from Chapter 4, the reputation dimensions from Chapter 2, and the role taxonomy from the design chapter.

---

## 3. Product Vision & Validation Goals

### What This MVP Validates

1. **Is the marketplace loop intuitive?** Can a stakeholder understand the flow of Create → Apply → Assign → Submit → Review → Complete without training?
2. **Does dynamic pricing feel fair?** Does the formula produce rewards that feel proportional to effort, urgency, and strategic value?
3. **Do reputation dimensions motivate behavior?** Does a 4-dimensional reputation score (Impact, Execution, Collaboration, Growth) create meaningful differentiation between contributors?
4. **Is role switching natural?** Can one person (creator, solver, validator) participate in multiple capacities within the same marketplace?
5. **Does the points economy circulate?** Do points flow from missions to solvers, validators, and creators in a way that sustains participation?

### What This MVP Does NOT Validate

- Multi-user concurrency or real authentication
- Backend persistence, APIs, or database performance
- Integration with enterprise systems (HRIS, OKR tools, Slack)
- Governance workflows (mission approval boards, spending limits)
- Anti-gaming or manipulation resistance
- Scale beyond seed data

---

## 4. Architecture & Technology Stack

### Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | Next.js (App Router) | 16.2.1 | Server/client rendering, file-based routing |
| UI Library | React | 19.2.4 | Component-based UI |
| Language | TypeScript | 5.x | Type safety across the codebase |
| Styling | Tailwind CSS | 4.x | Utility-first CSS with PostCSS |
| State | Zustand | 5.0.12 | Lightweight global state with persistence |
| Icons | Lucide React | 1.7.0 | Consistent icon system (200+ icons) |
| Charts | Recharts | 3.8.1 | Data visualization (leaderboard, stats) |
| Dates | date-fns | 4.1.0 | Date formatting and calculation |

### Key Architecture Decisions

**Client-side only, no backend.** The entire application runs in the browser. All state lives in Zustand with `localStorage` persistence. This was intentional — the goal is rapid prototyping and stakeholder demos, not production readiness.

**Persona switching instead of authentication.** Five pre-built users can be switched instantly from the header. This lets a single evaluator experience every role without logout/login cycles.

**Hydration guard pattern.** Zustand's `persist` middleware loads state from `localStorage` on the client, creating a mismatch with server-rendered HTML (which uses default state). A `ClientProvider` component delays rendering until after hydration to prevent this:

```tsx
// ClientProvider.tsx
export default function ClientProvider({ children }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return <div>Loading...</div>;
  return <>{children}</>;
}
```

**No API layer.** Store actions (createMission, applyToMission, approveWork, etc.) directly mutate Zustand state. In production, these would become API calls to a backend service.

---

## 5. Data Model & Type System

All types are defined in `src/lib/types.ts`. The model captures the full lifecycle of missions, users, and transactions.

### User

```typescript
interface User {
  id: string;                    // e.g. "u1"
  name: string;                  // "Ana Torres"
  avatar: string;                // Avatar URL (unused in MVP, uses initials)
  title: string;                 // "Product Strategy Lead"
  department: string;            // "Product"
  roles: UserRole[];             // ['creator', 'curator']
  skills: string[];              // ['Product Strategy', 'OKR Design', ...]
  reputation: {
    total: number;               // Aggregate score
    impact: number;              // 40% weight — organizational value delivered
    execution: number;           // 30% weight — quality and timeliness
    collaboration: number;       // 20% weight — teamwork and knowledge sharing
    growth: number;              // 10% weight — learning and skill development
  };
  level: number;                 // 1-5 numeric level
  levelName: string;             // 'Novice' | 'Contributor' | 'Expert' | 'Master' | 'Architect'
  pointsBalance: number;         // Current spendable/earned points
  badges: string[];              // Badge IDs earned
  joinedAt: string;              // ISO timestamp
  completionRate: number;        // 0.0-1.0 ratio of completed missions
  missionsCompleted: number;
  missionsCreated: number;
  missionsValidated: number;
}
```

**Roles:**
- **Creator** — Posts missions, selects solvers, owns the problem
- **Solver** — Applies to missions, does the work, submits deliverables
- **Validator** — Reviews submitted work, approves or requests revisions
- **Curator** — Curates and categorizes missions (not fully implemented in MVP)

### Mission

```typescript
interface Mission {
  id: string;                       // e.g. "m1"
  title: string;
  description: string;
  successCriteria: string[];        // Checklist of acceptance criteria
  category: MissionCategory;        // 'strategic' | 'operational' | 'exploratory'
  rewardModel: RewardModel;         // 'fixed' | 'auction' | 'lottery'
  estimatedHours: number;
  deadline: string;                 // ISO date
  requiredSkills: string[];
  complexity: number;               // 1.0 - 3.0 multiplier
  urgency: number;                  // 1.0 - 2.0 multiplier
  strategicImportance: number;      // 0.8 - 1.5 multiplier
  baseReward: number;               // Calculated from formula
  dynamicReward: number;            // Adjusted by time/demand
  status: MissionStatus;
  creatorId: string;
  solverId: string | null;
  validatorId: string | null;
  applicants: Application[];
  activityLog: ActivityEntry[];
  createdAt: string;
  submittedAt: string | null;
  completedAt: string | null;
}
```

### Supporting Types

```typescript
interface Application {
  userId: string;
  proposal: string;         // Solver's approach description
  bidAmount?: number;        // Optional bid for auction model
  appliedAt: string;
}

interface ActivityEntry {
  id: string;
  type: 'created' | 'applied' | 'assigned' | 'submitted' |
        'approved' | 'revision_requested' | 'rejected' | 'completed' | 'comment';
  userId: string;
  message: string;
  timestamp: string;
}

interface PointTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'earned' | 'spent' | 'bonus';
  missionId: string;
  description: string;
  timestamp: string;
}
```

---

## 6. Core Features

### 6.1 Mission Creation

Creators post missions with a rich form:
- Title, description, and success criteria (dynamic list)
- Category selection (Strategic / Operational / Exploratory)
- Reward model (Fixed / Auction / Lottery)
- Estimated hours, complexity, urgency, and strategic importance sliders
- Deadline picker
- Required skills selector (search from 20 predefined skills)
- **Live pricing calculator** in a sticky sidebar shows reward breakdown as parameters change

### 6.2 Mission Discovery & Filtering

The missions page provides:
- **Text search** across title, description, and skills
- **Status filters**: All, Open, In Progress, Under Review, Completed
- **Category filters**: All, Strategic, Operational, Exploratory
- **Sort options**: Newest, Highest Reward, Closest Deadline
- **Visual urgency signals**: Red border for overdue, amber for urgent (<7 days), flame badge for "hot" missions (2+ applicants), high-value banner for 3,000+ point missions

### 6.3 Application & Solver Selection

- Solvers write a proposal describing their approach
- Creators see all applicants with their reputation scores and completion rates
- Creators select a solver with one click
- A validator is auto-assigned (first available user with the 'validator' role)

### 6.4 Work Submission & Review

- Solvers submit work with a single action
- Validators (or creators) can:
  - **Approve** — Completes the mission and triggers reward distribution
  - **Request Revision** — Returns mission to solver with feedback
- Feedback text area for reviewer comments

### 6.5 Reward Distribution

On approval, points are distributed automatically:
- **Solver**: Full dynamic reward + 10% quality bonus
- **Validator**: 10% of base reward
- **Creator**: 5% of base reward
- **Reputation**: Each recipient gets a 5% reputation bonus on earned points, distributed across the 4 dimensions (Impact 40%, Execution 30%, Collaboration 20%, Growth 10%)

### 6.6 Persona Switching

- Dropdown in the header shows all 5 personas
- Instant switch — dashboard, nav, and role-based UI adapt immediately
- Toast notification confirms the switch
- "Reset Demo Data" button restores seed state

### 6.7 Toast Notifications

- Success/Info/Error variants with auto-dismiss (4 seconds)
- Triggered on all key actions: apply, assign, submit, approve, revise, create, persona switch, data reset

---

## 7. Mission Lifecycle

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐     ┌───────────┐
│   OPEN   │────▶│ IN PROGRESS  │────▶│ UNDER REVIEW │────▶│ COMPLETED │
│          │     │              │     │              │     │           │
│ Solvers  │     │ Solver works │     │ Validator    │     │ Points    │
│ apply    │     │ on mission   │     │ reviews work │     │ distributed│
└──────────┘     └──────────────┘     └──────┬───────┘     └───────────┘
                                             │
                                             │ Revision
                                             │ Requested
                                             ▼
                                    ┌─────────────────┐
                                    │    REVISION      │
                                    │    REQUESTED     │──── Solver resubmits ───▶ UNDER REVIEW
                                    └─────────────────┘
```

**State Transitions:**

| From | To | Triggered By | Action |
|------|----|-------------|--------|
| Open | In Progress | Creator | Selects a solver from applicants |
| In Progress | Under Review | Solver | Submits completed work |
| Under Review | Completed | Validator/Creator | Approves work |
| Under Review | Revision Requested | Validator/Creator | Requests changes with feedback |
| Revision Requested | Under Review | Solver | Resubmits updated work |
| Under Review | Open | Validator/Creator | Rejects work (resets solver/validator) |

**Visual representation**: The `MissionLifecycle` component renders a 4-step horizontal progress bar showing the current state with filled/outlined/empty circles and connecting lines.

---

## 8. Dynamic Pricing Algorithm

The pricing engine in `src/lib/pricing.ts` implements the whitepaper's reward formula.

### Base Reward Calculation

```
R_base = W_base × C_complexity × U_urgency × S_strategic × (1 - D_difficulty)
```

Where:
- **W_base** = 10 points per hour (fixed base rate)
- **C_complexity** = 1.0 to 3.0 (complexity multiplier)
- **U_urgency** = 1.0 to 2.0 (urgency multiplier)
- **S_strategic** = 0.8 to 1.5 (strategic importance multiplier)
- **D_difficulty** = 0 to 0.2 (difficulty adjustment based on solver completion rates above 90%)

**Example**: A 40-hour mission with complexity 1.5, urgency 1.2, strategic 1.0:
```
R_base = 10 × 40 × 1.5 × 1.2 × 1.0 × (1 - 0) = 720 points
```

### Dynamic Reward Adjustment

The base reward is adjusted in real-time based on time pressure and solver availability:

```
R_dynamic = R_base × [1 + α × t_elapsed × (1 - β × q_solvers)]
```

Where:
- **α** = 0.15 (time sensitivity weight)
- **β** = 0.7 (solver availability weight)
- **t_elapsed** = ratio of time passed since creation to total time window
- **q_solvers** = qualified solver ratio (default 0.5 in MVP)

**Bounds**: The dynamic reward is clamped between 75% and 150% of the base reward.

**Effect**: Missions that go unsolved become more valuable over time (up to 1.5x), while missions with many qualified solvers stay near base price. This creates a self-correcting market signal.

### Reward Distribution Breakdown

When a mission is approved:

| Recipient | Amount | Type |
|-----------|--------|------|
| Solver | `dynamicReward` | Earned |
| Solver | `dynamicReward × 10%` | Quality Bonus |
| Validator | `dynamicReward × 10%` | Validation Reward |
| Creator | `dynamicReward × 5%` | Creator Reward |

Total cost per mission = ~125% of the dynamic reward.

---

## 9. Reputation & Points Economy

### Reputation Dimensions

The reputation system uses a 4-dimensional model weighted to reflect organizational priorities:

| Dimension | Weight | What It Measures |
|-----------|--------|-----------------|
| **Impact** | 40% | Organizational value delivered — did the work matter? |
| **Execution** | 30% | Quality and timeliness — was the work done well? |
| **Collaboration** | 20% | Teamwork — did the person help others succeed? |
| **Growth** | 10% | Learning — did the person develop new skills? |

### Level Progression

| Level | Name | Reputation Threshold |
|-------|------|---------------------|
| 1 | Novice | 0 |
| 2 | Contributor | 500 |
| 3 | Expert | 2,000 |
| 4 | Master | 5,000 |
| 5 | Architect | 10,000 |

The profile page shows a progress bar toward the next level.

### Points Economy

Points serve dual purposes:
1. **Reward signal** — Earned through mission completion, validation, and creation
2. **Reputation input** — 5% of earned points convert to reputation, distributed across dimensions

The economy is inflationary by design (points are created on mission approval, never destroyed in the MVP). In production, this would be balanced by spending mechanics (mission posting costs, marketplace fees, etc.) as described in the whitepaper.

---

## 10. Pages & User Interface

### 10.1 Dashboard (`/`)

The home page adapts to the current persona's role:

- **Welcome header** with role-specific subtitle:
  - Creator: "Track your posted missions and review submissions."
  - Solver: "Find missions to solve and grow your reputation."
  - Validator: "Review submitted work and ensure quality standards."
- **Action prompts** (contextual banners):
  - Amber: "X missions awaiting your review" (for validators/creators)
  - Blue: "X missions in progress" (for active solvers)
  - Green: "X open missions need solvers" (for solvers)
- **Stats grid**: Open Missions, In Progress, Completed, Your Points
- **Recent Missions**: Latest 4 missions as cards
- **Sidebar**: Your Stats (reputation, level, missions solved, total earned, completion rate), Category Breakdown (strategic/operational/exploratory percentages), Awaiting Review list, Top 5 Contributors mini-leaderboard

### 10.2 Mission Catalog (`/missions`)

- Search bar with real-time text filtering
- Status filter tabs (All / Open / In Progress / Under Review / Completed)
- Category filter dropdown
- Sort dropdown (Newest / Highest Reward / Closest Deadline)
- Responsive 2-column grid of MissionCards
- Empty state with icon when no missions match filters

### 10.3 Create Mission (`/missions/new`)

Two-column layout:
- **Left (form)**: Title, description, success criteria list (add/remove), category dropdown, reward model dropdown, estimated hours slider, complexity/urgency/strategic sliders, deadline picker, skills multi-select with search
- **Right (sticky sidebar)**: Live PricingCalculator showing real-time reward breakdown as form values change

### 10.4 Mission Detail (`/missions/[id]`)

Rich detail page with role-conditional actions:

- **Header**: Category badge, status badge, reward model tag, title, dynamic reward with base comparison
- **Lifecycle stepper**: Visual 4-step progress indicator
- **Description & Success Criteria**: Full text with checkmark list
- **Action zones** (conditional on role + status):
  - Solver on Open mission: "Apply" button expands to proposal form
  - Creator on Open mission with applicants: Applicant cards with "Select Solver" buttons
  - Solver on In Progress: "Submit for Review" button
  - Validator on Under Review: Approve / Request Revision with feedback textarea
- **Activity feed**: Reverse-chronological log of all mission events
- **Sidebar**: Details (hours, deadline, reward, applicants, multipliers), People (creator/solver/validator with avatars), Required Skills tags, Days Remaining countdown (turns red at <=7 days)

### 10.5 Profile (`/profile`)

- **Header card**: Avatar (initials), name, title, department, role badges, points balance, join date
- **Reputation section**: Total score, level with progress bar, 4-dimension breakdown with individual bars
- **Badges collection**: Earned badges with names and descriptions
- **Mission history tabs**: Missions Solved / Created / Validated, each showing relevant mission cards
- **Points history**: Recent transactions with amounts and descriptions

### 10.6 Leaderboard (`/leaderboard`)

- **Sort tabs**: Reputation, Points, Missions, Completion Rate
- **Podium**: Top 3 users displayed as a medal podium (gold/silver/bronze)
- **Full table**: All users ranked with avatar, name, department, level badge, reputation, points, missions completed, completion rate

---

## 11. Component Library

### Layout Components

| Component | File | Purpose |
|-----------|------|---------|
| `Header` | `components/layout/Header.tsx` | Navigation bar, persona switcher dropdown, "New Mission" button, points display |
| `ClientProvider` | `components/layout/ClientProvider.tsx` | Hydration guard — delays render until client state matches |

### Mission Components

| Component | File | Purpose |
|-----------|------|---------|
| `MissionCard` | `components/missions/MissionCard.tsx` | Card preview with urgency signals (red/amber borders), hot badge (2+ applicants), high-value banner (3000+ pts) |
| `MissionLifecycle` | `components/missions/MissionLifecycle.tsx` | 4-step horizontal progress indicator showing mission state |
| `PricingCalculator` | `components/missions/PricingCalculator.tsx` | Live reward breakdown showing formula result, solver/validator/creator splits |

### UI Components

| Component | File | Purpose |
|-----------|------|---------|
| `ToastContainer` | `components/ui/Toast.tsx` | Notification system with success/error/info variants, 4s auto-dismiss, slide-in animation |

### Utility Functions (`src/lib/utils.ts`)

| Function | Purpose |
|----------|---------|
| `cn(...classes)` | Conditional class name joiner (filters falsy values) |
| `formatDate(str)` | "Mar 29, 2026" format |
| `formatDateTime(str)` | "Mar 29, 2:45 PM" format |
| `formatPoints(n)` | Human-readable: 2500 → "2.5k" |
| `daysUntil(str)` | Days remaining to deadline |
| `getInitials(name)` | "Ana Torres" → "AT" for avatar circles |
| `categoryConfig` | Maps category → label, text color, background color |
| `statusConfig` | Maps status → label, text color, background color, dot color |

---

## 12. Seed Data & Demo Personas

### Personas

The MVP ships with 5 personas representing different archetypes in the marketplace:

| # | Name | Role | Title | Level | Reputation | Points | Archetype |
|---|------|------|-------|-------|------------|--------|-----------|
| 1 | **Ana Torres** | Creator, Curator | Product Strategy Lead | Master (Lv.4) | 6,200 | 3,500 | The mission poster — creates challenges for others to solve |
| 2 | **Marcus Chen** | Solver | Senior Software Engineer | Expert (Lv.3) | 4,800 | 5,200 | The top contributor — solves technical missions |
| 3 | **Priya Sharma** | Validator, Solver | Technical Lead | Master (Lv.4) | 7,500 | 4,100 | The quality gatekeeper — reviews and validates work |
| 4 | **Jordan Blake** | Curator, Creator | Innovation Program Manager | Expert (Lv.3) | 3,100 | 2,800 | The program orchestrator — curates and categorizes |
| 5 | **Leila Okonkwo** | Solver | Junior Data Analyst | Contributor (Lv.2) | 820 | 680 | The rising newcomer — building reputation from scratch |

Each persona has a distinct set of skills, reputation distribution, badges, and mission history.

### Seed Missions

| ID | Title | Category | Status | Reward | Solver |
|----|-------|----------|--------|--------|--------|
| m1 | Build Real-Time Product Metrics Dashboard | Strategic | In Progress | 4,330 pts | Marcus Chen |
| m2 | Automate Monthly Regulatory Compliance Reports | Operational | Open | 2,900 pts | — |
| m3 | Prototype AI-Powered Internal Knowledge Search | Exploratory | Open | 2,352 pts | — (1 applicant) |
| m4 | Redesign Employee Onboarding Checklist | Operational | Under Review | 890 pts | Leila Okonkwo |
| m5 | Q2 Strategic Planning Data Package | Strategic | Completed | 2,500 pts | Marcus Chen |
| m6 | Internal API Rate Limiting and Monitoring | Strategic | Open (Auction) | 3,900 pts | — |

This seed data covers all mission statuses and demonstrates different reward models (fixed, auction).

### Available Skills (20)

TypeScript, React, Python, SQL, Go, Cloud Architecture, Machine Learning, Data Analysis, Data Visualization, DevOps, System Design, Security, Product Strategy, OKR Design, User Research, Stakeholder Management, Program Management, Innovation Frameworks, Statistics, Code Review

### Badges (6)

| Badge | Icon | Description |
|-------|------|-------------|
| First Mission | Target | Completed your first mission |
| Rapid Delivery | Lightning | Delivered 3 missions ahead of schedule |
| Bridge Builder | Bridge | Collaborated across 3+ departments |
| Quality Star | Star | Received 5 perfect validation scores |
| Mentor | Teacher | Helped 3 junior members complete missions |
| High Stakes | Diamond | Completed a mission worth 5000+ points |

---

## 13. State Management & Persistence

### Zustand Store

The application uses a single Zustand store (`src/lib/store.ts`) with the `persist` middleware for `localStorage` persistence.

**State shape:**
```typescript
interface MarketplaceState {
  currentUserId: string;
  users: User[];
  missions: Mission[];
  transactions: PointTransaction[];
  // ... actions
}
```

**Key actions and their effects:**

| Action | Inputs | Side Effects |
|--------|--------|-------------|
| `setCurrentUser` | userId | Updates active persona |
| `createMission` | Mission data | Calculates dynamic reward, adds to missions array, creates activity log entry |
| `applyToMission` | missionId, proposal | Adds application to mission's applicants array, logs activity |
| `assignSolver` | missionId, solverId | Sets solver + auto-assigns validator, transitions to `in_progress` |
| `submitWork` | missionId | Transitions to `under_review`, records submission timestamp |
| `approveWork` | missionId, feedback | Transitions to `completed`, creates point transactions for solver/validator/creator, updates reputation scores |
| `requestRevision` | missionId, feedback | Transitions to `revision_requested`, logs feedback |
| `rejectWork` | missionId, feedback | Resets to `open`, clears solver/validator assignments |
| `resetData` | — | Restores all state to seed values |

**Persistence**: State is serialized to `localStorage` under the key `mission-marketplace`. The `ClientProvider` component prevents hydration mismatches by delaying render until the client-side state has loaded.

### Toast Store

A separate Zustand store (non-persisted) in `components/ui/Toast.tsx` manages ephemeral notifications.

---

## 14. Known Limitations & Technical Debt

### Functional Limitations

1. **No real authentication** — Persona switching simulates multi-user but has no access control
2. **No backend or API** — All data lives in localStorage; there's no server, database, or REST/GraphQL layer
3. **No real-time updates** — No WebSockets or polling; state only updates on direct action
4. **Auction/Lottery models are UI-only** — The reward model dropdown exists but only "fixed" pricing is functionally implemented
5. **Curator role is placeholder** — Curators appear in the persona list but have no unique functionality
6. **No file uploads** — Solvers can "submit work" but can't attach deliverables
7. **Validator auto-assignment is naive** — Picks the first user with a 'validator' role, not based on skills or workload

### Technical Debt

1. **iCloud Drive git issues** — The project lives in iCloud Drive, causing `pack-objects` crashes during git push. The workaround is copying to `/tmp` before pushing.
2. **No tests** — Zero unit, integration, or e2e tests
3. **No error boundaries** — React errors will crash the full page
4. **Tailwind v4 CSS variables** — Using `@import "tailwindcss"` (v4 syntax), which may have IDE support gaps
5. **`cn()` utility is simplified** — Not using `clsx` + `tailwind-merge`; conflicting Tailwind classes may not be properly resolved
6. **Points economy is inflationary** — Points are created but never destroyed; long-running demos will accumulate unbounded point totals

---

## 15. Future Roadmap

Based on the whitepaper's implementation roadmap (Chapter 7) and the CEO critique findings:

### Phase 1: Production Foundation
- [ ] Backend API (Node.js/Python) with PostgreSQL
- [ ] Real authentication (SSO/OAuth2)
- [ ] User registration and role management
- [ ] File upload for work submissions
- [ ] Email/Slack notifications

### Phase 2: Marketplace Maturity
- [ ] Auction model implementation (competitive bidding)
- [ ] Lottery model implementation (weighted random selection)
- [ ] Mission approval workflow (governance board review before posting)
- [ ] Spending limits and budget controls
- [ ] Skill-based validator matching
- [ ] Reputation decay over time (per whitepaper Ch. 2)

### Phase 3: Enterprise Integration
- [ ] OKR alignment (link missions to strategic objectives)
- [ ] HRIS integration (org chart, departments, reporting lines)
- [ ] Analytics dashboard for leadership
- [ ] Anti-gaming mechanisms (Sybil detection, collusion prevention)
- [ ] IP and data governance policies

### Phase 4: AI Enhancement
- [ ] AI-powered mission decomposition (break large challenges into sub-missions)
- [ ] Skill-to-mission matching recommendations
- [ ] Auto-pricing based on historical completion data
- [ ] AI-assisted code/work review

---

## 16. File Structure

```
mission-marketplace-mvp/
├── .claude/
│   └── launch.json                    # Dev server configuration
├── docs/
│   └── MVP-PRODUCT-DOCUMENT.md        # This document
├── public/
│   ├── file.svg, globe.svg, next.svg  # Default Next.js assets
│   ├── vercel.svg, window.svg
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── globals.css                # Tailwind imports, custom scrollbar
│   │   ├── layout.tsx                 # Root layout (Header + ClientProvider + Toast)
│   │   ├── page.tsx                   # Dashboard (~190 lines)
│   │   ├── favicon.ico
│   │   ├── missions/
│   │   │   ├── page.tsx               # Mission catalog with filters (~125 lines)
│   │   │   ├── new/
│   │   │   │   └── page.tsx           # Create mission form (~304 lines)
│   │   │   └── [id]/
│   │   │       └── page.tsx           # Mission detail + actions (~450 lines)
│   │   ├── profile/
│   │   │   └── page.tsx               # User profile (~219 lines)
│   │   └── leaderboard/
│   │       └── page.tsx               # Rankings & podium (~145 lines)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx             # Nav bar + persona switcher (~150 lines)
│   │   │   └── ClientProvider.tsx     # Hydration guard (~27 lines)
│   │   ├── missions/
│   │   │   ├── MissionCard.tsx        # Card with urgency signals (~99 lines)
│   │   │   ├── MissionLifecycle.tsx   # 4-step progress bar (~54 lines)
│   │   │   └── PricingCalculator.tsx  # Live reward preview (~65 lines)
│   │   └── ui/
│   │       └── Toast.tsx              # Notification system (~77 lines)
│   └── lib/
│       ├── types.ts                   # TypeScript interfaces (~92 lines)
│       ├── pricing.ts                 # Dynamic pricing algorithm (~65 lines)
│       ├── data.ts                    # Seed data: users, missions, skills (~342 lines)
│       ├── store.ts                   # Zustand store + actions (~254 lines)
│       └── utils.ts                   # Formatting helpers (~43 lines)
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
├── CLAUDE.md
├── AGENTS.md
└── README.md
```

**Total source code:** ~36 files, ~2,400 lines of application code (excluding config and generated files).

---

## 17. Running the Application

### Prerequisites
- Node.js 18+ (recommended 20+)
- npm 9+

### Install & Run

```bash
git clone https://github.com/itocazo/mission-marketplace-mvp.git
cd mission-marketplace-mvp
npm install
npm run dev
```

Open **http://localhost:3000** in your browser.

### Demo Walkthrough

1. **Dashboard** loads as Ana Torres (Creator). Note the role-specific subtitle and action prompts.
2. **Switch persona** using the dropdown in the top-right corner. Try Marcus Chen (Solver) to see different CTAs.
3. **Browse missions** at `/missions`. Filter by status or category. Note urgency signals on cards.
4. **Open a mission** (e.g., "Automate Monthly Regulatory Compliance Reports"). As Marcus, apply with a proposal.
5. **Switch to Ana Torres** (Creator). Open the mission and select Marcus as solver.
6. **Switch back to Marcus**. Open the mission and submit work.
7. **Switch to Priya Sharma** (Validator). Open the mission and approve the work. Watch the toast confirm point distribution.
8. **Check the leaderboard** to see updated rankings.
9. **Check Marcus's profile** to see earned points and reputation changes.
10. **Reset demo data** from the persona dropdown to start fresh.

### Build for Production

```bash
npm run build
npm start
```

---

*This document was generated on March 29, 2026, for the Mission Marketplace MVP v1.0.*
