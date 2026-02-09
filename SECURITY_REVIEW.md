# matri-x セキュリティレビュー

**日付**: 2026/2/10
**レビュアー**: クロー（手動レビュー）
**判定**: WARN（警告あり、致命的問題なし）

---

## Critical（即修正必須）
なし

## Warning（改善推奨）

### W1. レート制限なし
- **対象**: 全APIエンドポイント
- **リスク**: ブルートフォース攻撃（特にログイン/登録）、DoS
- **修正方法**: `next-rate-limit` or カスタムミドルウェアで制限追加
  - `/api/auth/register`: 5回/分
  - `/api/auth/[...nextauth]`: 10回/分
  - 一般API: 60回/分
- **優先度**: 本番デプロイ前に必須

### W2. try-catch不足のAPIルート
- **対象**: 
  - `app/api/admin/stats/route.ts`
  - `app/api/admin/users/route.ts`
  - `app/api/admin/posts/route.ts`
  - `app/api/admin/content/route.ts`
  - `app/api/users/me/route.ts`
  - `app/api/users/me/password/route.ts`
- **リスク**: 未処理例外でスタックトレースが漏洩する可能性
- **修正方法**: 全ハンドラーをtry-catchで囲み、500エラーを返す

### W3. 入力バリデーション不足のPOSTエンドポイント
- **対象**:
  - `app/api/admin/content/route.ts`（POST）
  - `app/api/simulator/route.ts`（POST）
  - `app/api/deepwiki/chat/route.ts`（POST）
  - `app/api/deepwiki/search/route.ts`（POST）
  - `app/api/forum/posts/[id]/bookmark/route.ts`（POST）
- **リスク**: 不正な入力データによるDBエラー、型エラー
- **修正方法**: Zodスキーマを追加

### W4. `as any` 型アサーション
- **対象**: admin系API全6ファイルの `(session.user as any).role`
- **リスク**: 型安全性の低下
- **修正方法**: NextAuth型定義を拡張（types/next-auth.d.ts → 作成済み）

### W5. CSRF対策
- **状態**: NextAuth v5はデフォルトでCSRFトークンを処理
- **補足**: カスタムAPIルートにはCSRF保護なし。SameSite cookieとOriginヘッダーチェックを推奨

## Info（参考）

### I1. パスワードハッシュ ✅
- bcryptjs使用、salt rounds = 12（適切）

### I2. 認証チェック ✅
- 保護が必要な全APIで `auth()` 呼び出しあり
- `/api/auth/register` と `/api/auth/[...nextauth]` は意図的に公開

### I3. ADMIN権限チェック ✅
- `/api/admin/*` の全ルートでADMINロールチェックあり

### I4. SQLインジェクション ✅
- Prisma ORM使用、生SQLクエリなし（安全）

### I5. XSS ✅
- React/Next.jsのデフォルトエスケープで基本対策済み
- ユーザー入力はAPIレスポンスとして返されるがJSONフォーマット

### I6. センシティブ情報ログ出力 ✅
- パスワード/トークンのconsole.log出力なし

### I7. 環境変数 ✅
- シークレットは.envファイルに分離、ハードコードなし
