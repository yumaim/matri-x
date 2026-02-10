# Code Review #2 — matri-x

**レビュー日**: 2026-02-10
**レビュアー**: Claw (AI Code Review Agent)
**対象コミット**: 現在のワーキングツリー全体
**技術スタック**: Next.js 16 / React 19 / TypeScript / TailwindCSS 3 / shadcn/ui / Prisma+SQLite / NextAuth v5

---

## 結果: NEEDS_CHANGES

3件のローンチブロッカーと、複数の改善推奨事項を検出しました。

---

## 発見事項

### [重要度: HIGH] seedファイルにハードコードされたadmin認証情報

- **場所**: `prisma/seed.ts:9-14`
- **問題**: admin用パスワード `admin123456` がソースコードに平文で記述されている。本番環境でこのseedが実行された場合、推測可能なパスワードで管理者アカウントが作成される重大なセキュリティリスク。
- **修正案**:
```typescript
// prisma/seed.ts
const adminPassword = process.env.ADMIN_SEED_PASSWORD;
if (!adminPassword) {
  throw new Error("ADMIN_SEED_PASSWORD environment variable is required for seeding");
}
const admin = await prisma.user.upsert({
  where: { email: process.env.ADMIN_EMAIL || "admin@matri-x-algo.wiki" },
  update: {},
  create: {
    email: process.env.ADMIN_EMAIL || "admin@matri-x-algo.wiki",
    name: "Matri-X Admin",
    password: await hash(adminPassword, 12),
    role: "ADMIN",
  },
});
```

---

### [重要度: HIGH] 404ページ・エラーページの欠如

- **場所**: `app/` ディレクトリ全体
- **問題**: `app/not-found.tsx` が存在しない。Next.jsデフォルトの404ページが表示されるため、ブランド体験が損なわれる。`app/global-error.tsx` は存在するが、エラースタックトレースを本番環境でもそのまま表示してしまう（情報漏洩リスク）。また、各route groupレベルの `error.tsx` バウンダリが存在しない。
- **修正案**:
```tsx
// app/not-found.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-gradient">404</h1>
        <p className="text-lg text-muted-foreground">ページが見つかりません</p>
        <Button asChild><Link href="/">ホームに戻る</Link></Button>
      </div>
    </div>
  );
}
```

```tsx
// app/global-error.tsx — 本番ではスタックトレースを非表示に
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body style={{ fontFamily: "sans-serif", padding: 40, background: "#0a0a0a", color: "#fff" }}>
        <h2>エラーが発生しました</h2>
        <p style={{ color: "#888" }}>{error.message}</p>
        {process.env.NODE_ENV === "development" && (
          <pre style={{ fontSize: 12, color: "#666", whiteSpace: "pre-wrap", maxWidth: 600 }}>
            {error.stack}
          </pre>
        )}
        <button onClick={() => reset()} style={{ marginTop: 20, padding: "8px 20px", background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>
          再試行
        </button>
      </body>
    </html>
  );
}
```

また `app/dashboard/error.tsx` と `app/admin/error.tsx` のエラーバウンダリも追加推奨。

---

### [重要度: HIGH] global-error.tsxで本番環境にスタックトレース漏洩

- **場所**: `app/global-error.tsx:16-18`
- **問題**: `error.stack` が環境を問わず常に表示される。本番環境ではサーバー内部情報（ファイルパス、ライブラリバージョンなど）が漏洩する。
- **修正案**: 上記の修正案を参照。`process.env.NODE_ENV === "development"` でガード。

---

### [重要度: HIGH] ViewCount インクリメントの競合・悪用リスク

- **場所**: `app/api/forum/posts/[id]/route.ts:49-52`
- **問題**: GETリクエストのたびに `viewCount` を無条件にインクリメントしている。認証済みユーザーが連続リロードするだけで任意にviewCountを操作可能。また、ページ取得とviewCount更新が非同期でありレスポンスに影響する。
- **修正案**: 最低限、セッション単位またはIP単位でのデバウンスを導入する。
```typescript
// 簡易例: セッション内で1投稿あたり1回のみカウント
const cacheKey = `view:${session?.user?.id ?? ip}:${id}`;
if (!viewedPosts.has(cacheKey)) {
  viewedPosts.add(cacheKey);
  await prisma.forumPost.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });
}
```

---

### [重要度: MEDIUM] `any` 型の使用

- **場所**:
  - `app/dashboard/forum/[id]/page.tsx:97` — `renderMarkdown` の戻り値が `any`
  - `app/dashboard/forum/[id]/page.tsx:170` — `post` state が `any`
  - `app/dashboard/forum/[id]/page.tsx:172` — `comments` state が `any[]`
  - `app/dashboard/forum/[id]/page.tsx:181` — `currentUser` state が `any`
  - `app/api/forum/posts/[id]/comments/route.ts:114,119` — `collectCommentIds` と `enrichComments` のパラメータが `any[]`
- **問題**: TypeScript の型安全性を損なう。ランタイムエラーの検出を遅らせる。
- **修正案**: 各箇所に適切なインターフェースを定義する。
```typescript
// 例: post-detail page
interface PostDetail {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isPinned: boolean;
  isVerified: boolean;
  viewCount: number;
  voteScore: number;
  userVote: number | null;
  isBookmarked: boolean;
  createdAt: string;
  author: { id: string; name: string | null; image: string | null; role: string; bio?: string; xHandle?: string };
  evidence: EvidenceData[];
  relatedPosts: { id: string; title: string; category: string; viewCount: number; _count: { comments: number; votes: number } }[];
  _count: { comments: number; votes: number; bookmarks: number; evidence: number };
}

const [post, setPost] = useState<PostDetail | null>(null);
```

---

### [重要度: MEDIUM] `normalizeQuery` / `scoreEntry` / `escapeRegExp` の重複定義

- **場所**:
  - `app/api/deepwiki/search/route.ts:15-55`
  - `app/api/deepwiki/chat/route.ts:15-50`
- **問題**: ほぼ同一ロジックが2ファイルに重複している（DRY原則違反）。バグ修正や改善時に両方更新が必要。
- **修正案**: `lib/knowledge/search-utils.ts` に共通関数を抽出する。
```typescript
// lib/knowledge/search-utils.ts
export function normalizeQuery(query: string): string[] { ... }
export function scoreEntry(entry: KnowledgeEntry, tokens: string[]): number { ... }
export function escapeRegExp(str: string): string { ... }
```

---

### [重要度: MEDIUM] `timeAgo` / `getInitials` 関数の重複定義

- **場所**:
  - `app/dashboard/layout.tsx` — `timeAgo` 関数
  - `app/dashboard/forum/[id]/page.tsx` — `timeAgo` + `getInitials`
  - `components/forum/post-card.tsx` — `timeAgo` + `getInitials`
  - `components/forum/comment-section.tsx` — `timeAgo` + `getInitials`
- **問題**: 4箇所で同一ロジックが重複。
- **修正案**: `lib/format.ts` に共通ユーティリティとして抽出。

---

### [重要度: MEDIUM] CATEGORY_LABELS定数の重複定義

- **場所**:
  - `app/dashboard/forum/[id]/page.tsx` — `CATEGORY_LABELS` (5カテゴリのみ)
  - `components/forum/post-card.tsx` — `CATEGORY_LABELS` (8カテゴリ)
  - `app/api/og/[postId]/route.tsx` — `CATEGORY_LABELS` + `CATEGORY_COLORS`
  - `app/share/[postId]/page.tsx` — `CATEGORY_LABELS`
- **問題**: カテゴリ定義が分散しており、追加時に全箇所を更新する必要がある。かつ post detail ページでは HEAVY_RANKER/SIMCLUSTERS/TWEEPCRED が欠落しておりラベルが表示されない。
- **修正案**: `lib/constants/categories.ts` に一元化。

---

### [重要度: MEDIUM] Rate Limit がインメモリ実装

- **場所**: `lib/rate-limit.ts`
- **問題**: `Map` ベースのインメモリ実装のため、サーバーレス環境やマルチインスタンス構成ではリクエスト間で共有されない。Next.jsのサーバーレス環境では各Lambda呼び出しで初期化される可能性がある。
- **修正案**: 現段階（SQLite＋単一プロセス）では実害は少ないが、Cloudflare/Vercel等のデプロイ先によっては Redis ベースの rate limiter（例: `@upstash/ratelimit`）の導入を検討。

---

### [重要度: MEDIUM] `popular_post` アチーブメント判定ロジックの不具合

- **場所**: `app/api/users/progress/route.ts:87-93`
- **問題**: `findFirst` で1件のみ取得してvoteScoreを計算しているが、最初に見つかった投稿が人気投稿でない可能性がある。全投稿を走査するか、ソートしてtopスコアの投稿を取得すべき。
- **修正案**:
```typescript
// 人気投稿の判定: voteのsum >= 10を持つ投稿が存在するか確認
const popularPostCheck = await prisma.vote.groupBy({
  by: ["postId"],
  where: {
    post: { authorId: userId },
    type: { in: ["UPVOTE", "DOWNVOTE"] },
  },
  _sum: { value: true },
  having: { value: { _sum: { gte: 10 } } },
  take: 1,
});
if (popularPostCheck.length > 0 && !earned.includes("popular_post")) {
  newAchievements.push("popular_post");
}
```

---

### [重要度: MEDIUM] Admin Stats APIのレスポンスとフロントエンドの不一致

- **場所**: `app/api/admin/stats/route.ts` ↔ `app/admin/page.tsx`
- **問題**: APIは `userCount`, `postCount`, `commentCount`, `todayUsers`, `flaggedPosts`, `categoryStats` を返すが、フロントエンドは `totalUsers`, `totalPosts`, `totalComments`, `todayNewUsers`, `flaggedPosts`, `activeUsersLast7d`, `activeRate`, `planDistribution`, `categoryDistribution`, `userGrowth`, `recentFlaggedPosts` を期待している。多くのフィールドが未実装のため管理ダッシュボードのグラフが空になる。
- **修正案**: APIを拡張してフロントエンドが必要とするデータをすべて返すか、フロントエンドを簡略化する。

---

### [重要度: MEDIUM] VoteButton のコメント投票URLが不正

- **場所**: `components/forum/vote-button.tsx:44-46`
- **問題**: コメントへの投票時、`/api/forum/posts/${commentId}/vote` というURLを構築しているが、`commentId` は投稿IDではないため404になる。コメント投票用の別エンドポイントが必要。
- **修正案**: コメント投票用のAPIルート（`/api/forum/comments/[id]/vote`）を新設するか、既存のvote APIに `commentId` パラメータを追加する。

---

### [重要度: MEDIUM] 未使用importの存在

- **場所**:
  - `app/dashboard/forum/page.tsx:11` — `SlidersHorizontal` は使用されているが `Users` が `lucide-react` と `post` interfaceの `author.role` の両方で定義（名前衝突はないがカテゴリ分けでインポート済み）
  - `app/dashboard/page.tsx:8` — `Zap`, `Clock` がインポートされているが使用箇所不明
  - `app/api/notifications/route.ts:1` — `NextRequest` がインポートされているが `GET` のパラメータでは使用されていない（`PUT` では使用）
- **問題**: バンドルサイズへの影響は軽微だが、コード整理の観点で改善余地。
- **修正案**: ESLint `no-unused-vars` / `no-unused-imports` ルールの有効化と修正。

---

### [重要度: MEDIUM] コメント削除機能が未実装

- **場所**: `components/forum/comment-section.tsx:129-138`
- **問題**: 削除メニュー項目（`<DropdownMenuItem>` with `Trash2` icon）は表示されるが、`onClick` ハンドラが未定義。クリックしても何も起きない。対応するAPIエンドポイントも存在しない。
- **修正案**: APIルートの追加とハンドラの実装。

---

### [重要度: LOW] console.error の多用

- **場所**: 28箇所以上（上記grep結果参照）
- **問題**: API Route内の `console.error` はサーバーサイドログとして有用だが、クライアントサイドの `console.error`（dashboard, forum, simulatorなど）は本番環境では適切なエラーハンドリングUIに置き換えるべき。
- **修正案**: クライアントサイドでは `toast` 等のUI通知に置き換え。サーバーサイドは構造化ログ（pino等）の導入を検討。

---

### [重要度: LOW] SEO: OGP画像の改善余地

- **場所**: `app/layout.tsx`
- **問題**: トップページの `metadata` にOGP画像（`openGraph.images`）が未設定。Twitterカード（`twitter.card`）も未設定。SNSで共有された際にプレビューが表示されない。
- **修正案**:
```typescript
export const metadata: Metadata = {
  title: "Matri-X | X(Twitter)アルゴリズム解析プラットフォーム",
  description: "Xの推薦アルゴリズムを視覚的・動的に学べる会員制SaaSプラットフォーム",
  openGraph: {
    title: "Matri-X | X(Twitter)アルゴリズム解析プラットフォーム",
    description: "Xの推薦アルゴリズムを視覚的・動的に学べる会員制SaaSプラットフォーム",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
    siteName: "matri-x",
  },
  twitter: {
    card: "summary_large_image",
    title: "Matri-X",
    description: "Xの推薦アルゴリズムを解析するプラットフォーム",
    images: ["/og-image.png"],
  },
};
```

---

### [重要度: LOW] ランディングページが "use client" で全体CSR

- **場所**: `app/page.tsx:1`
- **問題**: トップページ全体が `"use client"` でクライアントサイドレンダリング。SEOとLCP（Largest Contentful Paint）に悪影響。ヘッダーのモバイルメニュー開閉のみがクライアント状態を必要としている。
- **修正案**: ページ本体をServer Componentにし、ヘッダーのみをClient Componentとして分離（既に `components/layout/header.tsx` が存在する）。

---

### [重要度: LOW] 利用規約・プライバシーポリシーのリンク先が `#`

- **場所**: `app/page.tsx` (Footer) — `href="#"`
- **問題**: ローンチ時にはプレースホルダーリンクが残っている状態。法的には利用規約ページの実装が推奨される。
- **修正案**: 最低限 `/terms` と `/privacy` の静的ページを作成する。

---

### [重要度: LOW] PlanGate のローディング中にchildrenを表示

- **場所**: `components/plan-gate.tsx:18`
- **問題**: `loading` 中に `<>{children}</>` を返しているため、一瞬だけ有料コンテンツが表示されてからゲートがかかる（フラッシュ）。
- **修正案**: ローディング中はスケルトンまたはスピナーを表示。
```tsx
if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
```

---

### [重要度: LOW] `forumPost.tags` の検索が `contains` ベース

- **場所**: `app/api/forum/posts/route.ts:37`
- **問題**: タグがJSON文字列として格納されているため、`contains` 検索では部分一致で誤ったマッチが発生する可能性がある（例: タグ "AI" で "FAIR" にもマッチ）。
- **修正案**: SQLiteの制約上、完全な改善は難しいが、PostgreSQL移行時にはJSON配列型を使用するか、タグ用の中間テーブルを導入する。

---

### [重要度: LOW] 「パスワードを忘れた」リンクが未実装

- **場所**: `app/(auth)/login/page.tsx:86`
- **問題**: `/forgot-password` へのリンクが存在するが、対応するページもAPIも未実装。404になる。
- **修正案**: ローンチ前にリンクを削除するか、パスワードリセット機能を実装。

---

## ローンチブロッカー

以下の項目はデプロイ前に**必ず**修正が必要です：

1. **🔴 `app/global-error.tsx`: 本番環境でのスタックトレース漏洩** — `process.env.NODE_ENV` ガードの追加
2. **🔴 `prisma/seed.ts`: ハードコードされたadminパスワード** — 環境変数化、またはseedファイルに本番で使わない旨のドキュメント追加
3. **🔴 `app/not-found.tsx` の欠如** — ブランド体験を維持するカスタム404ページの作成

---

## 推奨改善

ローンチ後でもよいが、早期に対応すべき改善項目：

1. **VoteButton のコメント投票URLの修正** — コメントへの投票が機能しない（MEDIUM）
2. **Admin Stats APIとフロントエンドの整合性** — 管理画面のグラフが機能しない（MEDIUM）
3. **コメント削除機能の実装** — UIはあるがバックエンドが未実装（MEDIUM）
4. **`any` 型の排除** — 型安全性の向上（MEDIUM）
5. **重複コードの共通化** — `timeAgo`, `getInitials`, `CATEGORY_LABELS`, `normalizeQuery` 等（MEDIUM）
6. **`popular_post` アチーブメント判定ロジックの修正** — 正しい投稿が判定されない（MEDIUM）
7. **ランディングページのSSR化** — SEO・パフォーマンス改善（LOW）
8. **トップページのOGP画像設定** — SNS共有時のプレビュー改善（LOW）
9. **PlanGateのローディングフラッシュ修正** — UX改善（LOW）
10. **「パスワードを忘れた」リンクの削除 or 実装** — 404回避（LOW）
11. **利用規約・プライバシーページの作成** — 法的コンプライアンス（LOW）
12. **Rate Limitの永続化** — スケーリング時のセキュリティ（LOW, 今はSQLite単一プロセスなので問題なし）
13. **ViewCount操作の防止** — 不正なビューカウント操作のリスク軽減（MEDIUM）
14. **`/dashboard/error.tsx` エラーバウンダリの追加** — UXの安定性（LOW）

---

## チェック項目

| カテゴリ | 評価 | コメント |
|---------|------|---------|
| C1: コード品質 | △ | `any` 使用が散在（4箇所）。エラーハンドリングは概ね良好（ApiErrorクラス、Zodバリデーション）。コード重複が目立つ（timeAgo, CATEGORY_LABELS等が4箇所以上）。未使用importは軽微。 |
| C2: パフォーマンス | △ | Prismaクエリは概ねinclude/selectで最適化済み。N+1は投稿一覧のvoteScoreで追加クエリが発生するが`groupBy`で対処済み。ランディングページのCSRはLCPに悪影響。動的importは未使用だがrechartsなどの大型ライブラリが直接importされている。 |
| C3: レスポンシブ・UI | ✓ | モバイル対応は全般的に良好（sm/md/lg breakpoints適切に使用、Sheet/Sheetでモバイルメニュー対応）。アクセシビリティはaria属性が不足しているがshadcn/uiのRadixベースコンポーネントで基本的なa11yは確保。タッチターゲットも適切。 |
| C4: アーキテクチャ | △ | ファイル構成は一貫性あり。API設計はRESTful（適切なHTTPメソッド・ステータスコード）。レスポンス形式は概ね統一（error/data形式）。ただし Admin Stats APIとフロントの不一致、VoteButtonのURL不整合が存在。エラーバウンダリは`global-error.tsx`のみで不十分。 |
| C5: ローンチ準備 | ✗ | TODOコメントなし（良好）。console.errorは多数だがサーバーサイドは許容範囲。**ハードコードされたadminパスワード**、**スタックトレース漏洩**、**404ページ欠如**がローンチブロッカー。SEOはshare/[postId]のOGPは良好だがトップページが不足。 |

**凡例**: ✓ = 良好 / △ = 一部改善必要 / ✗ = 要修正

---

## 総評

全体的に**よく構築されたプロジェクト**です。特に以下の点が優れています：

- **セキュリティ**: NextAuth v5 + JWT戦略、Zodバリデーション、Rate Limiting、Admin認可チェックが適切に実装
- **API設計**: `api-helpers.ts` の `requireAuth` / `requireAdmin` / `handleApiError` パターンが一貫しており保守性が高い
- **UX**: Optimistic Updateパターン（VoteButton, PostReactions, Bookmark等）による即応的なインタラクション
- **機能の充実度**: フォーラム（投票、コメント、エビデンス、リアクション）、ゲーミフィケーション（XP、アチーブメント、レベル）、管理画面と多機能
- **OGP画像生成**: `ImageResponse` を使った動的OG画像の実装は素晴らしい

3件のローンチブロッカーを修正すれば、デプロイ可能な状態です。
