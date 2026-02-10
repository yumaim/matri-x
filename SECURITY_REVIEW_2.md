# Security Review #2 — matri-x

**日時**: 2026-02-10
**レビュアー**: Claw (automated security audit)
**対象コミット**: HEAD (next@16.0.7, next-auth@5.0.0-beta.30, prisma@6.19.2)

## 結果: PASS (条件付き)

全体的にセキュリティ設計は良好。認証・認可の二重チェック（middleware + API層）、Zodバリデーション、Prismaパラメータバインディングが一貫して適用されている。ただし、本番環境へのデプロイ前に対応すべき項目がいくつかある。

---

## 発見事項

### [重要度: HIGH] AUTH_SECRETがデフォルト値のままコミット可能

- **場所**: `.env:2-4`
- **問題**: `NEXTAUTH_SECRET` と `AUTH_SECRET` が `"matri-x-dev-secret-change-in-prod"` というデフォルト値でコミットされている。`.gitignore` に `.env` は含まれているが、万一コミットされた場合にJWTセッション偽造が可能になる。また、本番デプロイ時にこの値を変更し忘れるリスクがある。
- **修正案**:
  ```bash
  # .env.example を作成し、実値は含めない
  NEXTAUTH_SECRET=
  AUTH_SECRET=
  # 本番では最低32バイトのランダム値を使用
  # openssl rand -base64 32
  ```
  デプロイパイプラインで `AUTH_SECRET` が空/デフォルト値でないことを検証するステップを追加。

### [重要度: HIGH] セキュリティヘッダー未設定

- **場所**: `next.config.mjs`, `middleware.ts`
- **問題**: Content-Security-Policy、X-Frame-Options、X-Content-Type-Options、Strict-Transport-Security 等のセキュリティヘッダーが一切設定されていない。XSS攻撃やクリックジャッキングのリスクがある。
- **修正案**:
  ```js
  // next.config.mjs に追加
  const securityHeaders = [
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'X-DNS-Prefetch-Control', value: 'on' },
    { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
    {
      key: 'Content-Security-Policy',
      value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; frame-ancestors 'none';"
    },
  ];

  const nextConfig = {
    // ...existing config...
    async headers() {
      return [{ source: '/(.*)', headers: securityHeaders }];
    },
  };
  ```

### [重要度: MEDIUM] OG画像エンドポイントに認証なし（意図的だが確認必要）

- **場所**: `app/api/og/[postId]/route.tsx`
- **問題**: `/api/og/[postId]` は認証チェックなしで投稿データ（タイトル、著者名、統計情報）を取得・画像生成する。OGP画像はクローラーからアクセスされるため認証不要が正しいが、投稿のstatusチェックがない。DRAFT/REMOVED状態の投稿もOG画像が生成される。
- **修正案**:
  ```typescript
  // app/api/og/[postId]/route.tsx の post 取得後に追加
  if (!post || post.status !== "PUBLISHED") {
    return new Response("Not found", { status: 404 });
  }
  ```

### [重要度: MEDIUM] レート制限の適用範囲が限定的

- **場所**: `lib/rate-limit.ts`, 各APIルート
- **問題**: レート制限が `register` と `password change` にのみ適用されている。以下の重要エンドポイントにレート制限がない:
  - `POST /api/forum/posts` (投稿作成)
  - `POST /api/forum/posts/[id]/comments` (コメント作成)
  - `POST /api/forum/posts/[id]/vote` (投票)
  - `POST /api/deepwiki/chat` (ナレッジ検索)
  - `POST /api/simulator` (シミュレーション実行)
  - `POST /api/users/me` (プロフィール更新)
- **修正案**:
  ```typescript
  // 例: POST /api/forum/posts に追加
  export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { allowed } = checkRateLimit(`post:${session.user.id}`, 10, 60000);
    if (!allowed) {
      return NextResponse.json(
        { error: "リクエストが多すぎます" },
        { status: 429 }
      );
    }
    // ... rest of handler
  }
  ```

### [重要度: MEDIUM] インメモリレート制限はスケールしない

- **場所**: `lib/rate-limit.ts`
- **問題**: `Map` を使ったインメモリ実装のため、サーバーレス環境（Vercel等）では各インスタンス間で状態が共有されず、レート制限が実質無効化される。また、メモリリークの可能性もある（古いエントリが `Map` から自動削除されない）。
- **修正案**: 本番環境では Redis (Upstash) ベースのレート制限に移行する。
  ```typescript
  // upstash/ratelimit を使用
  import { Ratelimit } from "@upstash/ratelimit";
  import { Redis } from "@upstash/redis";

  const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(30, "60 s"),
  });
  ```

### [重要度: MEDIUM] POST作成時にユーザーが任意のstatusを設定可能

- **場所**: `app/api/forum/posts/route.ts:90`, `lib/validations/forum.ts:45`
- **問題**: `createPostSchema` で `status` フィールドに `"DRAFT" | "PUBLISHED" | "FLAGGED" | "REMOVED"` を許可している。悪意あるユーザーが `"FLAGGED"` や `"REMOVED"` ステータスで投稿を作成できてしまう（実害は小さいが意図しない動作）。
- **修正案**:
  ```typescript
  // lib/validations/forum.ts を修正
  export const createPostSchema = z.object({
    // ...
    status: z.enum(["DRAFT", "PUBLISHED"]).default("PUBLISHED"),
  });
  ```

### [重要度: LOW] viewCount のインクリメントに認証不要・レート制限なし

- **場所**: `app/api/forum/posts/[id]/route.ts:52-55`
- **問題**: `GET /api/forum/posts/[id]` でアクセスするたびに `viewCount` が無条件にインクリメントされる。認証済みの場合でもレート制限がないため、スクリプトによる viewCount の不正操作が可能。ただし、middleware で `/api/` は認証が必要なため、ログインユーザーのみがアクセス可能で、リスクは限定的。
- **修正案**: セッションIDまたはIP + postId でデバウンスする。
  ```typescript
  // 同じユーザーが同じ投稿を短時間に複数回閲覧してもカウントしない
  const viewKey = `view:${session?.user?.id ?? ip}:${id}`;
  const { allowed } = checkRateLimit(viewKey, 1, 300000); // 5分に1回まで
  if (allowed) {
    await prisma.forumPost.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  }
  ```

### [重要度: LOW] console.error にエラーオブジェクト全体を出力

- **場所**: 複数のAPIルート（`app/api/forum/posts/route.ts:130`, `app/api/auth/register/route.ts:47` 等）
- **問題**: `console.error("Registration error:", error)` のように、エラーオブジェクト全体がサーバーログに出力される。スタックトレースやDB接続情報等の内部情報が本番ログに含まれる可能性がある。ただし、クライアントへのレスポンスでは汎用エラーメッセージのみ返しているため、直接的な情報漏洩リスクは低い。
- **修正案**: 本番環境では構造化ロギングを使用し、センシティブ情報をフィルタする。
  ```typescript
  console.error("Registration error:", {
    message: error instanceof Error ? error.message : "Unknown error",
    // stack trace は開発環境のみ
    ...(process.env.NODE_ENV === "development" && { stack: (error as Error).stack }),
  });
  ```

### [重要度: LOW] ZodError の details がクライアントに返される

- **場所**: `app/api/forum/posts/route.ts:128`, `app/api/forum/posts/[id]/route.ts:119`
- **問題**: Zodバリデーションエラー時に `details: error` としてZodErrorオブジェクト全体をクライアントに返している。フィールド名やバリデーションルールの詳細が漏洩する。実害は小さいが、情報開示の最小化が望ましい。
- **修正案**:
  ```typescript
  if (error instanceof Error && error.name === "ZodError") {
    return NextResponse.json(
      { error: "バリデーションエラー" },
      { status: 400 }
    );
  }
  ```

---

## APIルート認証チェック一覧

| ルート | メソッド | 認証方式 | Admin必須 | レート制限 | 判定 |
|--------|---------|---------|-----------|-----------|------|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth handlers | — | — | ✅ (パブリック) |
| `/api/auth/register` | POST | なし (パブリック) | — | ✅ 5/min/IP | ✅ |
| `/api/admin/content` | GET/POST | `requireAdmin()` | ✅ | ✗ | ✅ |
| `/api/admin/posts` | GET | `requireAdmin()` | ✅ | ✗ | ✅ |
| `/api/admin/posts/[id]` | PUT | `requireAdmin()` | ✅ | ✗ | ✅ |
| `/api/admin/stats` | GET | `requireAdmin()` | ✅ | ✗ | ✅ |
| `/api/admin/users` | GET | `requireAdmin()` | ✅ | ✗ | ✅ |
| `/api/admin/users/[id]` | PUT | `requireAdmin()` | ✅ | ✗ | ✅ |
| `/api/deepwiki/chat` | POST | `requireAuth()` | ✗ | ✗ | ⚠️ レート制限なし |
| `/api/deepwiki/search` | POST | `requireAuth()` | ✗ | ✗ | ⚠️ レート制限なし |
| `/api/forum/posts` | GET | `auth()` (optional) | ✗ | ✗ | ✅ (公開データ) |
| `/api/forum/posts` | POST | `auth()` + session check | ✗ | ✗ | ⚠️ レート制限なし |
| `/api/forum/posts/[id]` | GET | `auth()` (optional) | ✗ | ✗ | ✅ |
| `/api/forum/posts/[id]` | PUT | `auth()` + 所有者チェック | ✗ | ✗ | ✅ |
| `/api/forum/posts/[id]` | DELETE | `auth()` + 所有者/MODERATOR/ADMINチェック | ✗ | ✗ | ✅ |
| `/api/forum/posts/[id]/bookmark` | POST | `auth()` + session check | ✗ | ✗ | ✅ |
| `/api/forum/posts/[id]/comments` | GET | `auth()` (optional) | ✗ | ✗ | ✅ |
| `/api/forum/posts/[id]/comments` | POST | `auth()` + session check | ✗ | ✗ | ⚠️ レート制限なし |
| `/api/forum/posts/[id]/evidence` | POST | `auth()` + session check | ✗ | ✗ | ⚠️ レート制限なし |
| `/api/forum/posts/[id]/react` | POST | `requireAuth()` | ✗ | ✗ | ✅ |
| `/api/forum/posts/[id]/vote` | POST | `auth()` + session check | ✗ | ✗ | ✅ |
| `/api/forum/ranking/users` | GET | `requireAuth()` | ✗ | ✗ | ✅ |
| `/api/notifications` | GET | `requireAuth()` | ✗ | ✗ | ✅ |
| `/api/notifications` | PUT | `requireAuth()` + 所有者フィルタ | ✗ | ✗ | ✅ |
| `/api/og/[postId]` | GET | なし (パブリック) | — | ✗ | ⚠️ status未チェック |
| `/api/simulator` | GET/POST | `requireAuth()` | ✗ | ✗ | ⚠️ レート制限なし |
| `/api/users/me` | GET/PUT | `requireAuth()` | ✗ | ✗ | ✅ |
| `/api/users/me/password` | PUT | `requireAuth()` | ✗ | ✅ 5/hour | ✅ |
| `/api/users/me/stats` | GET | `requireAuth()` | ✗ | ✗ | ✅ |
| `/api/users/progress` | GET | `requireAuth()` | ✗ | ✗ | ✅ |
| `/api/users/progress/track` | POST | `requireAuth()` | ✗ | ✗ | ✅ |

**注**: middleware (`auth.config.ts`) で `/api/admin/*` はADMINロールチェック、`/api/*` はログイン必須がグローバルに適用されている。各APIルートでも二重チェックを実施しており、Defense in Depth が確保されている。

---

## チェック項目

- [x] **W1: 認証・認可**
  - NextAuth v5 (beta.30) + JWT戦略で正しく設定
  - middleware (`authorized` callback) + API層 (`requireAuth()`/`requireAdmin()`) の二重チェック
  - 全6つの admin APIルートに `requireAdmin()` が適用済み
  - セッション情報は `id` と `role` のみをJWTに含め、安全
  - ロールチェックは middleware と API 両方で実施 (Defense in Depth ✅)

- [x] **W2: インジェクション**
  - SQLインジェクション: Prisma ORM のパラメータバインディングのみ使用。`$queryRaw`/`$executeRaw` の直接使用なし ✅
  - XSS: `dangerouslySetInnerHTML` は `components/ui/chart.tsx` のみ（shadcn/ui ライブラリコード、ユーザー入力なし）✅
  - 全入力は Zod スキーマでバリデーション済み ✅
  - CSRF: NextAuth v5 が SameSite cookie + CSRF token を自動管理 ✅

- [△] **W3: データ漏洩**
  - パスワードハッシュ: 全てのユーザー取得クエリで `select` を使用し `password` フィールドを除外 ✅
  - 登録レスポンス: `id`, `name`, `email` のみ返却 ✅
  - admin ユーザー一覧: `password` 未含 ✅
  - エラーメッセージ: クライアントには汎用メッセージのみ返却 ✅
  - ⚠️ ZodError の `details` がクライアントに返されるケースあり (LOW)
  - ⚠️ `.env` にデフォルトシークレットが含まれている (HIGH — 本番対応必須)

- [△] **W4: レート制限・DoS**
  - 登録: ✅ 5回/分/IP
  - パスワード変更: ✅ 5回/時/ユーザー
  - ⚠️ 投稿作成、コメント、シミュレーション、deepwiki等にレート制限なし
  - ⚠️ インメモリ実装のためサーバーレス環境で無効化
  - ファイルアップロード: 画像はURL文字列のみ（`image: z.string().max(500)`）で、直接アップロード機能は存在しない → DoSリスクなし ✅

- [△] **W5: その他**
  - CORS: Next.js デフォルト（Same-Origin のみ許可）で適切 ✅
  - CSP: ⚠️ 未設定 (HIGH)
  - X-Frame-Options: ⚠️ 未設定 (HIGH)
  - 依存パッケージ: `next-auth@5.0.0-beta.30` はベータ版。セキュリティ修正の追従に注意 ⚠️
  - TypeScript: `ignoreBuildErrors: true` は本番では無効化すべき ⚠️

---

## 総評

matri-x のセキュリティ設計は、認証・認可の二重防御、Prismaによる安全なDB操作、Zodバリデーションの一貫した適用など、基本的なセキュリティプラクティスが適切に実装されている。

**本番デプロイ前に必須の対応:**
1. セキュリティヘッダー (CSP, X-Frame-Options等) の設定
2. `AUTH_SECRET` の本番用ランダム値への変更と検証
3. 主要エンドポイントへのレート制限追加

**推奨事項:**
4. レート制限の Redis 移行（サーバーレス環境対応）
5. OG画像エンドポイントの status チェック追加
6. `next-auth` のGA版リリースへの追従
7. `ignoreBuildErrors: true` の本番無効化
