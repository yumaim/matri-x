# Admin Dashboard Evaluation — matri-x

**Date:** 2026-02-12  
**Evaluator:** Subagent (matri-x-admin-eval)

---

## 🔒 Security — Score: 6.5 / 10

### What's Done Well

| # | Area | Assessment |
|---|------|------------|
| 1 | **Admin route protection** | ✅ **Dual-layer** — Middleware (`auth.config.ts`) checks `role === "ADMIN"` at the edge for both `/admin` and `/api/admin` routes. API routes additionally call `requireAdmin()` which does a **real-time DB lookup** to verify the role. This is solid defence-in-depth. |
| 4 | **SQL injection** | ✅ All database access goes through Prisma with parameterised queries. No raw SQL except `SELECT 1` in health check. No injection risk. |
| 5 | **Privilege escalation** | ✅ `requireAdmin()` verifies role from DB on every API call. A user who manually POSTs to `/api/admin/users` with a crafted body will be rejected at the `requireAdmin()` gate. The JWT `role` claim is refreshed from DB on every token rotation. |
| 6 | **Self-protection** | ✅ Self-ban is blocked (`userId === session.user.id`). Last-admin demotion is blocked (checks `adminCount <= 1`). |
| 9 | **JWT / session security** | ✅ JWT `role` is refreshed from DB in the `jwt` callback. `requireAdmin()` also re-checks DB. Banned users are blocked at sign-in. |

### Issues Found

| Priority | Area | Detail |
|----------|------|--------|
| 🔴 CRITICAL | **No CSRF protection** | All admin mutations (`PUT /api/admin/users`, `PUT /api/admin/tickets`, `POST /api/admin/updates`) accept plain JSON with no CSRF token. Next.js does **not** include CSRF protection by default for API routes. An attacker could craft a page that submits a `fetch()` to these endpoints while an admin is logged in (same-site cookies may mitigate if `SameSite=Lax`, but any same-origin XSS bypasses this entirely). |
| 🔴 CRITICAL | **No rate limiting** | Admin endpoints have zero rate limiting. A compromised admin session or brute-force attack could ban all users, change all roles, or spam algorithm updates with no throttle. |
| 🟠 HIGH | **No audit logging** | No admin action is logged anywhere — not to DB, not to a file, not to an external service. There is zero forensic trail. If an admin bans users, changes plans, or demotes other admins, there is no record of who did what and when. |
| 🟠 HIGH | **Sensitive data in responses** | The `/api/admin/stats` endpoint returns user **emails** in `recentSignups`. The `/api/admin/users` endpoint returns emails for all users. These are shown in client-side UI. While admin-only, if the admin's browser is compromised or the responses are cached, this is PII exposure. Consider at minimum not returning full emails (mask them or return only when needed). |
| 🟡 MEDIUM | **Client-side admin guard is cosmetic** | `app/admin/layout.tsx` checks admin status via `fetch("/api/users/me")` and redirects non-admins. This is a UX guard only — the actual page HTML ships to the browser first. The server-side middleware is the real gate, but the layout renders a loading spinner and then children before the client check resolves, briefly exposing admin UI markup (even if data is empty). Consider using a **server component** or `getServerSession` for the layout guard. |
| 🟡 MEDIUM | **Self-role-change not blocked** | An admin can change their own role to USER via the role dropdown (the only block is on the *last* admin). While self-ban is blocked, self-demotion is not explicitly prevented. An admin could accidentally demote themselves. |
| 🟡 MEDIUM | **No input sanitisation on admin notes** | `adminNote` (up to 2000 chars) and `bannedReason` (up to 500 chars) are stored and rendered as raw text. If rendered with `dangerouslySetInnerHTML` elsewhere (or in email notifications), this is an XSS vector. Currently rendered as text content, which is safe in React, but any future rendering change is risky. |
| 🟢 LOW | **`status` param not validated in tickets GET** | `searchParams.get("status")` is passed directly to Prisma `where` without Zod validation. Prisma will error on invalid enum values, but the error leaks internal info. |

### Security Score Breakdown

- Admin route protection: 9/10
- CSRF protection: 2/10 (essentially absent)
- Input validation: 7/10 (Zod on mutations, missing on some GETs)
- SQL injection: 10/10 (Prisma throughout)
- Privilege escalation: 8/10 (DB-level checks, but self-demotion gap)
- Self-protection: 7/10 (self-ban blocked, last-admin blocked, self-demote not blocked)
- Rate limiting: 1/10 (absent)
- Audit logging: 1/10 (absent)
- JWT security: 8/10 (role refresh from DB is correct)
- Data exposure: 5/10 (full emails exposed in API responses)

---

## 💻 Code Quality — Score: 7 / 10

### What's Done Well

| Area | Assessment |
|------|------------|
| **TypeScript types** | Interfaces are defined for all data structures (`Stats`, `UserRow`, `Ticket`, `TeamMember`, `HealthData`). No `any` types found in the admin code. `Record<string, unknown>` is used for dynamic update payloads, which is acceptable. |
| **Zod validation** | Mutation endpoints use Zod schemas (`updateUserSchema`, `updateTicketSchema`, `createUpdateSchema`). Schema definitions are co-located with route handlers. |
| **Error handling pattern** | Consistent `try/catch` + `handleApiError()` pattern across all API routes. Client-side error states are handled (loading spinners, error messages). |
| **Prisma queries** | Efficient — uses `Promise.all()` for parallel queries in stats. `select` is used to limit returned fields. Pagination is implemented for users. |
| **Component structure** | UI uses a shared component library (`Card`, `Button`, `Badge`, `Input`, `Textarea`). |

### Issues Found

| Priority | Area | Detail |
|----------|------|--------|
| 🟠 HIGH | **Code duplication across admin pages** | Every page follows the same pattern: `useState` for data, `useEffect` + `fetch`, loading spinner, error state. This is repeated 6 times with no shared abstraction. A custom `useAdminData(url)` hook or SWR/React Query would eliminate ~40% of boilerplate. |
| 🟠 HIGH | **`roleBadge()` / `planBadge()` duplicated** | Badge rendering logic for roles appears in both `users/page.tsx` and `team/page.tsx` with slight variations. Should be a shared component. |
| 🟡 MEDIUM | **Team page fetches ALL users** | `team/page.tsx` fetches `/api/admin/users?search=` (empty search = all users) then filters client-side. For a system with thousands of users, this loads the entire first page and filters admins/mods only from the first 20. This is both **incorrect** (misses admins on later pages) and **inefficient**. Needs a dedicated query or filter param. |
| 🟡 MEDIUM | **Silent error swallowing** | Multiple `catch { /* */ }` blocks silently swallow errors with no logging, no user feedback. The tickets page and health page both do this. Users get a stuck loading state with no explanation. |
| 🟡 MEDIUM | **`handleAction` uses `alert()` and `prompt()`** | Browser-native `alert()` and `prompt()` are used for error display and BAN reason input in `users/page.tsx`. These are blocking, inaccessible, and inconsistent with the app's UI language. |
| 🟢 LOW | **No debounce on search** | The user search in `users/page.tsx` fires a fetch on every keystroke (`onChange` triggers state update → `useEffect` fires). Should debounce by 300-500ms. |
| 🟢 LOW | **Inconsistent API response shapes** | Some endpoints return `{ users, total, page, totalPages }`, others return `{ tickets }`, others return flat objects. No standard envelope. |
| 🟢 LOW | **Magic numbers** | `take: 50` in tickets, `take: 20` in users, `take: 10` in recent signups — all hardcoded without named constants. |

### Code Quality Score Breakdown

- TypeScript types: 8/10
- Error handling: 6/10 (pattern exists but silently swallowed in many places)
- Code duplication: 5/10 (significant repetition)
- Component reusability: 6/10 (shared UI components, but admin-specific logic duplicated)
- API response consistency: 6/10
- Prisma efficiency: 7/10 (team page bug, but otherwise good)
- Client state management: 6/10 (raw useState, no data-fetching library)
- Loading/error states: 7/10 (present but inconsistent)

---

## 👤 Admin UX & Missing Features — Score: 5.5 / 10

### Current Feature Set Assessment

The admin panel covers the **basics**: user management, ticket handling, algorithm updates, health monitoring, and team management. For an MVP / early-stage product, this is adequate. For production with real users, significant gaps exist.

### What's Done Well

| Area | Assessment |
|------|------------|
| **User management** | Search, pagination, ban/unban with reason, role change, plan change — core functions are covered. |
| **Ticket management** | Filter by status, reply with admin notes, status transitions, user notification on update — functional workflow. |
| **Health monitoring** | DB latency, memory usage, uptime, runtime info — good basic observability. |
| **Mobile responsiveness** | Layout has responsive sidebar (collapses to hamburger on mobile). Cards use responsive grid (`grid-cols-2 sm:grid-cols-4`). Adequate for occasional mobile use. |
| **Algorithm updates** | Impact level selection, title/description/source/category — well-designed creation form with clear UX. |

### Critical Missing Features

| Priority | Feature | Impact | Implementation Notes |
|----------|---------|--------|---------------------|
| 🔴 CRITICAL | **Audit / Activity Log** | Zero visibility into admin actions. Cannot investigate abuse, accidents, or compliance questions. | Create an `AdminAuditLog` model (`actorId, action, targetId, targetType, details, timestamp`). Write to it in every `PUT`/`POST` admin endpoint. Add a `/admin/audit` page with filters by actor, action type, date range. |
| 🔴 CRITICAL | **Confirmation dialogs** | Destructive actions (BAN, role change, plan change) execute immediately with no confirmation (or use browser `prompt()` for BAN reason only). Accidental clicks have irreversible consequences. | Replace `prompt()` and add a modal confirmation dialog component. Require explicit confirmation for BAN, role demotion, and plan downgrade. |
| 🟠 HIGH | **User detail view** | No way to click a user and see their full profile, activity history, posts, comments, tickets, login history. Admin must mentally map between user list and other pages. | Add `/admin/users/[id]` page with tabbed view: overview, posts, comments, tickets, audit trail. |
| 🟠 HIGH | **Data export** | No CSV/JSON export for users, tickets, or analytics. Required for reporting, compliance, and migration. | Add export buttons that call API endpoints returning `Content-Disposition: attachment` responses. For large datasets, generate async and provide download link. |
| 🟠 HIGH | **Notification management** | Updates page is create-only. Cannot view, edit, or delete previously sent notifications/updates. No history. | Add a GET endpoint for algorithm updates with pagination. Display list below the creation form. Add delete/archive functionality. |
| 🟠 HIGH | **Dashboard analytics depth** | Overview shows only flat counts. No trends, graphs, time-series, or growth metrics. Cannot answer "are we growing?" or "is engagement up?" | Add time-series data (signups per day/week, posts per day). Use a charting library (recharts, chart.js). Show 7-day and 30-day trends with deltas. |
| 🟡 MEDIUM | **Bulk actions** | Cannot ban multiple users, change plans in bulk, or close multiple tickets at once. Every action is one-at-a-time. | Add checkbox selection to user/ticket lists. Add bulk action bar that appears when items are selected. API endpoints should accept arrays of IDs. |
| 🟡 MEDIUM | **Ticket search** | Tickets can only be filtered by status. No search by title, description, user, or category. No pagination (hardcoded `take: 50`). | Add text search and category filter. Add pagination matching user management pattern. |
| 🟡 MEDIUM | **Filter persistence** | Filters and search terms are lost on page navigation and refresh. | Store filter state in URL search params (Next.js `useSearchParams`). |
| 🟡 MEDIUM | **Team page data bug** | Team page fetches first page of ALL users (max 20) and filters client-side. If admins/mods are not in the first 20, they won't appear. | Add `?role=ADMIN,MODERATOR` filter to the API, or create a dedicated team endpoint. |
| 🟢 LOW | **Keyboard shortcuts** | No keyboard navigation for common actions (next/prev page, search focus, etc.) | Add `useHotkeys` or native keyboard event listeners for power-user efficiency. |
| 🟢 LOW | **Dark/light mode toggle** | Admin panel inherits app theme but no local toggle. Admins working long hours may want to switch. | Add theme toggle in sidebar footer. |
| 🟢 LOW | **Empty state improvements** | Empty states show plain text ("チケットがありません"). No illustrations or guidance. | Add illustrated empty states with actionable guidance. |

### UX Score Breakdown

- Feature sufficiency for production: 5/10
- Missing critical features: 4/10 (many gaps)
- Mobile responsiveness: 7/10
- Data export: 1/10 (absent)
- Search/filter completeness: 5/10 (users good, tickets partial)
- Bulk actions: 1/10 (absent)
- Audit log: 1/10 (absent)
- Analytics depth: 4/10 (flat counts only)
- User detail view: 1/10 (absent)
- Notification management: 3/10 (create-only)

---

## 📋 Prioritised Issue List

### 🔴 CRITICAL

1. **No CSRF protection on admin mutations** — Any same-origin XSS or crafted page can trigger admin actions
2. **No rate limiting on admin endpoints** — Zero throttling on destructive operations
3. **No audit logging** — No forensic trail for any admin action
4. **No confirmation dialogs for destructive actions** — One-click BAN/role changes with no undo

### 🟠 HIGH

5. **No user detail view** — Cannot inspect individual user's full activity
6. **No data export capability** — Cannot export users, tickets, or analytics
7. **No notification/update history** — Create-only, cannot view or manage sent updates
8. **Dashboard lacks analytics depth** — Flat counts, no trends or graphs
9. **Sensitive data (emails) exposed in API responses** — PII exposure risk
10. **Team page fetches incorrect data** — Client-side filtering of paginated results misses team members
11. **Significant code duplication** — Every admin page repeats the same fetch/state/loading pattern

### 🟡 MEDIUM

12. **Client-side admin guard is cosmetic** — Layout should use server-side session check
13. **Silent error swallowing** — Multiple `catch {}` blocks with no feedback
14. **No bulk actions** — Every operation is one-at-a-time
15. **Ticket search/pagination incomplete** — Status-only filter, hardcoded 50-item limit
16. **Browser `alert()`/`prompt()` used** — Breaks UI consistency, blocks thread
17. **Self-demotion not prevented** — Admin can accidentally remove their own admin role
18. **No search debouncing** — User search fires on every keystroke
19. **Filter state not persisted in URL** — Lost on navigation

### 🟢 LOW

20. **Status query param not validated** — Tickets GET accepts arbitrary status strings
21. **Inconsistent API response formats** — No standard envelope
22. **Magic numbers** — Pagination limits hardcoded throughout
23. **No keyboard shortcuts**
24. **No illustrated empty states**

---

## 🎯 Recommended Implementation Priority

### Phase 1: Security Hardening (Week 1)
1. Add CSRF tokens (NextAuth CSRF or custom `x-csrf-token` header with cookie validation)
2. Implement rate limiting (use `@upstash/ratelimit` or in-memory LRU for admin endpoints)
3. Add audit log model + write middleware
4. Mask emails in API responses (or add `?includeEmail=true` flag)

### Phase 2: UX Critical Fixes (Week 2)
5. Add confirmation dialog component (replace `alert()`/`prompt()`)
6. Fix team page data fetching (add role filter to API)
7. Create `useAdminFetch()` custom hook to eliminate duplication
8. Add search debouncing

### Phase 3: Feature Gaps (Weeks 3-4)
9. User detail page (`/admin/users/[id]`)
10. Notification/update history view
11. Dashboard charts (signups over time, engagement trends)
12. CSV export for users and tickets
13. Ticket search + pagination
14. Bulk actions (ban multiple, close multiple tickets)

### Phase 4: Polish (Week 5+)
15. Server-side layout guard
16. URL-persisted filters
17. Keyboard shortcuts
18. Standardize API response format
19. Named constants for pagination limits

---

## Overall Score: 6.3 / 10

| Category | Score | Weight | Weighted |
|----------|-------|--------|----------|
| 🔒 Security | 6.5/10 | 40% | 2.60 |
| 💻 Code Quality | 7.0/10 | 30% | 2.10 |
| 👤 UX & Features | 5.5/10 | 30% | 1.65 |
| **Overall** | | | **6.35** |

### Summary

The admin dashboard has a **solid foundation** — dual-layer auth, Prisma with parameterised queries, Zod validation on mutations, and a clean UI structure. The biggest weaknesses are in **security operations** (no CSRF, no rate limiting, no audit trail) and **feature completeness** (no user detail view, no data export, no analytics depth, no bulk actions). The codebase is well-typed but suffers from repetitive patterns that a shared data-fetching hook would solve.

For an **MVP**, this is a good starting point. For **production** with real users and potential regulatory requirements, the CRITICAL items (CSRF, rate limiting, audit logging) must be addressed before launch.
