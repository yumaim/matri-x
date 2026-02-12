# Sidebar Navigation Restructuring — UX Evaluation

**Date:** 2026-02-12  
**Evaluator:** Subagent (UX review)  
**Overall Score: 8.0 / 10**

---

## 1. Grouping Logic (9/10)

The transition from a flat 11-item list to grouped sections is a clear improvement. The groupings are sensible:

- **Main nav** (ダッシュボード, フォーラム, ランキング, アナリティクス) — core daily-use pages, correctly prioritized.
- **学習** (パイプライン探索, エンゲージメント分析, 用語集) — learning/research tools grouped well.
- **ツール** (TweepCredシミュレーター, Deep AI検索) — utility/simulation tools, logical grouping.
- **Bottom** (開発チケット, 更新履歴, Discord, プロフィール, 設定) — meta/system items, appropriate placement.

**Minor concern:** "エンゲージメント分析" could also fit under ツール since it's an analytical tool, but its learning-oriented framing justifies its current placement. Acceptable as-is.

## 2. Mobile UX (7/10)

- ✅ Sheet closes on route change (`useEffect` on `pathname`) — good.
- ✅ `aria-label="ナビゲーションメニュー"` on SheetContent.
- ⚠️ The `onClick={() => setMobileMenuOpen(false)}` on the wrapper div means tapping the accordion toggle button also closes the sheet. This is a **bug**: users can't expand/collapse accordion groups on mobile without the sheet closing.
- **Fix needed:** Stop propagation on accordion toggle buttons, or move the close-on-click to nav link elements only.

## 3. Collapsed Sidebar State (8/10)

- ✅ When collapsed, accordion groups fall back to rendering items directly (`if (collapsed) return items.map(...)`) — smart.
- ✅ Logo shortens to "MX".
- ✅ Labels hide via `{!collapsed && <span>}`.
- ⚠️ In collapsed mode, there are 9+ icon-only items in a flat list with no visual grouping (no dividers or spacing between sections). This could be disorienting. Consider adding thin separators between logical groups even in collapsed mode.

## 4. Accessibility (5/10) ⚠️

This is the weakest area:

- ❌ Accordion `<button>` elements lack `aria-expanded` attribute.
- ❌ No `aria-controls` linking buttons to their content panels.
- ❌ Content panels lack `role="region"` or `id` for association.
- ❌ No `aria-label` on accordion buttons (the visual label exists but explicit ARIA would be better).
- ✅ SheetContent has `aria-label`.
- ✅ Active state is visually distinct (`bg-primary/10 text-primary`).

**Recommended additions to `renderAccordion`:**
```tsx
<button
  aria-expanded={isOpen}
  aria-controls={`${label}-panel`}
  ...
>
<div id={`${label}-panel`} role="region" aria-label={label}>
```

## 5. Alternative Groupings Considered

Current grouping is close to optimal. One alternative worth considering:

| Current | Alternative |
|---------|-------------|
| Main: ダッシュボード, フォーラム, ランキング, アナリティクス | Main: ダッシュボード, フォーラム, ランキング |
| 学習: パイプライン, エンゲージメント, 用語集 | 分析: アナリティクス, エンゲージメント分析, パイプライン探索 |
| ツール: シミュレーター, AI検索 | ツール: シミュレーター, AI検索, 用語集 |

This alternative groups all analytical features together and moves 用語集 (reference tool) to ツール. However, the current grouping is justified and doesn't need changing — it maps well to user mental models of "learning" vs "doing".

## 6. アナリティクス Placement (9/10)

**Correct in main nav.** Rationale:
- アナリティクス is a high-frequency, dashboard-level overview page.
- エンゲージメント分析 under 学習 is a deeper, more specialized analysis tool.
- The distinction between "overview analytics" (main) and "deep-dive analysis" (学習) is clear.
- Keeping it visible at all times reduces friction for the most common analytical task.

## 7. Accordion Auto-Expand (9/10)

- ✅ Initial state is derived from current pathname: `useState(() => learningNavigation.some((item) => pathname === item.href))`.
- ⚠️ This only runs on initial mount. If the user navigates to a child page via browser back/forward or direct URL after the component has mounted, the accordion won't auto-expand. In practice this rarely matters since Next.js route changes typically don't remount layout components — but `pathname` changes without remount won't trigger the `useState` initializer.
- **Low risk** — the sidebar is a layout component and typically mounts once per session. If issues arise, add a `useEffect` watching `pathname` to auto-expand.

---

## Admin Dashboard (`app/admin/layout.tsx`) (8/10)

- ✅ Clean, flat nav — appropriate for a small admin panel (6 items).
- ✅ Role check with redirect on failure.
- ✅ "ダッシュボードへ戻る" link at bottom — good escape hatch.
- ⚠️ Mobile nav uses a simple toggle (`mobileOpen` state) instead of a Sheet — inconsistent with the dashboard sidebar pattern. Works fine but feels different.
- ⚠️ No loading skeleton — just text "認証確認中..." with `animate-pulse`. Minor but could flash.

## Role Hiding Logic (9/10)

- ✅ `RoleBadge` in `comment-section.tsx` returns `null` — admin/mod badges are fully hidden in public forum areas.
- ✅ User profile page (`users/[id]/page.tsx`) only shows role badge when `isOwnPage && user.role !== "USER"` — admin badge is invisible to other users.
- ✅ `post-card.tsx` has `role` in data but never renders it.
- Solid approach to hiding admin identity in public contexts.

## Discord Dialog (9/10)

- ✅ Clean "Coming Soon" dialog with branded Discord styling.
- ✅ Animated ping indicator adds polish.
- ✅ Works in both collapsed and expanded sidebar states.
- ✅ Uses Dialog component properly.
- Minor: No close button visible, but clicking outside/pressing Escape works (default Dialog behavior).

---

## Summary of Recommendations

| Priority | Issue | Action |
|----------|-------|--------|
| 🔴 High | Mobile accordion click closes sheet | Stop propagation on accordion buttons |
| 🔴 High | Missing ARIA attributes on accordions | Add `aria-expanded`, `aria-controls`, `role="region"` |
| 🟡 Medium | Collapsed mode lacks section dividers | Add thin separators between groups |
| 🟢 Low | Accordion doesn't re-expand on pathname change | Add `useEffect` to sync open state with pathname |
| 🟢 Low | Admin mobile nav style inconsistency | Consider using Sheet for admin mobile nav too |
