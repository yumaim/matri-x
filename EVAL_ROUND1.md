# Matri-X Round 1 Feature Evaluation Report

**Evaluator:** Automated UI/UX Code Review  
**Date:** 2026-02-11  
**Scope:** 5 newly implemented features (notification system, dev tickets, comment vote, forum author sidebar, header avatar)

---

## Summary Scores

| # | Feature | Score | Critical | High | Medium | Low |
|---|---------|-------|----------|------|--------|-----|
| 1 | Notification System | 7/10 | 0 | 2 | 3 | 2 |
| 2 | Development Tickets Page | 7.5/10 | 0 | 1 | 3 | 2 |
| 3 | Comment Vote | 8/10 | 0 | 1 | 2 | 1 |
| 4 | Forum Author Sidebar | 7/10 | 1 | 1 | 2 | 1 |
| 5 | Header Avatar | 7.5/10 | 0 | 1 | 2 | 1 |
| | **Overall** | **7.4/10** | **1** | **6** | **12** | **7** |

---

## Feature 1: Notification System

**Files reviewed:**
- `lib/notifications.ts`
- `app/api/notifications/route.ts`
- `app/dashboard/layout.tsx` (NotificationBell component, lines ~61–170)
- `app/api/forum/posts/[id]/comments/route.ts` (notification integration)
- `app/api/forum/posts/[id]/vote/route.ts` (notification integration)

### Score: 7/10

### Issues Found

#### HIGH-1: `notifyAlgorithmUpdate` fetches ALL users without pagination
- **Severity:** HIGH
- **File:** `lib/notifications.ts`, lines 104–119
- **Description:** `prisma.user.findMany({ select: { id: true } })` loads every single user into memory. `createMany` then generates an equally large array. With 10k+ users this will OOM or hit database insert limits.
- **Fix:** Batch in chunks of 500–1000 using `prisma.user.findMany({ take: 1000, skip: offset })` in a loop, and use `createMany` per batch.

#### HIGH-2: Notifications are never marked read on click
- **Severity:** HIGH
- **File:** `app/dashboard/layout.tsx`, lines ~140–165
- **Description:** Clicking a notification navigates to its link and closes the popover, but never calls `PUT /api/notifications` with that notification's ID. The only way to clear unread state is the "すべて既読" button.
- **Fix:** Add an `onClick` handler on each notification `<Link>` that also sends a PUT request to mark that single notification as read:
  ```ts
  onClick={() => {
    setOpen(false);
    fetch("/api/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationIds: [n.id] }),
    });
  }}
  ```

#### MEDIUM-1: PUT endpoint accepts arbitrary `notificationIds` without type validation
- **Severity:** MEDIUM
- **File:** `app/api/notifications/route.ts`, lines 27–42
- **Description:** The body is parsed with `request.json()` but `notificationIds` is only checked via `Array.isArray()`. Array elements are not validated as strings — an attacker could pass objects or numbers. Although the `userId` filter prevents cross-user mutation, malformed IDs would cause unnecessary DB queries.
- **Fix:** Add Zod validation:
  ```ts
  const schema = z.object({
    notificationIds: z.array(z.string()).optional(),
    markAll: z.boolean().optional(),
  });
  ```

#### MEDIUM-2: No pagination in GET endpoint
- **Severity:** MEDIUM
- **File:** `app/api/notifications/route.ts`, lines 8–16
- **Description:** `take: 50` is hardcoded. No cursor or page param means older notifications are inaccessible. The client also has no "load more" capability.
- **Fix:** Add cursor-based pagination with a `before` query parameter.

#### MEDIUM-3: 30-second polling interval is aggressive
- **Severity:** MEDIUM
- **File:** `app/dashboard/layout.tsx`, line 100
- **Description:** `setInterval(fetchNotifications, 30000)` fires for every connected user every 30 seconds, even when the tab is idle/backgrounded. This creates significant load at scale.
- **Fix:** Use `document.visibilityState` to pause polling when the tab is hidden; consider increasing interval to 60s or using Server-Sent Events / WebSocket.

#### LOW-1: Notification message is not length-capped server-side
- **Severity:** LOW
- **File:** `lib/notifications.ts`, lines 43, 92
- **Description:** Post titles are sliced to 30 chars, but the overall `message` string (which includes `commentAuthorName`) has no max length. A user with a very long display name could produce unexpectedly long messages.
- **Fix:** Truncate the full message to 200 chars before insertion.

#### LOW-2: Empty `catch` in NotificationBell
- **Severity:** LOW
- **File:** `app/dashboard/layout.tsx`, lines 96, 111
- **Description:** Both `fetchNotifications` and `markAllRead` silently swallow errors with `/* ignore */`. Network failures are invisible to the user.
- **Fix:** At minimum log to console; optionally show a subtle toast for mark-all failures.

---

## Feature 2: Development Tickets Page

**Files reviewed:**
- `app/dashboard/tickets/page.tsx`
- `app/api/tickets/route.ts`

### Score: 7.5/10

### Issues Found

#### HIGH-1: No rate limiting on ticket creation
- **Severity:** HIGH
- **File:** `app/api/tickets/route.ts`, POST handler (lines 29–65)
- **Description:** Unlike the comment endpoint which uses `checkRateLimit`, ticket creation has no rate limit. A malicious user could spam hundreds of tickets and flood admin notifications.
- **Fix:** Add `checkRateLimit(`ticket:${session.user.id}`, 5, 300000)` (5 tickets per 5 minutes) before processing.

#### MEDIUM-1: Ticket list has no pagination
- **Severity:** MEDIUM
- **File:** `app/api/tickets/route.ts`, GET handler (lines 14–23)
- **Description:** `findMany` returns ALL tickets for the user with no limit. A power user with hundreds of tickets will experience slow page loads.
- **Fix:** Add `take: 50` and implement cursor-based pagination with a "load more" button on the client.

#### MEDIUM-2: Mobile header truncation on small screens
- **Severity:** MEDIUM
- **File:** `app/dashboard/tickets/page.tsx`, lines 67–77
- **Description:** The page header uses `flex items-center justify-between` with the title and button on the same row. On screens < 360px, the "チケット作成" button text may wrap or get squeezed against the title. The button has no `shrink-0`.
- **Fix:** Add `shrink-0` to the Button, or switch to a stacked layout on very small screens:
  ```tsx
  <div className="flex items-center justify-between flex-wrap gap-2">
  ```

#### MEDIUM-3: Category buttons have small touch targets on mobile
- **Severity:** MEDIUM
- **File:** `app/dashboard/tickets/page.tsx`, lines 95–113
- **Description:** Category selector buttons are `p-3` (12px padding) in a 2-column grid. On mobile the total clickable area is adequate but the visual indicator area is quite small, and the emoji + text vertical stack could clip with certain font sizes.
- **Fix:** Increase to `p-4` minimum and add `min-h-[60px]` to ensure consistent touch target sizing per WCAG 2.5.8 (44×44px minimum).

#### LOW-1: `fetchTickets` is not wrapped in `useCallback`
- **Severity:** LOW
- **File:** `app/dashboard/tickets/page.tsx`, lines 51–60
- **Description:** `fetchTickets` is defined as a bare async function and called in `useEffect` without being listed as a dependency. While it works because `useEffect` has `[]` deps, it's an ESLint warning waiting to happen and prevents reuse in dependency arrays.
- **Fix:** Wrap in `useCallback`.

#### LOW-2: Success toast auto-dismisses but has no dismiss button
- **Severity:** LOW
- **File:** `app/dashboard/tickets/page.tsx`, lines 78–80
- **Description:** The success message auto-hides after 3 seconds via `setTimeout`. There's no way for the user to manually dismiss it, and it's not an accessible toast (no `role="status"` or `aria-live`).
- **Fix:** Add `role="status"` and `aria-live="polite"` to the success div, and optionally add a close button.

---

## Feature 3: Comment Vote

**Files reviewed:**
- `app/api/forum/comments/[commentId]/vote/route.ts`
- `components/forum/vote-button.tsx`
- `components/forum/comment-section.tsx` (integration)

### Score: 8/10

### Issues Found

#### HIGH-1: No rate limiting on comment vote endpoint
- **Severity:** HIGH
- **File:** `app/api/forum/comments/[commentId]/vote/route.ts`
- **Description:** The post vote endpoint and comment creation endpoint both have rate limiting (or should), but the comment vote endpoint has none. A script could rapidly toggle votes to generate DB churn. The post vote endpoint (`app/api/forum/posts/[id]/vote/route.ts`) imports `checkRateLimit` but never calls it either.
- **Fix:** Add at the top of the handler:
  ```ts
  const { allowed } = checkRateLimit(`comment-vote:${session.user.id}`, 60, 60000);
  if (!allowed) {
    return NextResponse.json({ error: "リクエストが多すぎます" }, { status: 429 });
  }
  ```

#### MEDIUM-1: VoteButton lacks aria-labels
- **Severity:** MEDIUM
- **File:** `components/forum/vote-button.tsx`, lines 75–88, 102–115
- **Description:** The upvote and downvote buttons have no `aria-label`. Screen readers will only announce "button" with no context. The score `<span>` also has no `aria-label`.
- **Fix:** Add labels:
  ```tsx
  <Button aria-label={`賛成${userVote === 1 ? "（投票済み）" : ""}`} ...>
  <span aria-label={`スコア: ${score}`} ...>
  <Button aria-label={`反対${userVote === -1 ? "（投票済み）" : ""}`} ...>
  ```

#### MEDIUM-2: Optimistic update can cause brief visual flicker on slow networks
- **Severity:** MEDIUM
- **File:** `components/forum/vote-button.tsx`, lines 30–50
- **Description:** The component applies an optimistic update immediately, then replaces with server data on success. If the server response differs from the optimistic prediction (e.g., due to race condition where another user voted simultaneously), the score will visually jump. This is inherent to optimistic updates but could be smoothed.
- **Fix:** Consider adding a `transition` CSS animation on the score number to smooth visual changes, or suppress server override when the diff is within expected range.

#### LOW-1: Delete button in comment section is invisible on mobile (hover-only)
- **Severity:** LOW
- **File:** `components/forum/comment-section.tsx`, line 143
- **Description:** The delete `MoreHorizontal` button uses `opacity-0 group-hover:opacity-100`. On touch devices, there's no hover state, so the button is invisible. Users can still tap the area, but they don't know it's there.
- **Fix:** Add `sm:opacity-0 sm:group-hover:opacity-100` (always visible on mobile) or use a long-press gesture.

---

## Feature 4: Forum Author Sidebar

**Files reviewed:**
- `app/dashboard/forum/[id]/page.tsx`, lines ~711–790

### Score: 7/10

### Issues Found

#### CRITICAL-1: Author website link is vulnerable to `javascript:` protocol XSS
- **Severity:** CRITICAL
- **File:** `app/dashboard/forum/[id]/page.tsx`, lines ~754–763
- **Description:** The website link does:
  ```tsx
  href={post.author.website.startsWith("http") ? post.author.website : `https://${post.author.website}`}
  ```
  If a user stores `javascript:alert(1)` as their website, it starts with `j` not `http`, so it becomes `https://javascript:alert(1)` — which is safe in this specific case. However, `httpjavascript:alert(1)` would match `startsWith("http")` and be used raw, though this particular string is not a valid JS URI.
  
  **The real risk** is `http://evil.com" onclick="alert(1)` — while React escapes attribute values, the broader pattern of trusting user-provided URLs without validation is a security smell. More importantly, `data:text/html,...` URIs starting with `data:` would get prefixed with `https://` which is safe, but the intent should be explicit URL validation.
- **Fix:** Validate with a URL allowlist:
  ```ts
  function safeUrl(url: string): string | null {
    try {
      const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
      if (["http:", "https:"].includes(parsed.protocol)) return parsed.href;
      return null;
    } catch { return null; }
  }
  ```
  Only render the link if `safeUrl` returns non-null.

#### HIGH-1: Sidebar collapses into main content flow on mobile without distinction
- **Severity:** HIGH
- **File:** `app/dashboard/forum/[id]/page.tsx`, lines ~700–710 (grid layout)
- **Description:** The layout uses `grid gap-6 lg:grid-cols-4`. Below `lg` breakpoint (1024px), the sidebar falls below the main content as a single column. On tablets (768–1024px), the author card appears after a long scrolling post and all comments, making it nearly invisible. Users on tablets will rarely discover the author sidebar.
- **Fix:** Consider showing a compact author info bar below the post title on mobile/tablet (duplicating key author info), or moving the sidebar above comments on smaller screens using `order-first` on the sidebar div for `< lg`.

#### MEDIUM-1: Author name link can overflow on long names
- **Severity:** MEDIUM
- **File:** `app/dashboard/forum/[id]/page.tsx`, line ~729
- **Description:** `<Link href={...} className="font-medium text-foreground hover:text-primary transition-colors">` has no `truncate` or `max-w` constraint. A very long author name will push the role badge off-screen.
- **Fix:** Add `truncate max-w-[150px] inline-block` to the Link, or wrap in a container with `min-w-0`.

#### MEDIUM-2: xHandle display does not sanitize the `@` prefix consistently
- **Severity:** MEDIUM
- **File:** `app/dashboard/forum/[id]/page.tsx`, lines ~742–751
- **Description:** The code does `xHandle.replace(/^@/, "")` which is correct for display, but if a user enters `@@handle`, the result is `@handle` and the link goes to `x.com/@handle` which is incorrect (X.com doesn't use `@` in URLs).
- **Fix:** Use a more aggressive strip: `.replace(/^@+/, "")`.

#### LOW-1: Company/community field renders emoji with inconsistent sizing
- **Severity:** LOW
- **File:** `app/dashboard/forum/[id]/page.tsx`, line ~768
- **Description:** `🏢` is used as a raw emoji in a `<span>`. On some platforms/browsers, emoji sizing differs from the surrounding text, causing slight vertical misalignment.
- **Fix:** Wrap in a `<span className="text-sm">` to normalize, or use a Lucide icon like `Building2`.

---

## Feature 5: Header Avatar

**Files reviewed:**
- `app/dashboard/layout.tsx` — Desktop sidebar avatar (lines ~205–235), Mobile header avatar (lines ~260–275)

### Score: 7.5/10

### Issues Found

#### HIGH-1: Duplicate `/api/users/me` fetch — both `SidebarContent` and `DashboardLayout` fetch the same data
- **Severity:** HIGH
- **File:** `app/dashboard/layout.tsx`, lines 177–183 (SidebarContent) and 248–253 (DashboardLayout)
- **Description:** `SidebarContent` fetches `/api/users/me` to get `userName`, `userId`, `userImage`. The parent `DashboardLayout` also fetches `/api/users/me` to get `myUserId`, `myUserImage`, `myUserName`. These are two separate HTTP requests for identical data on every page load.
- **Fix:** Fetch once in `DashboardLayout` and pass the data down to `SidebarContent` as props. Or use a shared React context / SWR cache:
  ```tsx
  // In DashboardLayout
  const [userData, setUserData] = useState(null);
  useEffect(() => { fetch("/api/users/me").then(...).then(d => setUserData(d)); }, []);
  
  // Pass to SidebarContent
  <SidebarContent collapsed={collapsed} pathname={pathname} user={userData} />
  ```

#### MEDIUM-1: Mobile avatar link falls back to `/dashboard/profile` when userId is null
- **Severity:** MEDIUM
- **File:** `app/dashboard/layout.tsx`, line ~264
- **Description:** `href={myUserId ? '/dashboard/users/${myUserId}' : "/dashboard/profile"}`. If the `/api/users/me` fetch is slow or fails, `myUserId` stays null and the avatar links to `/dashboard/profile`. This is a different page than the desktop sidebar's user page link, creating inconsistent behavior.
- **Fix:** Either always link to `/dashboard/profile` (which can redirect to user page), or show a loading skeleton until userId is resolved.

#### MEDIUM-2: Avatar initials logic differs between mobile and desktop
- **Severity:** MEDIUM
- **File:** `app/dashboard/layout.tsx`, lines ~189 vs ~268
- **Description:** 
  - Desktop sidebar: `userName[0]?.toUpperCase() ?? "U"` — takes first character
  - Mobile header: `myUserName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()` — takes first letter of each word (initials)
  
  For a name like "田中太郎", desktop shows "田" while mobile shows "田" (same since no space). But for "John Doe", desktop shows "J" while mobile shows "JD". This is an inconsistency.
- **Fix:** Extract a shared `getInitials(name)` function (one already exists in `forum/[id]/page.tsx`) and use it in both places.

#### LOW-1: No `alt` text on `AvatarImage`
- **Severity:** LOW
- **File:** `app/dashboard/layout.tsx`, lines ~215, ~266
- **Description:** `<AvatarImage src={userImage} />` has no `alt` attribute. Screen readers will either skip it or read the URL.
- **Fix:** Add `alt={userName ?? "ユーザーアバター"}` to both instances.

---

## Cross-Cutting Concerns

### Accessibility (applies to multiple features)

| Issue | Severity | Details |
|-------|----------|---------|
| Missing `aria-label` on vote buttons | MEDIUM | `VoteButton` (Feature 3) has no labels |
| NotificationBell lacks `aria-label` | LOW | The bell button should have `aria-label="通知"` |
| Success/error messages need `role="status"` | LOW | Tickets page success div (Feature 2) |
| Delete menu trigger invisible on touch | LOW | Comment section (Feature 3) |

### Security Summary

| Issue | Severity | Feature |
|-------|----------|---------|
| URL validation for author website | CRITICAL | Feature 4 |
| No rate limit on ticket creation | HIGH | Feature 2 |
| No rate limit on comment/post vote | HIGH | Feature 3 |
| Notification IDs not type-validated | MEDIUM | Feature 1 |

### Mobile Responsiveness Summary

| Issue | Severity | Feature |
|-------|----------|---------|
| Sidebar hidden below comments on tablet | HIGH | Feature 4 |
| Header title/button squeeze on <360px | MEDIUM | Feature 2 |
| Category buttons small touch targets | MEDIUM | Feature 2 |
| Delete button invisible on touch | LOW | Feature 3 |

---

## Recommendations Priority

### Immediate (before next deploy)
1. **Add rate limiting** to ticket creation (`app/api/tickets/route.ts`) and vote endpoints
2. **Add URL validation** for author website links (`app/dashboard/forum/[id]/page.tsx`)
3. **Deduplicate** the `/api/users/me` fetch in layout

### Short-term (next sprint)
4. Mark individual notifications as read on click
5. Add pagination to tickets list and notifications
6. Fix mobile sidebar visibility on tablets
7. Add `aria-label` to all interactive elements (vote buttons, notification bell)

### Nice-to-have
8. Replace polling with SSE/WebSocket for notifications
9. Smooth optimistic update animations on vote
10. Consistent initials logic across components
11. Batch `notifyAlgorithmUpdate` for large user bases

---

*Report generated by automated code review. No code changes were made.*
