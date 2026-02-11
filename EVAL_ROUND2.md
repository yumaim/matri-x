# Matri-X Round 2 Feature Evaluation Report

**Evaluator:** Automated UI/UX Code Review  
**Date:** 2026-02-11  
**Scope:** Verification of Round 1 fixes + new issue discovery  

---

## Part A: Round 1 Fix Verification

### ✅ FIXED Issues

| Round 1 ID | Severity | Description | Status | Notes |
|---|---|---|---|---|
| Feature 2 HIGH-1 | HIGH | No rate limiting on ticket creation | ✅ FIXED | `checkRateLimit("ticket:${session.user.id}", 5, 300000)` added in `app/api/tickets/route.ts` L38–41. Correct: 5 tickets per 5 minutes. |
| Feature 3 HIGH-1 | HIGH | No rate limit on comment vote endpoint | ✅ FIXED | `checkRateLimit("comment-vote:...", 60, 60000)` added in `app/api/forum/comments/[commentId]/vote/route.ts` L18–21. 60 votes per minute — appropriate. |
| Feature 3 HIGH-1 (related) | HIGH | No rate limit on post vote endpoint | ✅ FIXED | `checkRateLimit("post-vote:...", 60, 60000)` added in `app/api/forum/posts/[id]/vote/route.ts` L21–24. Same parameters as comment vote. |
| Feature 4 CRITICAL-1 | CRITICAL | Author website link vulnerable to `javascript:` XSS | ✅ FIXED | `app/dashboard/forum/[id]/page.tsx` L742–756 now uses `new URL()` constructor with protocol allowlist (`http:`, `https:` only). Wrapped in try-catch, returns `null` on invalid URL. Correct implementation. |
| Feature 4 MEDIUM-2 | MEDIUM | xHandle `@` prefix not stripped aggressively | ✅ FIXED | Now uses `.replace(/^@+/, "")` (L739, L740) — handles multiple `@` signs. |
| Feature 3 MEDIUM-1 | MEDIUM | VoteButton lacks aria-labels | ✅ FIXED | Both upvote and downvote `<Button>` elements in `components/forum/vote-button.tsx` now have `aria-label` with dynamic state text (L91, L109). Good. |
| Feature 5 HIGH-1 | HIGH | Duplicate `/api/users/me` fetch | ✅ FIXED | `DashboardLayout` fetches once (L297–303), passes data to `SidebarContent` via `user` prop (L311, L323). `SidebarContent` accepts `user` prop (L217–220) and derives `userName`, `userId`, `userImage` from it. |
| Feature 1 HIGH-2 | HIGH | Notifications never marked read on click | ✅ FIXED | Each notification `<Link>` now has an `onClick` handler (L157–166) that sends `PUT /api/notifications` with that single notification ID and optimistically updates local state. |
| Feature 5 LOW-1 | LOW | No `alt` text on `AvatarImage` | ✅ FIXED | Desktop sidebar avatar at L247 has `alt={userName}`. Mobile header avatar at L327 has `alt={myUserName ?? "ユーザー"}`. |
| Feature 2 MEDIUM-2 | MEDIUM | Mobile header squeeze on <360px | ✅ FIXED | Header now uses `flex-wrap gap-2` (L108). Button has `shrink-0` implicitly via the gap layout. |
| Feature 2 LOW-2 | LOW | Success toast lacks `role="status"` | ✅ FIXED | Success div now has `role="status"` and `aria-live="polite"` (L116). |

### ⚠️ PARTIALLY FIXED Issues

| Round 1 ID | Severity | Description | Status | Notes |
|---|---|---|---|---|
| Feature 5 MEDIUM-2 | MEDIUM | Avatar initials logic differs between mobile and desktop | ⚠️ PARTIAL | Desktop sidebar now takes single first char `userName[0]?.toUpperCase()` (L223). Mobile header still uses split-and-join logic `myUserName.split(" ").map(n => n[0]).join("").slice(0, 2)` (L329). For "John Doe": desktop="J", mobile="JD". Not unified. **Severity remains MEDIUM.** |
| Feature 1 MEDIUM-3 | MEDIUM | 30-second polling is aggressive | ❌ NOT FIXED | Interval still hardcoded at 30000ms (L107). No `document.visibilityState` check. Still fires when tab is backgrounded. |
| Feature 1 HIGH-1 | HIGH | `notifyAlgorithmUpdate` fetches ALL users without pagination | ❌ NOT FIXED | `lib/notifications.ts` L117 still does `prisma.user.findMany({ select: { id: true } })` with no `take`/`skip`. `createMany` on L124 still builds one array for all users. |
| Feature 1 MEDIUM-1 | MEDIUM | PUT endpoint accepts arbitrary `notificationIds` without type validation | ❌ NOT FIXED | `app/api/notifications/route.ts` L33 still only checks `Array.isArray()`. No Zod validation on array element types. |
| Feature 1 MEDIUM-2 | MEDIUM | No pagination in GET notifications endpoint | ❌ NOT FIXED | `take: 50` hardcoded, no cursor param. Client has no "load more" button. |
| Feature 2 MEDIUM-1 | MEDIUM | Ticket list has no pagination | ❌ NOT FIXED | `app/api/tickets/route.ts` GET handler still does `findMany` with no `take` limit. |
| Feature 4 HIGH-1 | HIGH | Sidebar hidden below comments on tablet | ❌ NOT FIXED | Grid layout `lg:grid-cols-4` still collapses to single column below 1024px. No `order-first` or compact author bar for tablets. |
| Feature 1 LOW-1 | LOW | Notification message not length-capped server-side | ❌ NOT FIXED | No max-length truncation on full message in `lib/notifications.ts`. |
| Feature 1 LOW-2 | LOW | Empty `catch` in NotificationBell | ❌ NOT FIXED | Still `catch { /* ignore */ }` at L102 and L116. |
| Feature 3 MEDIUM-2 | MEDIUM | Optimistic update visual flicker | ❌ NOT FIXED | No CSS transition on score number. |
| Feature 3 LOW-1 | LOW | Delete button invisible on touch (hover-only) | ❌ NOT FIXED | `comment-section.tsx` L176 still uses `opacity-0 group-hover:opacity-100` with no mobile override. |

---

## Part B: NEW Issues Found (Round 2)

### NEW-1: `SidebarContent` renders empty/broken state when `user` is null during initial load

- **Severity:** MEDIUM
- **File:** `app/dashboard/layout.tsx`, lines 217–223
- **Description:** When `user` prop is `null` (before the `/api/users/me` fetch resolves), `SidebarContent` defaults to `userName="ユーザー"`, `userId=null`, `userImage=null`. This means:
  1. The sidebar avatar shows "ユ" as initials during loading
  2. The "マイページ" link in the dropdown is conditionally hidden when `userId` is null (L261) — but the dropdown still renders with only 2 items (Settings + Logout), which feels broken
  3. No loading skeleton or placeholder communicates that data is still loading
- **Impact:** Brief but visible flash of incorrect content on every page navigation, especially on slow connections.
- **Recommendation:** Show a skeleton or placeholder avatar in `SidebarContent` when `user` is null, or defer rendering the user profile section until data loads.

### NEW-2: `fetchTickets` is called again after successful submit without `await`

- **Severity:** LOW
- **File:** `app/dashboard/tickets/page.tsx`, line 85
- **Description:** After a successful ticket POST, `fetchTickets()` is called fire-and-forget without `await`. If the database replication is slow, the re-fetched list may not include the newly created ticket, causing a confusing UX where the user sees a "success" toast but their ticket doesn't appear.
- **Impact:** Race condition on ticket list refresh — ticket may briefly not appear.
- **Recommendation:** `await fetchTickets()` or optimistically add the ticket to the local state from the POST response.

### NEW-3: `formatDate` in tickets page does not zero-pad month and day

- **Severity:** LOW
- **File:** `app/dashboard/tickets/page.tsx`, lines 94–97
- **Description:** The `formatDate` function uses `d.getMonth() + 1` and `d.getDate()` without zero-padding. This produces inconsistent date widths like `2026/2/1 9:05` instead of `2026/02/01 09:05`. Minutes are padded but month/day/hours are not.
- **Impact:** Visual inconsistency in ticket date display; looks unpolished.
- **Recommendation:** Use `String(...).padStart(2, "0")` for month, day, and hours, or use `Intl.DateTimeFormat`.

### NEW-4: `AvatarImage` in forum post detail page lacks `alt` attribute

- **Severity:** LOW
- **File:** `app/dashboard/forum/[id]/page.tsx`, lines ~301 and ~713
- **Description:** Two `<AvatarImage>` instances for the post author (one in the post header at ~L301, one in the sidebar at ~L713) have no `alt` attribute. The Round 1 fix for `alt` was only applied to `layout.tsx`, not to other components.
- **Impact:** Screen readers cannot identify the avatar images.
- **Recommendation:** Add `alt={post.author?.name ?? "ユーザーアバター"}` to both instances.

### NEW-5: `AvatarImage` in `comment-section.tsx` lacks `alt` attribute

- **Severity:** LOW
- **File:** `components/forum/comment-section.tsx`, line 131
- **Description:** Comment author `<AvatarImage src={comment.author.image} />` has no `alt` attribute. Same issue as above but across all comments.
- **Recommendation:** Add `alt={comment.author.name ?? "ユーザー"}`.

### NEW-6: Ticket category buttons lack accessible names

- **Severity:** MEDIUM
- **File:** `app/dashboard/tickets/page.tsx`, lines 125–139
- **Description:** Category selector buttons are `<button>` elements with only visual content (icon + truncated label text). They have no `aria-label`, `role="radio"`, or `aria-pressed` attribute. Screen readers cannot determine which category is selected.
- **Recommendation:** Add `aria-pressed={category === cat.value}` and `aria-label={cat.label}` to each button.

### NEW-7: Evidence form JSON textareas don't validate or show parsing errors

- **Severity:** MEDIUM
- **File:** `app/dashboard/forum/[id]/page.tsx`, lines 242–248
- **Description:** The "Before データ" and "After データ" JSON textareas silently set the value to `null` if `JSON.parse()` fails. The user has no indication that their JSON was invalid — the form just submits with `null` data, which may not be the user's intent.
- **Impact:** Users can unknowingly lose evidence data they entered.
- **Recommendation:** Show a red border or inline error message when JSON parsing fails, before allowing submission.

### NEW-8: `renderMarkdown` link rendering is vulnerable to XSS via `href`

- **Severity:** HIGH
- **File:** `app/dashboard/forum/[id]/page.tsx`, lines 125–129 (inside `processInline`)
- **Description:** The markdown link parser creates `<a href={linkMatch[3]}>` directly from user-authored post content. If a user writes `[click me](javascript:alert(1))` in their post content, the link href will be `javascript:alert(1)`. While React escapes attribute values preventing injection, `javascript:` URIs are valid `href` values and **will execute** when clicked in all major browsers.
- **Impact:** Stored XSS — any user can create a forum post with a `javascript:` link that executes code when other users click it.
- **Recommendation:** Validate the URL protocol in `processInline` the same way the author website was fixed:
  ```ts
  try {
    const url = new URL(linkMatch[3], window.location.origin);
    if (!["http:", "https:"].includes(url.protocol)) { /* render as plain text */ }
  } catch { /* render as plain text */ }
  ```

### NEW-9: In-memory rate limiter does not work across serverless instances

- **Severity:** MEDIUM
- **File:** `lib/rate-limit.ts`
- **Description:** The rate limiter uses a module-level `Map` stored in process memory. In a serverless environment (Vercel, etc.) each function invocation may run in a different instance. The `Map` is empty on cold starts and not shared between instances. This means rate limiting is ineffective at scale.
- **Impact:** Rate limiting provides false sense of security; determined attackers can bypass it by hitting different instances.
- **Recommendation:** For production, use Redis-backed rate limiting (e.g., `@upstash/ratelimit`). Document this as a known limitation if staying with in-memory for now.

### NEW-10: Vote button `score` span lacks `aria-label`

- **Severity:** LOW
- **File:** `components/forum/vote-button.tsx`, lines 94–106
- **Description:** While Round 1 recommended adding `aria-label` to the score span (e.g., `aria-label={`スコア: ${score}`}`), only the buttons got labels — the score `<span>` still has none. Screen readers will just read the number without context.
- **Recommendation:** Add `aria-label={`スコア: ${score}`}` or wrap in a `<span role="status">`.

### NEW-11: Ticket error message `<p>` element is not accessible

- **Severity:** LOW
- **File:** `app/dashboard/tickets/page.tsx`, line 148
- **Description:** The error message `<p className="text-sm text-red-400">{error}</p>` has no `role="alert"` or `aria-live` attribute. Screen readers won't announce validation errors.
- **Recommendation:** Add `role="alert"` to the error paragraph.

### NEW-12: `DashboardLayout` useEffect fetch does not handle component unmount

- **Severity:** LOW
- **File:** `app/dashboard/layout.tsx`, lines 297–303
- **Description:** The `fetch("/api/users/me")` in `useEffect` has no cleanup mechanism or `AbortController`. If the component unmounts before the fetch resolves, it will attempt to set state on an unmounted component. While React 18 doesn't throw for this, it's still a wasted operation and potential source of bugs.
- **Recommendation:** Use `AbortController` for cleanup:
  ```ts
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/users/me", { signal: controller.signal })...
    return () => controller.abort();
  }, []);
  ```

### NEW-13: Notification polling continues after sign-out

- **Severity:** LOW
- **File:** `app/dashboard/layout.tsx`, lines 105–108
- **Description:** The `setInterval(fetchNotifications, 30000)` cleanup only runs when `NotificationBell` unmounts. If the user signs out but the component hasn't unmounted yet (brief window during redirect), polling continues and may produce 401 errors in the console. Not a security issue, but generates noise.
- **Recommendation:** Check response status in `fetchNotifications` and clear interval on 401.

### NEW-14: `timeAgo` function is duplicated across 3 files

- **Severity:** LOW (code quality)
- **Files:** `app/dashboard/layout.tsx`, `app/dashboard/forum/[id]/page.tsx`, `components/forum/comment-section.tsx`
- **Description:** The exact same `timeAgo` function is copy-pasted in all three files. Similarly, `getInitials` is duplicated in `forum/[id]/page.tsx` and `comment-section.tsx`.
- **Recommendation:** Extract both into a shared utility (e.g., `lib/format-utils.ts`).

### NEW-15: Mobile sidebar sheet does not close on navigation (by link click)

- **Severity:** MEDIUM
- **File:** `app/dashboard/layout.tsx`, lines 320–325
- **Description:** The mobile sheet wraps `SidebarContent` in a `<div onClick={() => setMobileMenuOpen(false)}>`, which closes the sheet when any part of the content is clicked. However, if a `<Link>` inside `SidebarContent` triggers client-side navigation via Next.js router (no full page reload), the Sheet may remain open since `onOpenChange` might not fire. The `onClick` handler on the wrapper div should handle this, but it relies on event bubbling which can be prevented by child elements.
  
  Additionally, the `DropdownMenu` inside `SidebarContent` (user profile dropdown) will capture clicks and may not bubble to the parent `div`, so clicking a dropdown item like "マイページ" won't close the mobile sheet.
- **Impact:** On mobile, navigating via the user dropdown in the sidebar leaves the sheet overlay open.
- **Recommendation:** Use `pathname` in a `useEffect` to close the sheet whenever the route changes:
  ```ts
  useEffect(() => { setMobileMenuOpen(false); }, [pathname]);
  ```

---

## Summary

### Round 1 Fix Status

| Status | Count |
|---|---|
| ✅ Fully Fixed | 11 |
| ⚠️ Partially Fixed | 1 |
| ❌ Not Fixed | 10 |

### New Issues Found (Round 2)

| Severity | Count | IDs |
|---|---|---|
| HIGH | 1 | NEW-8 |
| MEDIUM | 4 | NEW-1, NEW-6, NEW-9, NEW-15 |
| LOW | 10 | NEW-2, NEW-3, NEW-4, NEW-5, NEW-7, NEW-10, NEW-11, NEW-12, NEW-13, NEW-14 |

### Priority Actions

#### Immediate (security)
1. **NEW-8** — Sanitize `javascript:` URIs in markdown link renderer (stored XSS vector)

#### Short-term
2. **R1 Feature 1 HIGH-1** — Batch `notifyAlgorithmUpdate` for large user bases (still unfixed)
3. **R1 Feature 4 HIGH-1** — Author sidebar visibility on tablets (still unfixed)
4. **NEW-9** — Document or replace in-memory rate limiter for serverless
5. **NEW-15** — Fix mobile sidebar not closing on dropdown navigation
6. **NEW-1** — Loading state for sidebar user data

#### Nice-to-have
7. Fix remaining unfixed MEDIUM/LOW Round 1 issues
8. Address accessibility gaps (NEW-4, NEW-5, NEW-6, NEW-10, NEW-11)
9. Code quality: deduplicate `timeAgo`/`getInitials` (NEW-14)

---

*Report generated by automated code review. No code changes were made.*
