# matri-x シェア機能実装計画

作成日: 2026-02-16

## 概要

matri-xのバイラル成長を促進するシェア機能実装計画。X運用代行業者をターゲットに、自社Xアカウントでのシェアを促進し、自然な流入を獲得する。

---

## Phase 1: 基盤構築（Week 1-2）

### 1.1 OGP画像生成システム

**目的**: シェア時の視認性・CTR最大化

**実装内容**:
- 動的OGP画像生成エンドポイント（Next.js API Route + @vercel/og）
- テンプレート設計:
  - ダークグレー/ライムグリーン配色（ブランド統一）
  - シェア元ユーザー名・アイコン表示（属人性）
  - コンテンツプレビュー（DeepWiki記事タイトル、シミュレーター結果スコア等）
  - matri-xロゴ + "X Algorithm Research Platform"

**技術スタック**:
```typescript
// /api/og/share/[type]/route.ts
import { ImageResponse } from '@vercel/og'

// type: deepwiki | simulator | forum | ticket
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const id = searchParams.get('id')
  const userName = searchParams.get('user')
  
  // DB or APIから対象データ取得
  // OGP画像生成（1200x630px）
  return new ImageResponse(...)
}
```

**meta tags設定**:
- `og:title`, `og:description`, `og:image`, `og:url`
- `twitter:card`, `twitter:image`
- 動的生成（コンテンツ種別ごとにカスタマイズ）

---

### 1.2 LINE友達追加導線

**目的**: X流入ユーザーをLINE公式アカウントに誘導 → 教育 → 有料プラン転換

**実装内容**:
- シェアボタン横に「LINE登録で限定情報」CTA設置
- LINE友達追加ページ（/line-add）:
  - QRコード + 友達追加ボタン
  - 登録特典の明示（例: 「X運用代行者向け限定レポート3本」）
  - UTM付きトラッキング（`utm_source=matri-x&utm_medium=share&utm_campaign=line_add`）

**LINE運用フロー**:
1. 友達追加 → 自動応答: 「matri-xご登録ありがとうございます！限定レポートをお送りします」
2. ステップ配信（3通 / 3日間）:
   - Day 1: X運用代行の成功事例 + matri-x活用法
   - Day 2: アルゴリズム解析レポート（無料版の限界を示唆）
   - Day 3: 有料プラン（Pro ¥2,980/月）案内 + 初月50%OFFクーポン
3. セグメント配信:
   - 無料プラン継続 → アルゴリズム更新通知、ブログ更新
   - 有料プラン検討中 → 成功事例、ケーススタディ
   - 有料プラン加入済み → 上級テクニック、プレミアムコンテンツ

**UTAGE連携**:
- LINEリッチメニュー → UTAGEランディングページ誘導
- シナリオ例: 「X運用代行者向けオンボーディング」

---

## Phase 2: A/Bテスト・最適化（Week 3-4）

### 2.1 シェアボタン配置A/Bテスト

**仮説**: ボタン配置によってシェア率が変化する

**テストパターン**:
- **A（現行）**: 記事下部のみ
- **B（案1）**: 記事上部 + 記事下部
- **C（案2）**: 記事上部 + 記事下部 + サイドバー固定（スクロール追従）
- **D（案3）**: 記事中央（読了50%地点）+ 記事下部

**計測指標**:
- シェアボタンクリック率（CTR）
- 実際のシェア完了率（conversion）
- シェア経由の新規訪問数（UTMトラッキング）
- 新規登録CVR（シェア流入 vs オーガニック）

**実装**:
- 訪問者をランダムに4グループに分割（25%ずつ）
- Cookie/localStorage でグループID保持（再訪時も同じパターン表示）
- イベントトラッキング（Vercel Analytics or Google Analytics 4）

**判定基準**:
- 最低サンプル数: 各グループ1,000PV以上
- 統計的有意差: p < 0.05
- 勝者パターンを全体展開

---

### 2.2 シェア文言最適化

**仮説**: デフォルトシェア文言によってエンゲージメントが変化する

**テストパターン**:
- **A（現行）**: 「matri-xでXアルゴリズムを学習中 | [記事タイトル]」
- **B（価値訴求）**: 「X運用代行で成果を出すために、このアルゴリズム解説は必読 | [記事タイトル]」
- **C（疑問形）**: 「あなたのXアカウント、アルゴリズムに嫌われてませんか？ | [記事タイトル]」
- **D（実績訴求）**: 「月間100万imp達成した運用者が使うツール | [記事タイトル]」
- **E（緊急性）**: 「【2026年最新】X APIアルゴリズム変更対応版 | [記事タイトル]」

**計測指標**:
- インプレッション（シェアポストの表示回数）
- エンゲージメント率（いいね/リポスト/リプライ/クリック）
- クリックスルー率（CTR: クリック数 / インプレッション）
- コンバージョン率（新規登録数 / クリック数）

**実装**:
- X API v2 Analytics（/2/tweets/analytics）で計測
- 各パターン50ポスト以上でテスト
- 勝者パターンをデフォルト設定

---

## Phase 3: リスク対策・規約遵守

### 3.1 シェアインセンティブ設計の注意点

**X利用規約上のNG行為**:
- ❌ シェアで報酬付与（例: 「シェアで500円クーポン」）
- ❌ フォロー強制（例: 「フォロー必須でシェア可能」）
- ❌ 自動シェア（例: ユーザー同意なしに勝手にポスト）

**セーフな施策**:
- ✅ シェアボタンを設置（ユーザーの自発的な行動を促す）
- ✅ シェア文言をプリセット（ユーザーが編集可能）
- ✅ LINE登録特典（シェアとは無関係、別の導線）
- ✅ 「シェアしていただけると嬉しいです」程度の表現

**実装方針**:
- シェアボタンは「Web Share API」または「X Intent URL」を使用
- ユーザーが明示的にボタンクリック → X公式UIで投稿確認画面 → 手動で投稿
- 自動投稿は一切行わない

---

### 3.2 スパム対策

**懸念**: 同一ユーザーによる過剰シェア → Xアカウント凍結リスク

**対策**:
- 同一ユーザーが同一コンテンツを1日3回以上シェア → 警告表示
  - 「このコンテンツは既にシェア済みです。過度なシェアはXアカウントの凍結リスクがあります」
- シェアレート制限（同一ユーザー: 1日10回まで）
- ボット検知（異常な短時間連続シェア → CAPTCHA表示）

**実装**:
```typescript
// /api/share/track/route.ts
import { ratelimit } from '@/lib/redis'

export async function POST(req: Request) {
  const userId = req.headers.get('x-user-id')
  const contentId = req.body.contentId
  
  // レート制限チェック（Redis）
  const { success } = await ratelimit.limit(`share:${userId}:${contentId}`, {
    interval: '1d',
    limit: 3
  })
  
  if (!success) {
    return Response.json({ error: 'Share limit exceeded' }, { status: 429 })
  }
  
  // シェアイベント記録（Analytics）
  await logShareEvent({ userId, contentId, timestamp: Date.now() })
  
  return Response.json({ success: true })
}
```

---

### 3.3 OGP画像キャッシュ・パフォーマンス

**課題**: OGP画像生成は重い処理 → サーバー負荷・レスポンス遅延

**対策**:
- Vercel Edge Functions（エッジキャッシュ）活用
- 生成済み画像をCDNキャッシュ（1週間）
- 画像生成時にユーザー情報を含めない（汎用性を保つ → キャッシュヒット率向上）
  - 悪: `/og?user=yuma&content=deepwiki-123` → 1,000ユーザー × 100コンテンツ = 100,000パターン
  - 良: `/og?type=deepwiki&id=123` → 100コンテンツのみ（ユーザー名はX側で付与）

**実装**:
```typescript
export const runtime = 'edge'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const cacheKey = `og:${searchParams.get('type')}:${searchParams.get('id')}`
  
  // Vercel KV Cacheチェック
  const cached = await kv.get(cacheKey)
  if (cached) {
    return new Response(cached, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=604800, immutable'
      }
    })
  }
  
  // 生成 → キャッシュ保存
  const image = await generateOGImage(...)
  await kv.set(cacheKey, image, { ex: 604800 })
  
  return new Response(image, ...)
}
```

---

## Phase 4: トラッキング・分析基盤

### 4.1 シェア分析ダッシュボード

**管理者向け**:
- 総シェア数（日次/週次/月次）
- シェア経由の新規訪問数（UTM: `utm_source=twitter&utm_medium=share`）
- シェア経由のコンバージョン率（無料登録 / 有料プラン）
- 人気コンテンツランキング（シェア数順）
- バイラル係数（Viral Coefficient）:
  - K = (既存ユーザー数 × シェア率 × シェア経由CVR)
  - K > 1 → 指数関数的成長

**実装**:
- Vercel Analytics + カスタムイベント
- `/dashboard/analytics/share` ページ（ADMIN限定）
- グラフ: Recharts（日次シェア数、流入元内訳、コンバージョンファネル）

---

### 4.2 ユーザー別シェア履歴

**目的**: アンバサダー候補の発見

**トラッキング内容**:
- ユーザーごとのシェア数・頻度
- シェアしたコンテンツ種別（DeepWiki / シミュレーター / フォーラム）
- シェア経由の新規登録数（リファラル追跡）

**活用例**:
- 月間シェア数TOP10ユーザー → 「matri-xアンバサダー」認定
- 特典: 有料プラン永久無料 / 限定コンテンツアクセス / 専用Discord招待
- さらなる拡散促進（アンバサダー自身がインフルエンサー化）

---

## Phase 5: 運用・改善サイクル

### 5.1 週次レビュー

**チェック項目**:
- [ ] A/Bテスト結果確認 → 勝者パターン採用
- [ ] シェア経由CVR（無料登録 / 有料プラン）
- [ ] アンバサダー候補リストアップ
- [ ] OGP画像のCTR（X Analytics API）
- [ ] LINE友達追加数・ステップ配信開封率

**KPI目標（Phase 1完了時点）**:
- シェアボタンCTR: 5%以上
- シェア経由の新規訪問: 週100人以上
- LINE友達追加: 週30人以上
- バイラル係数K: 0.5以上（1.0目標）

---

### 5.2 改善サイクル

**PDCA**:
1. **Plan**: A/Bテスト仮説設計（新しいシェア文言・配置・デザイン）
2. **Do**: 1週間テスト実施
3. **Check**: データ分析（CTR・CVR・エンゲージメント）
4. **Action**: 勝者パターン全体展開 → 次の仮説へ

**長期的な施策**:
- シェアランキング公開（「今週最もシェアされた記事TOP5」）
- ユーザー生成コンテンツ促進（「あなたの運用ノウハウをmatri-xで共有しませんか？」）
- コミュニティ形成（Discord「matri-xユーザー会」）

---

## 技術スタック・依存関係

### 必須ライブラリ
- `@vercel/og` — OGP画像生成
- `redis` or `@vercel/kv` — レート制限・キャッシュ
- `@vercel/analytics` — イベントトラッキング
- `next-seo` — 動的meta tags生成

### 外部サービス
- **X API v2** — シェアポスト分析（/2/tweets/analytics）
- **LINE Messaging API** — 友達追加・ステップ配信
- **UTAGE** — LINE × メール統合ファネル
- **Google Analytics 4** — クロスチャネル分析

---

## リスクマトリクス

| リスク | 発生確率 | 影響度 | 対策 |
|--------|----------|--------|------|
| X規約違反（シェア強制と誤認） | 低 | 高 | 明示的な「自発的シェア」UI設計、自動投稿禁止 |
| OGP画像生成負荷でサーバーダウン | 中 | 中 | Edge Functions + KVキャッシュ、画像圧縮 |
| シェア文言が炎上 | 低 | 高 | A/Bテスト時に手動レビュー、誇大表現禁止 |
| LINE友達ブロック率が高い | 中 | 中 | ステップ配信の価値訴求を強化、配信頻度調整 |
| バイラル係数K < 0.1（拡散しない） | 中 | 中 | シェアインセンティブ再設計、コンテンツ品質向上 |

---

## 次のアクション

### Week 1（今週中）
- [ ] OGP画像生成API実装（`/api/og/share/[type]`）
- [ ] シェアボタンコンポーネント作成（`ShareButton.tsx`）
- [ ] UTMトラッキング設定（GA4 or Vercel Analytics）
- [ ] LINE友達追加ページ作成（`/line-add`）

### Week 2
- [ ] A/Bテスト基盤構築（ボタン配置4パターン）
- [ ] Redis レート制限実装（1日3回/コンテンツ、10回/ユーザー）
- [ ] シェアイベントログDB設計（Prisma schema）

### Week 3-4
- [ ] A/Bテスト実施・データ収集
- [ ] 勝者パターン採用・全体展開
- [ ] アンバサダー候補リストアップ（TOP10ユーザー）

---

## 参考資料

- [X Developer Platform - Tweet Analytics](https://developer.x.com/en/docs/x-api/tweets/analytics/introduction)
- [Vercel OG Image Generation](https://vercel.com/docs/functions/og-image-generation)
- [LINE Messaging API - Rich Menu](https://developers.line.biz/ja/docs/messaging-api/using-rich-menus/)
- [Growth Hacking: Viral Coefficient 計算式](https://andrewchen.com/viral-coefficient/)

---

**最終更新**: 2026-02-16 by クロー 🦅
