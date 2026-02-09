# matri-x 開発仕様書

## プロジェクト概要
**matri-x** — X(旧Twitter)アルゴリズム解析プラットフォーム
会員型Webサービス。X運用代行業者・マーケターが集まり、アルゴリズムの仮説検証を行うコミュニティ×分析ツール。

## ターゲット
- X運用代行業者
- SNSマーケター
- 企業のSNS担当者

## ビジネスモデル
- Phase 1（ローンチ〜3ヶ月）: メール登録で全機能無料
- Phase 2: Free / Standard(¥980/月) / Pro(¥2,980/月) 段階課金
- PLG戦略: 無料で価値体験 → コミュニティで定着 → 有料転換

---

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| フレームワーク | Next.js 16 (App Router) |
| 言語 | TypeScript |
| UI | TailwindCSS 3 + shadcn/ui |
| 認証 | NextAuth.js v5 (Auth.js) |
| DB | Supabase (PostgreSQL) |
| ORM | Prisma |
| ホスティング | VPS (Docker) or Vercel |
| 決済 | Stripe (Phase 2) |
| チャート | Recharts (既存) |
| メール | Resend or Supabase |
| リアルタイム | Supabase Realtime |

---

## ディレクトリ構成

```
matri-x/
├── app/
│   ├── (auth)/              # 認証ページ群
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── verify-email/
│   ├── (marketing)/          # 公開ページ（LP）
│   │   ├── page.tsx          # トップページ（既存）
│   │   ├── pricing/
│   │   └── about/
│   ├── dashboard/            # 会員向けダッシュボード（既存）
│   │   ├── page.tsx
│   │   ├── explore/          # パイプライン探索
│   │   ├── simulator/        # TweepCredシミュレーター
│   │   ├── engagement/       # エンゲージメント分析
│   │   ├── deepwiki/         # AI検索
│   │   ├── forum/            # 検証コミュニティ
│   │   ├── updates/          # アルゴリズム更新情報
│   │   ├── profile/          # プロフィール設定
│   │   └── settings/         # アカウント設定
│   ├── admin/                # 管理画面
│   │   ├── page.tsx          # ダッシュボード
│   │   ├── users/            # ユーザー管理
│   │   ├── posts/            # 投稿管理・モデレーション
│   │   ├── analytics/        # サービス分析
│   │   ├── content/          # コンテンツ管理
│   │   ├── settings/         # サービス設定
│   │   └── layout.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/
│   │   ├── users/
│   │   ├── forum/
│   │   ├── simulator/
│   │   └── admin/
│   └── layout.tsx
├── components/
│   ├── layout/               # 既存
│   ├── sections/             # 既存（LP用）
│   ├── ui/                   # shadcn/ui
│   ├── dashboard/            # ダッシュボード共通
│   ├── forum/                # フォーラム専用
│   └── admin/                # 管理画面専用
├── lib/
│   ├── utils.ts              # 既存
│   ├── auth.ts               # NextAuth設定
│   ├── db.ts                 # Prisma client
│   ├── supabase.ts           # Supabase client
│   └── validations/          # Zodスキーマ
├── prisma/
│   └── schema.prisma         # DBスキーマ
├── hooks/
├── types/
└── middleware.ts              # 認証ミドルウェア
```

---

## DBスキーマ (Prisma)

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  role          Role      @default(USER)
  plan          Plan      @default(FREE)
  company       String?
  bio           String?
  website       String?
  xHandle       String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts      Account[]
  sessions      Session[]
  posts         ForumPost[]
  comments      Comment[]
  votes         Vote[]
  simulations   Simulation[]
  bookmarks     Bookmark[]
}

enum Role {
  USER
  MODERATOR
  ADMIN
}

enum Plan {
  FREE
  STANDARD
  PRO
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model ForumPost {
  id          String      @id @default(cuid())
  title       String
  content     String
  category    PostCategory
  tags        String[]
  authorId    String
  isPinned    Boolean     @default(false)
  isVerified  Boolean     @default(false)   // 検証済みマーク
  status      PostStatus  @default(PUBLISHED)
  viewCount   Int         @default(0)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  author      User        @relation(fields: [authorId], references: [id])
  comments    Comment[]
  votes       Vote[]
  bookmarks   Bookmark[]
  evidence    Evidence[]  // 検証エビデンス
}

enum PostCategory {
  ALGORITHM     // アルゴリズム解説
  VERIFICATION  // 現場検証
  STRATEGY      // 戦略・Tips
  UPDATES       // 最新アップデート
  QUESTIONS     // 質問・相談
}

enum PostStatus {
  DRAFT
  PUBLISHED
  FLAGGED
  REMOVED
}

model Comment {
  id        String   @id @default(cuid())
  content   String
  authorId  String
  postId    String
  parentId  String?   // ネストリプライ
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  author    User     @relation(fields: [authorId], references: [id])
  post      ForumPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  parent    Comment? @relation("CommentReplies", fields: [parentId], references: [id])
  replies   Comment[] @relation("CommentReplies")
  votes     Vote[]
}

model Vote {
  id        String   @id @default(cuid())
  value     Int      // +1 or -1
  userId    String
  postId    String?
  commentId String?
  createdAt DateTime @default(now())

  user      User      @relation(fields: [userId], references: [id])
  post      ForumPost? @relation(fields: [postId], references: [id], onDelete: Cascade)
  comment   Comment?  @relation(fields: [commentId], references: [id], onDelete: Cascade)

  @@unique([userId, postId])
  @@unique([userId, commentId])
}

model Evidence {
  id          String   @id @default(cuid())
  postId      String
  type        EvidenceType
  description String
  beforeData  Json?     // 検証前のデータ
  afterData   Json?     // 検証後のデータ
  conclusion  String?   // 結論
  createdAt   DateTime @default(now())

  post        ForumPost @relation(fields: [postId], references: [id], onDelete: Cascade)
}

enum EvidenceType {
  IMPRESSION_TEST    // インプレッション検証
  ENGAGEMENT_TEST    // エンゲージメント検証
  TIMING_TEST        // 投稿時間検証
  CONTENT_TEST       // コンテンツ形式検証
  HASHTAG_TEST       // ハッシュタグ検証
  OTHER
}

model Simulation {
  id          String   @id @default(cuid())
  userId      String
  inputs      Json     // シミュレーション入力値
  result      Float    // TweepCredスコア
  createdAt   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id])
}

model Bookmark {
  id        String    @id @default(cuid())
  userId    String
  postId    String
  createdAt DateTime  @default(now())

  user      User      @relation(fields: [userId], references: [id])
  post      ForumPost @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@unique([userId, postId])
}

model AlgorithmUpdate {
  id          String   @id @default(cuid())
  title       String
  description String
  source      String?   // GitHubコミットURL等
  impact      Impact
  category    String
  publishedAt DateTime @default(now())

  @@index([publishedAt(sort: Desc)])
}

enum Impact {
  CRITICAL
  HIGH
  MEDIUM
  LOW
}
```

---

## 管理画面 機能詳細

### 📊 管理ダッシュボード (`/admin`)
- ユーザー数推移（日/週/月グラフ）
- 新規登録数（今日/今週/今月）
- アクティブユーザー率
- 投稿数・コメント数推移
- 人気カテゴリ分布
- プラン分布（Free/Standard/Pro）
- フラグ付き投稿のアラート

### 👤 ユーザー管理 (`/admin/users`)
- ユーザー一覧（検索・フィルタ・ソート）
- ユーザー詳細（プロフィール、活動履歴、投稿一覧）
- ロール変更（USER/MODERATOR/ADMIN）
- プラン変更
- アカウント停止/復活
- ユーザーエクスポート（CSV）

### 📝 投稿管理 (`/admin/posts`)
- 投稿一覧（全投稿/フラグ付き/削除済み）
- 投稿の検証済みマーク付与/解除
- ピン留め/解除
- 投稿削除/復元
- コメントモデレーション

### 📈 サービス分析 (`/admin/analytics`)
- ページビュー・滞在時間
- 機能別利用率（シミュレーター、フォーラム、DeepWiki等）
- リテンション率
- ファネル分析（登録→初投稿→継続利用）
- 検索ワードランキング

### 📄 コンテンツ管理 (`/admin/content`)
- アルゴリズムアップデート記事の作成・編集・削除
- お知らせ管理
- FAQ管理

### ⚙️ 設定 (`/admin/settings`)
- サービス全体設定
- メール文面設定
- 招待コード管理（Phase 1用）

---

## 認証フロー

1. **メール登録** → 確認メール送信 → メール内リンクで認証完了
2. **Google OAuth** → ワンクリック登録
3. **ログイン** → メール+パスワード or Google
4. **パスワードリセット** → メール送信 → リセットリンク

---

## API設計 (RESTful)

### Auth
- `POST /api/auth/register` — メール登録
- `POST /api/auth/[...nextauth]` — NextAuth ハンドラ

### Forum
- `GET /api/forum/posts` — 投稿一覧（フィルタ/ページング）
- `POST /api/forum/posts` — 新規投稿
- `GET /api/forum/posts/[id]` — 投稿詳細
- `PUT /api/forum/posts/[id]` — 投稿編集
- `DELETE /api/forum/posts/[id]` — 投稿削除
- `POST /api/forum/posts/[id]/vote` — 投票
- `POST /api/forum/posts/[id]/bookmark` — ブックマーク
- `POST /api/forum/posts/[id]/evidence` — 検証エビデンス追加
- `GET /api/forum/posts/[id]/comments` — コメント一覧
- `POST /api/forum/posts/[id]/comments` — コメント追加

### Simulator
- `POST /api/simulator/calculate` — TweepCred計算
- `GET /api/simulator/history` — 計算履歴

### Admin
- `GET /api/admin/stats` — ダッシュボード統計
- `GET /api/admin/users` — ユーザー一覧
- `PUT /api/admin/users/[id]` — ユーザー更新
- `GET /api/admin/posts` — 投稿管理
- `PUT /api/admin/posts/[id]` — 投稿ステータス変更
- `POST /api/admin/updates` — アルゴリズム更新記事
- `GET /api/admin/analytics` — 分析データ

### User
- `GET /api/users/me` — 自分のプロフィール
- `PUT /api/users/me` — プロフィール更新
- `GET /api/users/[id]` — 他ユーザーの公開プロフィール

---

## 開発フェーズ

### Phase 1: MVP（テツが今回開発する範囲）
1. **インフラ構築**
   - Prisma + Supabase セットアップ
   - NextAuth.js 認証（メール+Google）
   - ミドルウェア（認証ガード）

2. **認証ページ**
   - ログイン / 新規登録 / パスワードリセット / メール確認

3. **ダッシュボード改修**
   - 既存UIをDB連携に改修
   - プロフィール / 設定ページ

4. **フォーラム（検証コミュニティ）**
   - 投稿CRUD
   - カテゴリ/タグ/検索
   - 投票システム
   - コメント（ネスト対応）
   - 検証エビデンス投稿機能
   - ブックマーク

5. **管理画面**
   - ダッシュボード（統計）
   - ユーザー管理
   - 投稿モデレーション
   - コンテンツ管理

6. **分析ツール**
   - TweepCredシミュレーター（DB保存対応）
   - エンゲージメント分析（既存UI活用）
   - パイプライン探索（既存UI活用）

---

## PLG戦略 実装

### 無料→定着の仕掛け
1. **オンボーディング**: 初回ログイン時にチュートリアルモーダル
2. **ゲーミフィケーション**: 投稿数バッジ、検証済みバッジ
3. **通知**: 自分の投稿へのコメント/投票通知
4. **ウィークリーダイジェスト**: 人気投稿まとめメール
5. **検証チャレンジ**: 週次テーマ（「今週の検証: 投稿時間は本当に影響する？」）

### SEO/集客
1. 検証投稿の一部を公開ページとしてSEOインデックス
2. OGP対応（SNSシェア時にプレビュー表示）
3. 人気投稿ランキングページ

---

## 品質基準
- TypeScript strict mode
- ESLint + Prettier
- レスポンシブ対応（モバイル/タブレット/デスクトップ）
- ダークモード対応（既存のnext-themes）
- アクセシビリティ（WCAG 2.1 AA）
- Core Web Vitals 最適化
- エラーバウンダリ + ローディングUI
