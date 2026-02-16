# Task 1: OGP画像生成API実装

**担当**: テツ（DEV_LEAD）
**期限**: 即日
**優先度**: 高

---

## 目的

matri-xのシェア機能強化のため、X（Twitter）シェア時に表示される動的OGP画像を生成するAPIを実装する。

---

## 技術要件

### 依存関係追加

`package.json`に以下を追加:

```json
{
  "dependencies": {
    "@vercel/og": "^0.6.3"
  }
}
```

インストール後、`npm install`実行。

---

## 実装ファイル

### 1. `/app/api/og/share/[type]/route.ts`

4種類のコンテンツタイプに対応:
- `deepwiki` - DeepWiki記事
- `simulator` - シミュレーター結果
- `forum` - フォーラム投稿
- `ticket` - 開発チケット

**エンドポイント例**:
- `GET /api/og/share/deepwiki?id=123&title=Heavy+Ranker+Explained`
- `GET /api/og/share/simulator?id=456&score=8.2`
- `GET /api/og/share/forum?id=789&title=Best+posting+times`
- `GET /api/og/share/ticket?id=012&status=in-progress`

**実装例**:

```typescript
import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(
  req: NextRequest,
  { params }: { params: { type: string } }
) {
  const { searchParams } = new URL(req.url)
  const type = params.type
  const id = searchParams.get('id')
  const title = searchParams.get('title') || 'matri-x'
  const score = searchParams.get('score')
  const status = searchParams.get('status')

  // 型ごとのスタイル分岐
  let bgColor = '#1a1a1a' // ダークグレー
  let accentColor = '#a3e635' // ライムグリーン（tailwind lime-400）
  let icon = '📊'
  let subtitle = ''

  switch (type) {
    case 'deepwiki':
      icon = '📚'
      subtitle = 'X Algorithm Deep Dive'
      break
    case 'simulator':
      icon = '⚡'
      subtitle = `TweepCred Score: ${score || 'N/A'}`
      break
    case 'forum':
      icon = '💬'
      subtitle = 'Community Discussion'
      break
    case 'ticket':
      icon = '🎫'
      subtitle = status ? `Status: ${status}` : 'Development Ticket'
      break
    default:
      subtitle = 'X Algorithm Research Platform'
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          backgroundColor: bgColor,
          padding: '60px 80px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ fontSize: 72 }}>{icon}</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontSize: 32,
                color: accentColor,
                fontWeight: 700,
                letterSpacing: '-0.02em',
              }}
            >
              matri-x
            </div>
            <div style={{ fontSize: 20, color: '#9ca3af' }}>{subtitle}</div>
          </div>
        </div>

        {/* Main Content */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: 'white',
            lineHeight: 1.2,
            maxWidth: '900px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {title}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div style={{ fontSize: 24, color: '#6b7280' }}>
            matri-x-algo.wiki
          </div>
          <div
            style={{
              fontSize: 20,
              color: accentColor,
              backgroundColor: 'rgba(163, 230, 53, 0.1)',
              padding: '8px 16px',
              borderRadius: '8px',
            }}
          >
            Free 3-Month Trial
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, max-age=604800, immutable', // 1週間キャッシュ
      },
    }
  )
}
```

---

## キャッシュ戦略

### 現時点（Phase 1）
- Vercel Edge Functions の自動キャッシュを利用
- `Cache-Control: public, max-age=604800, immutable` で1週間キャッシュ
- 同じURL（type + id + title）へのリクエストはエッジで即座に返す

### 将来対応（Phase 2以降）
- Vercel KV（Redis）でキャッシュ管理
- 画像生成回数の上限チェック
- 動的に画像を更新する必要がある場合（アルゴリズム更新等）にキャッシュクリア

---

## 動作確認

### 1. ローカルテスト

```bash
npm run dev
# ブラウザで以下にアクセス:
# http://localhost:3000/api/og/share/deepwiki?id=1&title=Heavy+Ranker+Deep+Dive
```

### 2. メタタグ確認

以下のような`<meta>`タグを任意のページ（例: `/deepwiki/[id]/page.tsx`）に追加して確認:

```tsx
export async function generateMetadata({ params }: { params: { id: string } }) {
  // DBから記事データ取得
  const article = await getArticleById(params.id)
  
  const ogImageUrl = `https://matri-x-algo.wiki/api/og/share/deepwiki?id=${params.id}&title=${encodeURIComponent(article.title)}`

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [ogImageUrl],
      url: `https://matri-x-algo.wiki/deepwiki/${params.id}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: [ogImageUrl],
    },
  }
}
```

### 3. X Card Validator

実装後、以下でプレビュー確認:
- https://cards-dev.x.com/validator

---

## 注意事項

### Edge Runtime必須
- `export const runtime = 'edge'` を必ず指定
- Edge Functionsでないと画像生成が重くサーバータイムアウトする

### 画像サイズ
- 1200x630px（X推奨サイズ）
- ファイルサイズは自動で最適化される

### エラーハンドリング
- 不正なパラメータ（id不正、type不正）の場合、デフォルト画像を返す
- エラーログは最小限に（Vercel Functionsのログコストに注意）

---

## 次のタスクとの連携

**Task 2（ShareButton）**で以下のように使用:

```tsx
// components/share-button.tsx
const shareUrl = `https://matri-x-algo.wiki/deepwiki/${articleId}`
const tweetText = `matri-xでXアルゴリズムを学習中 | ${article.title}`
const xIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`

// OGP画像は自動で取得される（ページのmetadataから）
```

---

## 完了条件

- [ ] `@vercel/og` を `package.json` に追加＆インストール
- [ ] `/app/api/og/share/[type]/route.ts` 実装
- [ ] 4種類（deepwiki/simulator/forum/ticket）すべてで動作確認
- [ ] ローカル（`npm run dev`）で画像生成確認
- [ ] コードレビュー（型安全性・エラーハンドリング）
- [ ] git commit（コミットメッセージ: `feat: OGP image generation API for share feature`）

---

**開始していいですか？質問があれば先に聞いてください。**
