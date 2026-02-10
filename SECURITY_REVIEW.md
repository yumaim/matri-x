# セキュリティ & コードレビュー評価

**レビュー日:** 2026-02-10
**レビュアー:** ShapeShifter (Security + Code Reviewer)
**対象:** matri-x — X(旧Twitter)アルゴリズム解析プラットフォーム（会員型SaaS）
**技術スタック:** Next.js 16 / TypeScript / Prisma + SQLite / NextAuth v5 / bcryptjs

---

## 総合スコア: 62/100

### セキュリティスコア: 34/60

| カテゴリ | スコア | 評価 |
|---------|-------|------|
| 認証・認可 | 10/15 | 🟡 概ね良好だが穴あり |
| 入力バリデーション | 10/15 | 🟡 Zod使用だが不完全な箇所あり |
| データ保護 | 5/10 | 🟠 秘密情報露出リスクあり |
| レート制限 | 4/10 | 🟠 インメモリ限定・適用漏れ |
| ヘッダー・設定 | 5/10 | 🟡 CSP設定に致命的問題 |

### コード品質スコア: 28/40

| カテゴリ | スコア | 評価 |
|---------|-------|------|
| エラーハンドリング | 7/10 | 🟡 概ね良好 |
| パフォーマンス | 7/10 | 🟡 N+1改善の余地あり |
| 保守性 | 7/10 | 🟡 DRY原則概ね遵守 |
| 堅牢性 | 7/10 | 🟡 エッジケース対応に改善余地 |

---

## 🔴 CRITICAL（即座に修正必須）

### C-1: `.env` にハードコードされたシークレット（本番流出リスク）

**ファイル:** `.env`

```
NEXTAUTH_SECRET="matri-x-dev-secret-change-in-prod"
AUTH_SECRET="matri-x-dev-secret-change-in-prod"
```

**攻撃シナリオ:** このファイルが `.gitignore` に入っていない、またはそのままデプロイされた場合、JWTの署名鍵が既知の固定値になる。攻撃者はこの鍵で任意のJWTを偽造し、**任意のユーザー（ADMINを含む）になりすまし**が可能。

**修正方法:**
- 本番環境では `openssl rand -base64 64` で生成した強力なランダム値を使用
- `.env` はリポジトリにコミットしない（`.env.example` のみコミット）
- デプロイ時は環境変数管理サービス（Vercel Environment Variables, AWS Secrets Manager等）を使用
- **リポジトリ履歴から既存の `.env` を完全に削除**

**深刻度:** 🔴 **CRITICAL** — 全認証が破壊される可能性

---

### C-2: CSP に `'unsafe-eval'` と `'unsafe-inline'` が含まれている

**ファイル:** `next.config.mjs`

```js
"script-src 'self' 'unsafe-eval' 'unsafe-inline'"
```

**攻撃シナリオ:** XSS脆弱性が1箇所でも見つかれば、`unsafe-eval` により `eval()` でのコード実行が可能。`unsafe-inline` によりインラインスクリプトの注入も阻止できない。CSPの存在意義がほぼ無効化されている。

**修正方法:**
- `'unsafe-eval'` を削除（Next.js開発モードでのみ必要な場合は `NODE_ENV` で条件分岐）
- `'unsafe-inline'` を `nonce` ベースに変更（Next.js の `nonce` サポートを使用）
- `style-src` からも `'unsafe-inline'` を可能な限り削除

**深刻度:** 🔴 **CRITICAL** — XSS攻撃の緩和策が機能しない

---

### C-3: OGP画像エンドポイントに認証なし・レート制限なし

**ファイル:** `app/api/og/[postId]/route.tsx`

**攻撃シナリオ:**
1. このエンドポイントは認証不要で、任意の `postId` でDBクエリが発行される
2. レート制限がないため、攻撃者が大量のリクエストを送信してDBを過負荷にできる
3. 存在しない `postId` でも `prisma.forumPost.findUnique` が実行される
4. `ImageResponse` のサーバーサイドレンダリングはCPU負荷が高い — **DoS攻撃のベクトル**

**修正方法:**
- レート制限を追加（IPベースで例えば60リクエスト/分）
- レスポンスにキャッシュヘッダーを設定（`Cache-Control: public, max-age=3600`）
- Edge Functionではなく静的生成またはCDNキャッシュを検討

**深刻度:** 🔴 **CRITICAL** — DoS攻撃に対して脆弱

---

## 🟠 HIGH（ローンチ前に修正必須）

### H-1: レート制限がインメモリで、サーバーレス環境・マルチインスタンスで無効

**ファイル:** `lib/rate-limit.ts`

```typescript
const rateLimit = new Map<string, { count: number; resetAt: number }>();
```

**問題点:**
1. サーバーレス環境（Vercel Functions等）では各リクエストが異なるインスタンスで実行されるため、レート制限がリセットされる
2. 複数インスタンス間で状態が共有されない
3. メモリリーク：`Map` にエントリが蓄積され続ける（クリーンアップ処理なし）
4. プロセスが再起動されると全カウンターがリセットされる

**修正方法:**
- Redis/Upstash Redis等の外部ストアを使用
- または Vercel KV, Cloudflare KV 等のエッジストアを使用
- 定期的なクリーンアップ処理を追加（少なくとも stale エントリの GC）

**深刻度:** 🟠 **HIGH** — レート制限が本番で実質的に機能しない

---

### H-2: `x-forwarded-for` ヘッダーのIPスプーフィング

**ファイル:** `app/api/auth/register/route.ts`

```typescript
const ip = request.headers.get("x-forwarded-for") || "unknown";
```

**攻撃シナリオ:** 攻撃者が `X-Forwarded-For` ヘッダーを偽装することで、レート制限を完全に回避できる。毎リクエストで異なるIPを送信すれば、無制限に登録が可能。

**修正方法:**
- リバースプロキシ（Vercel, Cloudflare等）の信頼できるIPヘッダーのみを使用
- Next.js 15+ の場合、`request.ip` または `headers().get('x-real-ip')` を使用
- プロキシ設定でクライアントの `X-Forwarded-For` を上書きするよう設定

**深刻度:** 🟠 **HIGH** — レート制限回避が容易

---

### H-3: 複数のAPIルートにレート制限が適用されていない

**影響を受けるルート:**
- `POST /api/forum/posts/[id]/vote` — 投票操作（無制限）
- `POST /api/forum/posts/[id]/react` — リアクション操作（無制限）
- `POST /api/forum/posts/[id]/bookmark` — ブックマーク操作（無制限）
- `POST /api/forum/posts/[id]/evidence` — エビデンス追加（無制限）
- `PUT /api/notifications` — 通知既読更新（無制限）
- `PUT /api/users/me` — プロフィール更新（無制限）
- `POST /api/users/progress/track` — 進捗トラッキング（無制限）
- `POST /api/deepwiki/chat` — チャット（無制限）
- `POST /api/deepwiki/search` — 検索（無制限）
- `POST /api/simulator` — シミュレーション（無制限）
- 全Admin系API（認証はあるがレート制限なし）

**攻撃シナリオ:** 認証済みユーザーが自動化ツールで大量の投票、リアクション、シミュレーションを実行し、DBとサーバーリソースを枯渇させる。

**修正方法:** 全POSTエンドポイントに最低限のレート制限を追加。

**深刻度:** 🟠 **HIGH**

---

### H-4: ユーザー列挙（User Enumeration）が可能

**ファイル:** `app/api/auth/register/route.ts`

```typescript
if (existingUser) {
  return NextResponse.json(
    { error: "このメールアドレスは既に登録されています" },
    { status: 409 }
  );
}
```

**攻撃シナリオ:** 攻撃者が任意のメールアドレスで登録を試み、レスポンスの違い（409 vs 201/400）で既存ユーザーのメールアドレスを列挙できる。

**修正方法:**
- 成功・失敗に関わらず同じレスポンスメッセージを返す
- 例：「確認メールを送信しました」（実際に送信するかは内部で判断）
- メール確認フローを実装し、既存ユーザーにはパスワードリセットリンクを送信

**深刻度:** 🟠 **HIGH** — 特にSaaSでは顧客メールの漏洩リスク

---

### H-5: PlanGate がクライアントサイドのみで実装されている

**ファイル:** `components/plan-gate.tsx`

```typescript
// クライアントサイドでプランチェック
fetch("/api/users/me")
  .then((r) => r.json())
  .then((data) => setPlan(data.plan ?? "FREE"))
```

**攻撃シナリオ:** 有料機能のアクセス制御がクライアントサイドのみ。ブラウザのDevToolsでReactの状態を変更するか、APIを直接叩くことで、**FREEユーザーが有料コンテンツに無制限アクセス可能**。APIルート側にプランチェックがないため、全API経由で有料機能が利用できる。

**修正方法:**
- APIルート側でもプランチェックを実装（サーバーサイド強制）
- ミドルウェアまたは `requirePlan("STANDARD")` ヘルパーを作成
- クライアントサイドのPlanGateはUX用途のみとし、実際のアクセス制御はサーバーで実施

**深刻度:** 🟠 **HIGH** — 収益に直結するセキュリティ問題

---

### H-6: Admin APIルートの認可がmiddlewareとAPI関数の二重チェックだが、ロールの取得がJWTのみ

**ファイル:** `lib/auth.config.ts`, `lib/api-helpers.ts`

```typescript
// middleware (auth.config.ts)
if (role !== "ADMIN") {
  return Response.redirect(new URL("/dashboard", nextUrl));
}

// API helper (api-helpers.ts)
export async function requireAdmin() {
  const session = await requireAuth();
  if (session.user.role !== "ADMIN") { ... }
}
```

**問題点:** ロール情報はJWTに埋め込まれている。ユーザーのロールがDBで変更（降格）されても、JWTの有効期限が切れるまで古いロールが有効。管理者アカウントが侵害された場合、降格してもセッションが残る。

**修正方法:**
- Admin操作時はDBからリアルタイムにロールを再確認
- JWTの有効期限を短く設定（例：15分）
- ロール変更時に全セッションを無効化する仕組みを追加

**深刻度:** 🟠 **HIGH**

---

### H-7: コメントと投稿の `content` フィールドにXSSサニタイズなし

**ファイル:** 
- `app/api/forum/posts/route.ts` (POST)
- `app/api/forum/posts/[id]/comments/route.ts` (POST)

**問題点:** ユーザー入力の `content` はZodで長さバリデーションのみ。HTMLタグやJavaScriptコードはそのまま保存される。React のJSXはデフォルトでエスケープするが、`dangerouslySetInnerHTML` や Markdown レンダリング時にXSSが発生する可能性がある。

**修正方法:**
- サーバーサイドでHTMLサニタイズ（`DOMPurify` のサーバー版 `isomorphic-dompurify` 等）
- または保存時にHTMLタグをストリップ
- Markdownを使用する場合は `rehype-sanitize` 等を使用

**深刻度:** 🟠 **HIGH** — CSPが `unsafe-inline` なので特に深刻

---

## 🟡 MEDIUM（推奨）

### M-1: ログイン試行のレート制限がない

**ファイル:** `lib/auth.ts` (Credentials provider)

NextAuth の `authorize` 関数内にレート制限がない。攻撃者がブルートフォース攻撃でパスワードを推測できる。`bcryptjs` のハッシュ比較は遅いが（意図的）、それだけではDoS対策として不十分。

**修正方法:**
- ログイン試行にIPベースのレート制限を追加（例：5回失敗で5分ロック）
- アカウントロックアウト機構の検討

---

### M-2: `notifications` PUT エンドポイントの `notificationIds` バリデーション不足

**ファイル:** `app/api/notifications/route.ts`

```typescript
const { notificationIds, markAll } = body;
if (markAll) { ... }
else if (notificationIds && Array.isArray(notificationIds)) {
  await prisma.notification.updateMany({
    where: {
      id: { in: notificationIds },
      userId: session.user.id,  // ← userIdフィルターは存在する
    },
  });
}
```

`notificationIds` の要素が文字列であることのバリデーションがない。配列の長さ制限もない。Zodスキーマが適用されていない。

**修正方法:** Zodスキーマで `z.array(z.string()).max(100)` 等のバリデーションを適用。

---

### M-3: `POST /api/users/progress/track` のバリデーション不足

**ファイル:** `app/api/users/progress/track/route.ts`

```typescript
const { topicId, completed } = await request.json();
if (!topicId || typeof topicId !== "string") { ... }
```

- `completed` のバリデーションなし（任意の値がDB に渡される可能性）
- Zodスキーマが使われていない
- `topicId` に任意の文字列を渡せる（既知のトピックリストとの突合なし）

**修正方法:** Zodスキーマを作成し、`topicId` を enum/whitelist で検証、`completed` は `z.boolean()` で検証。

---

### M-4: `createEvidenceSchema` の `beforeData` / `afterData` が `z.any()`

**ファイル:** `lib/validations/forum.ts`

```typescript
beforeData: z.any().optional(),
afterData: z.any().optional(),
```

任意の構造のデータがDBに保存される。巨大なオブジェクト（数MB）を送信してDBを肥大化させることが可能。

**修正方法:** データサイズの上限を設定（例：JSON.stringify後に50KB以内）、または構造を定義。

---

### M-5: Admin ユーザー編集APIでSelf-Demotion防止なし

**ファイル:** `app/api/admin/users/[id]/route.ts`

管理者が自分自身のロールを `USER` に変更できてしまう。最後の管理者が降格された場合、管理機能にアクセスできるユーザーがいなくなる。

**修正方法:** 自分自身のロール変更を禁止、または最低1名のADMINを維持するチェックを追加。

---

### M-6: VoteButton コンポーネントがコメント投票時に誤ったエンドポイントを使用

**ファイル:** `components/forum/vote-button.tsx`

```typescript
const endpoint = postId
  ? `/api/forum/posts/${postId}/vote`
  : `/api/forum/posts/${commentId}/vote`;  // ← commentId を postId の位置に渡している
```

コメントへの投票時、`commentId` を `[id]` パラメータとして `/api/forum/posts/{commentId}/vote` に送信している。これは意図した動作ではない（投稿のIDではないため404になる可能性が高い）。

**修正方法:** コメント用の投票APIエンドポイントを別途作成するか、既存のエンドポイントにコメント投票の処理を追加。

---

### M-7: `ignoreBuildErrors: true` が本番設定に含まれている

**ファイル:** `next.config.mjs`

```javascript
typescript: {
  ignoreBuildErrors: true,
},
```

TypeScriptエラーが無視されたままデプロイされる。型安全性が保証されない。

**修正方法:** 本番ビルドではエラーを検出して停止するようにする。

---

### M-8: `NEXTAUTH_URL` が本番URL固定

**ファイル:** `.env`

```
NEXTAUTH_URL="https://matrix.10x-dev.tech"
```

ローカル開発時もこのURLが使用される。環境ごとに分離すべき。

---

## 🟢 LOW（あれば良い）

### L-1: `connect-src` が `'self'` のみ — 外部API呼び出し時に問題

CSPの `connect-src 'self'` は、将来的に外部API（Stripe, Google Analytics等）を追加する際にブロックされる。明示的に許可リストを管理する仕組みを整備しておくと良い。

### L-2: ログ出力に `console.error` を使用

本番環境では構造化ログ（pino, winston等）を使用し、エラートラッキングサービス（Sentry等）に連携することが推奨。

### L-3: `poweredByHeader: false` は設定済み — 良い

`X-Powered-By` ヘッダーの無効化は設定されている。

### L-4: セッション有効期間が未設定

NextAuth のデフォルトセッション有効期間（30日）が使用されている。SaaSでは短めの設定（例：7日、idle timeout 2時間）が推奨。

### L-5: Account テーブルの `access_token`, `refresh_token` がプレーンテキスト

OAuth トークンが暗号化されずに保存されている。DBが漏洩した場合、OAuthトークンも漏洩する。

### L-6: パスワードリセット機能が未実装

ユーザーがパスワードを忘れた場合の回復手段がない。パスワード変更は現在のパスワード入力が必須。

### L-7: メール確認機能が未実装

登録時にメールアドレスの所有確認がない。偽のメールアドレスで大量アカウント作成が可能。

---

## 各ルート別コメント

### `/api/auth/register`
- ✅ Zodバリデーション適用
- ✅ bcryptjs ハッシュ（salt rounds: 12）
- ✅ レート制限あり（5回/分/IP）
- 🟠 IPスプーフィング可能（H-2）
- 🟠 ユーザー列挙可能（H-4）
- 🟡 メール確認未実装（L-7）

### `/api/auth/[...nextauth]`
- ✅ NextAuth v5 使用
- ✅ JWTストラテジー
- ✅ bcryptjs によるパスワード比較
- ⚠️ ログイン試行のレート制限なし（M-1）
- ⚠️ ロール情報がJWTにキャッシュ（H-6）

### `/api/forum/posts` (GET)
- ✅ 認証なしで閲覧可能（正しい設計）
- ✅ Zodバリデーション（クエリパラメータ）
- ✅ ページネーション
- ✅ ユーザー固有データ（投票、ブックマーク）はセッションがある場合のみ
- ⚠️ パスワードフィールド等は `select` で除外済み

### `/api/forum/posts` (POST)
- ✅ 認証必須
- ✅ Zodバリデーション
- ✅ レート制限（10回/分/ユーザー）
- 🟠 contentのXSSサニタイズなし（H-7）

### `/api/forum/posts/[id]` (GET)
- ✅ ステータスチェック（PUBLISHED のみ、著者は自分の下書きを閲覧可能）
- ✅ ビューカウントのデバウンス（5分/ユーザー/投稿）
- ⚠️ Prismaクエリが複数回実行される（最適化の余地あり）

### `/api/forum/posts/[id]` (PUT)
- ✅ 認証必須
- ✅ 著者のみ編集可能
- ✅ Zodバリデーション

### `/api/forum/posts/[id]` (DELETE)
- ✅ 認証必須
- ✅ 著者 or MODERATOR/ADMIN が削除可能（ソフトデリート）
- ⚠️ ロールチェックでDBクエリが追加で発行される（セッションのロールとDB上のロールの不整合リスク — ただしセキュリティ上はDB確認の方が安全）

### `/api/forum/posts/[id]/vote`
- ✅ 認証必須
- ✅ Zodバリデーション（value: 1 | -1）
- ✅ トグル・切り替えロジック
- 🟠 レート制限なし（H-3）

### `/api/forum/posts/[id]/comments` (GET)
- ✅ ネストされたリプライの取得
- ✅ 投票スコアの集計
- ⚠️ 3階層まで固定の `include` — 深いネストは取得されない（仕様として許容）

### `/api/forum/posts/[id]/comments` (POST)
- ✅ 認証必須
- ✅ Zodバリデーション
- ✅ レート制限（20回/分/ユーザー）
- ✅ 親コメントの存在確認と投稿IDの一致チェック
- 🟠 contentのXSSサニタイズなし（H-7）

### `/api/forum/posts/[id]/comments` (DELETE)
- ✅ 認証必須
- ✅ 著者のみ削除可能
- ⚠️ 子コメントがある場合のカスケード削除（Prisma スキーマに依存）

### `/api/forum/posts/[id]/react`
- ✅ 認証必須（`requireAuth` 使用）
- ✅ リアクションタイプのホワイトリスト検証
- ✅ トグルロジック
- 🟠 レート制限なし（H-3）

### `/api/forum/posts/[id]/bookmark`
- ✅ 認証必須
- ✅ トグルロジック
- ✅ ユニーク制約による重複防止
- 🟠 レート制限なし（H-3）

### `/api/forum/posts/[id]/evidence`
- ✅ 認証必須
- ✅ Zodバリデーション
- ✅ 投稿の存在・ステータスチェック
- 🟡 `beforeData`/`afterData` が `z.any()`（M-4）
- 🟠 レート制限なし（H-3）
- ⚠️ 誰でもエビデンスを追加可能（著者制限なし）— これは仕様として妥当か要確認

### `/api/forum/ranking/users`
- ✅ 認証必須（`requireAuth` 使用）
- ✅ パスワード等の機密フィールドを除外
- ⚠️ 取得件数が20件固定（ページネーションなし）

### `/api/deepwiki/chat`
- ✅ 認証必須（`requireAuth` 使用）
- ✅ Zodバリデーション（メッセージ構造）
- ✅ ローカルナレッジベース検索（外部API呼び出しなし）
- 🟠 レート制限なし — チャット乱用の可能性（H-3）
- ✅ RegExp のエスケープ処理あり（ReDoS対策）

### `/api/deepwiki/search`
- ✅ 認証必須（`requireAuth` 使用）
- ✅ Zodバリデーション（クエリ最大200文字）
- ✅ RegExp エスケープ処理あり
- 🟠 レート制限なし（H-3）

### `/api/simulator`
- ✅ 認証必須（`requireAuth` 使用）
- ✅ Zodバリデーション
- ✅ GETはユーザー自身のシミュレーションのみ取得
- 🟠 レート制限なし（H-3）
- ⚠️ `z.record(z.unknown())` でinputsのサイズ制限なし

### `/api/notifications` (GET/PUT)
- ✅ 認証必須
- ✅ 自分のデータのみ操作可能（userId フィルター）
- 🟡 PUT の `notificationIds` バリデーション不足（M-2）
- 🟠 レート制限なし（H-3）

### `/api/users/me` (GET/PUT)
- ✅ 認証必須
- ✅ Zodバリデーション（PUT）
- ✅ パスワードフィールドを除外（`select` 使用）
- 🟠 レート制限なし（H-3）
- ⚠️ PUT でユーザーが `role` や `plan` を変更できないことを確認 → `updateProfileSchema` が `name, company, community, bio, website, xHandle, image` のみ許可 → ✅ 安全

### `/api/users/me/password`
- ✅ 認証必須
- ✅ Zodバリデーション（新パスワード強度チェック）
- ✅ 現在のパスワード確認
- ✅ レート制限（5回/時間/ユーザー）
- ✅ bcryptjs ハッシュ（salt rounds: 12）

### `/api/users/me/stats`
- ✅ 認証必須
- ✅ 自分のデータのみ
- ⚠️ 4つの並列クエリ（パフォーマンス最適化済み — `Promise.all`）

### `/api/users/progress`
- ✅ 認証必須
- ✅ アチーブメントの自動付与ロジック
- ⚠️ 多数のDBクエリが発行される（最適化の余地あり）
- ⚠️ `popular_post` のチェックが `findFirst` のみ — 全投稿のチェックではない

### `/api/users/progress/track`
- ✅ 認証必須
- 🟡 バリデーション不足（M-3）
- 🟠 レート制限なし（H-3）

### `/api/admin/stats`
- ✅ Admin認証必須（`requireAdmin` 使用）
- ✅ 並列クエリ（`Promise.all`）

### `/api/admin/users`
- ✅ Admin認証必須
- ✅ パスワードフィールドを除外
- ⚠️ 検索クエリのサニタイズ → Prisma の `contains` はパラメータ化されるため、SQLインジェクションは安全

### `/api/admin/users/[id]`
- ✅ Admin認証必須
- ✅ `role` と `plan` のホワイトリストチェック
- 🟡 Self-Demotion防止なし（M-5）

### `/api/admin/posts`
- ✅ Admin認証必須
- ✅ ステータス・カテゴリのホワイトリストチェック

### `/api/admin/posts/[id]`
- ✅ Admin認証必須
- ✅ フィールドのホワイトリストチェック（`isPinned`, `isVerified`, `status`）

### `/api/admin/content`
- ✅ Admin認証必須
- ✅ Zodバリデーション
- ✅ impact の enum チェック

### `/api/og/[postId]`
- 🔴 認証なし（C-3）
- 🔴 レート制限なし（C-3）
- ✅ PUBLISHED ステータスのみ表示
- ⚠️ CPU集約的な `ImageResponse` レンダリング

### `middleware.ts`
- ✅ NextAuth v5 の `auth` を使用
- ✅ 公開パスの明示的なホワイトリスト
- ✅ Admin ルートのロールチェック
- ✅ 静的アセットのバイパス
- ⚠️ `/api/auth` へのリクエストが全て許可（`pathname.startsWith("/api/auth")` → 登録エンドポイント含む）— ただし登録には個別のレート制限あり

### `lib/auth.ts`
- ✅ PrismaAdapter 使用
- ✅ JWT ストラテジー
- ✅ Google OAuth の条件付き追加
- ✅ bcryptjs でパスワード比較
- ⚠️ OAuth ユーザーのパスワードが `null`（`user.password` のチェックあり — 安全）

### `lib/auth.config.ts`
- ✅ コールバックでロール情報をJWTに含める
- ✅ `authorized` コールバックで認可チェック
- ⚠️ Edge ランタイムで Prisma を使わない設計 — 良い

### `lib/api-helpers.ts`
- ✅ `requireAuth` / `requireAdmin` ヘルパー
- ✅ エラーハンドリング（内部エラーの詳細を隠蔽）
- ✅ `ApiError` クラスでステータスコードを管理

### `lib/rate-limit.ts`
- 🟠 インメモリ実装（H-1）
- ⚠️ メモリリークの可能性（クリーンアップなし）

### `lib/db.ts`
- ✅ グローバルシングルトンパターン（開発モードのホットリロード対策）

### `prisma/schema.prisma`
- ✅ カスケード削除の適切な設定
- ✅ ユニーク制約（`userId_postId` 等）
- ✅ デフォルト値の設定
- ⚠️ SQLite 使用 — 本番では PostgreSQL への移行推奨（スキーマコメントに記載あり）

### `next.config.mjs`
- ✅ `poweredByHeader: false`
- ✅ セキュリティヘッダー（X-Frame-Options, HSTS等）
- 🔴 CSP に `unsafe-eval` と `unsafe-inline`（C-2）
- 🟡 `ignoreBuildErrors: true`（M-7）

---

## コードレビュー — フロントエンド

### `app/dashboard/layout.tsx`
- ✅ レスポンシブ対応（デスクトップサイドバー + モバイルシート）
- ✅ 通知のポーリング（30秒間隔）
- ✅ 一括既読機能
- ⚠️ サイドバーのプラン表示が「Free プラン」にハードコード — 実際のプランを反映すべき
- ⚠️ `signOut` は `next-auth/react` の `signOut` を使用 — 正しい

### `app/dashboard/page.tsx`
- ✅ `Promise.all` 相当の並列データ取得は不要（単一APIコール `/api/users/progress`）
- ✅ アチーブメント解除の通知トースト（5秒自動消滅）
- ✅ ローディングスケルトン
- ✅ 学習トピックのリンク先が適切にマッピング
- ⚠️ `DEFAULT_PROGRESS` のフォールバックデータが大きい — サーバーコンポーネントでの初期データ取得を検討
- ⚠️ `recentUpdates` がハードコード — APIから取得すべき（`/api/admin/content` にデータあり）

### `app/dashboard/explore/page.tsx`
- ✅ パイプラインアニメーションの実装が丁寧
- ✅ `clearAllTimers` による適切なクリーンアップ
- ✅ SVGのアクセシビリティ（ラベル付きノード）
- ⚠️ インライン `<style>` タグの使用 — CSS Module または globals.css への移動推奨
- ⚠️ `_setExpandedStage` — 未使用のsetter（`expandedStage` は常に `null` のため、展開詳細セクションが表示されない）
- ⚠️ ファイルが1400行超 — コンポーネント分割推奨

### `app/dashboard/forum/page.tsx`
- ✅ カテゴリフィルタリング・検索・ソート機能
- ✅ 無限スクロール（Load More）
- ✅ ブックマークフィルター
- ✅ サイドバーにプロフィールプレビュー
- ⚠️ `/api/users/me` のレスポンスに `_count` フィールドが含まれていない — サイドバーの投稿数・コメント数が常に0になる可能性
- ⚠️ `useTransition` の使用が適切（Load More 時のUI更新）

### `components/forum/comment-section.tsx`
- ✅ ネストされたコメントの再帰的レンダリング
- ✅ オプティミスティックUIなし（削除のみ即時反映）
- ✅ 深度制限（3階層まで返信可能）
- ✅ コメント削除機能（著者のみ）
- ✅ `addReplyToTree` / `removeCommentFromTree` の再帰的な状態更新

### `components/forum/vote-button.tsx`
- ✅ オプティミスティックアップデート
- ✅ エラー時のリバート
- 🟡 コメント投票のエンドポイントが誤り（M-6）

### `components/plan-gate.tsx`
- 🟠 クライアントサイドのみのプランチェック（H-5）
- ✅ UIは適切（ブラー表示で有料コンテンツを暗示）
- ⚠️ 現在は「開発中」メッセージに変更済み — 有料プランの実装前のプレースホルダーとして許容

---

## 判定

- [ ] PASS — ローンチ可能
- [x] NEEDS_CHANGES — 修正後に再レビュー
- [ ] FAIL — 重大な問題あり

### 判定理由

本プロジェクトは全体的な設計方針は適切で、Zodによるバリデーション、PrismaによるSQLインジェクション防止、NextAuth v5 のJWT認証など、基本的なセキュリティプラクティスは守られています。

しかし、**本番デプロイ前に修正必須の問題が3件（CRITICAL）、7件（HIGH）存在します**：

1. **🔴 シークレット鍵のハードコード** — JWT偽造のリスク
2. **🔴 CSP の `unsafe-eval`** — XSS対策の無効化
3. **🔴 OGPエンドポイントのDoS脆弱性** — 認証・レート制限なし
4. **🟠 レート制限がインメモリ** — 本番環境で機能しない
5. **🟠 IPスプーフィングによるレート制限回避**
6. **🟠 大半のAPIルートにレート制限なし**
7. **🟠 ユーザー列挙攻撃が可能**
8. **🟠 有料機能のアクセス制御がクライアントサイドのみ**
9. **🟠 JWTのロール情報がキャッシュされ降格が即時反映されない**
10. **🟠 ユーザー入力のXSSサニタイズなし**

**CRITICAL 3件と HIGH の H-5（課金バイパス）は最低限修正してからデプロイしてください。**

---

## 推奨修正優先順位

| 優先度 | チケット | 見積もり工数 |
|--------|----------|-------------|
| 1 | C-1: `.env` のシークレット強化 | 30分 |
| 2 | C-2: CSP の `unsafe-eval`/`unsafe-inline` 削除 | 2時間 |
| 3 | C-3: OGPエンドポイントにレート制限追加 | 30分 |
| 4 | H-1: Redis ベースのレート制限に移行 | 4時間 |
| 5 | H-5: サーバーサイドのプランチェック追加 | 2時間 |
| 6 | H-7: XSSサニタイズの追加 | 2時間 |
| 7 | H-3: 全APIルートにレート制限追加 | 3時間 |
| 8 | H-4: ユーザー列挙の防止 | 1時間 |
| 9 | H-2: IPスプーフィング対策 | 1時間 |
| 10 | H-6: Admin操作時のリアルタイムロール確認 | 2時間 |
