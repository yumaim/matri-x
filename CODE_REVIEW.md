# matri-x コードレビュー

**日付**: 2026/2/10
**レビュアー**: クロー（手動レビュー）
**判定**: APPROVED（軽微な改善推奨あり）

---

## Bug（バグ）
なし（ビルドパス済み、ロジックエラーなし）

## Improvement（改善）

### I1. 認証チェックのDRY化
- **対象**: 25箇所の `const session = await auth()` + 7箇所のADMINチェック
- **修正案**: 共通ヘルパー関数を作成
```typescript
// lib/api-helpers.ts
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new ApiError(401, "Unauthorized");
  return session;
}
export async function requireAdmin() {
  const session = await requireAuth();
  if (session.user.role !== "ADMIN") throw new ApiError(403, "Forbidden");
  return session;
}
```
- **優先度**: 中（動作に問題はないが保守性向上）

### I2. try-catch統一
- **対象**: admin系API、users/me系API
- **修正案**: 全ハンドラーにtry-catch追加 or エラーバウンダリミドルウェア
- **優先度**: 中

### I3. 型安全性（`as any` → 型定義）
- **対象**: admin系API 7箇所
- **状態**: `types/next-auth.d.ts` 作成済み → `as any` を `session.user.role` に置換可能
- **優先度**: 低（型定義追加で解決）

### I4. Zodバリデーション追加
- **対象**: POST/PUTで未バリデーションの5エンドポイント
- **修正案**: lib/validations/ にスキーマ追加
- **優先度**: 中

## Nit（軽微）

### N1. 一貫した日本語エラーメッセージ
- 一部英語（"Forbidden", "Unauthorized"）、一部日本語（"このメールアドレスは既に登録されています"）
- 統一推奨（ユーザー向け=日本語、内部=英語）

### N2. APIレスポンス形式の統一
- 成功時: `{ data: ... }` で統一するとフロントが楽
- 現状: ルートによって形式がバラバラ

### N3. ページネーションの統一
- フォーラムAPIは `?page=&limit=` パターン
- admin APIも同様だが、totalCount等の返し方が微妙に違う
- 共通のpaginateヘルパーを検討

---

## 総評
MVP品質としては十分。致命的なバグやセキュリティ問題はない。
本番デプロイ前にW1（レート制限）とI1（DRY化）を対応すれば安心。
