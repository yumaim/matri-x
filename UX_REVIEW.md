# UXデザイン評価 — matri-x

**レビュー日**: 2026-02-10
**レビュアー**: シニアUXデザイナー (AI)
**比較基準**: ClickUp / Notion / Linear / Figma

---

## 総合スコア: 62/100

| カテゴリ | スコア |
|---|---|
| 情報アーキテクチャ | 14/20 |
| インタラクションデザイン | 12/20 |
| ビジュアルデザイン | 15/20 |
| レスポンシブデザイン | 11/20 |
| アクセシビリティ + マイクロインタラクション | 10/20 |

---

## 情報アーキテクチャ: 14/20

### 良い点
- サイドバーナビゲーションの構造は論理的。8つの主要機能＋2つのユーティリティ（プロフィール/設定）の分類は明確
- ダッシュボードの「クイックアクション」がユーザーの次のステップを誘導
- オンボーディングツアー（driver.js）で初回ユーザーの迷子を防止

### 致命的問題

1. **ランディングページとダッシュボードの情報構造が二重化**
   - `app/page.tsx` L260-330: ランディングページにエンゲージメント重み付けのデータが丸ごとある
   - `app/dashboard/engagement/page.tsx`: 同じデータがダッシュボード内にも存在
   - `app/dashboard/explore/page.tsx` L85-120: explore内にも重複した `engagementWeights` 配列
   - **影響**: 「この情報はどこが正しいの？」というユーザー混乱。ClickUpなら情報のSingle Source of Truthを徹底する

2. **「有料」バッジの導線が壊れている**
   - `app/dashboard/page.tsx` L37-38: `paid: true` バッジがクイックアクションカードにあるが、リンク先は普通に `/dashboard/simulator` と `/dashboard/deepwiki`
   - `components/plan-gate.tsx` L30-35: 遷移した後に「開発中」のゲートが表示される
   - **影響**: ユーザーは「有料って書いてあるけどクリックしたら開発中？」と混乱。Notionなら無料プランでも中身がチラ見えする（blurではなく）、または最初からクリックを防ぐ

3. **フォーラムサイドバーがデスクトップのみ**
   - `app/dashboard/forum/page.tsx` L222: `className="hidden lg:block"` でモバイルでは完全に消える
   - プロフィールプレビュー、コミュニティ統計、トレンドタグ、ガイドラインがモバイルでアクセス不可
   - **影響**: モバイルユーザーはフォーラムのコンテキスト情報を全く見られない

4. **フッターリンクが全てデッドリンク**
   - `app/page.tsx` L380-400: 利用規約 → `#`、プライバシー → `#`、お問い合わせ → `#`
   - `app/(auth)/register/page.tsx` L157-164: 利用規約 → `/terms`、プライバシー → `/privacy` だが、これらのページは存在しない
   - **影響**: 信頼性の致命的な毀損。B2Bターゲットは必ず利用規約を確認する

---

## インタラクションデザイン: 12/20

### 良い点
- フォームの送信中ローディング表示（Loader2 + テキスト変更）は全般的に適切
- VoteButton の楽観的更新（Optimistic UI）は良好。エラー時のリバートも実装済み
- ブックマーク操作も楽観的更新でレスポンシブ

### 致命的問題

5. **ログアウト機能が未実装**
   - `app/dashboard/layout.tsx` L202-205: ドロップダウンの「ログアウト」メニュー項目に `onClick` ハンドラがない
   - `signOut` をインポートしていない
   - **影響**: ユーザーがログアウトできない。セキュリティ上も問題

6. **モバイルメニューのロック問題（ランディングページ）**
   - `app/page.tsx` L115-127: モバイルメニューが開いている時、背景の `<div>` に `onClick` はあるが、`role` も `tabIndex` もない
   - ESCキーでの閉じは `onKeyDown` で実装されているが、`<div>` にフォーカスが当たらないので実質機能しない
   - **影響**: キーボードユーザーはモバイルメニューを閉じられない

7. **パスワードバリデーションの不整合**
   - `app/(auth)/register/page.tsx` L148: `minLength={8}` のHTML制約のみ、リアルタイムバリデーションなし
   - `app/dashboard/settings/page.tsx` L33-37: JS側で `英字+数字` チェックあるが、登録ページにはない
   - **影響**: 登録時に弱いパスワードが通り、設定ページで変更しようとすると突然厳しい規則が適用される

8. **コメント削除が見た目だけ**
   - `components/forum/comment-section.tsx` L85: 「削除」DropdownMenuItemに `onClick` がない
   - **影響**: ユーザーは自分のコメントを削除できない

9. **フォーラム検索のEnterキー依存**
   - `app/dashboard/forum/page.tsx` L143-145: 検索ボタンが存在しない。`onKeyDown` でEnterを検出する方式のみ
   - 検索入力フィールドに虫眼鏡アイコンはあるがクリック不可
   - **影響**: モバイルユーザーやアクセシビリティユーザーにとって検索のトリガーが不明確

10. **確認ダイアログなしのブックマーク解除**
    - `app/dashboard/forum/[id]/page.tsx` L132-148: ブックマーク解除に確認なし
    - 問題は小さいが、Linearでは重要なアクションには必ずフィードバックがある

11. **トレンドタグがクリックしても何も起きない**
    - `app/dashboard/forum/page.tsx` L309-322: `cursor-pointer` クラスがあるが `onClick` がない
    - **影響**: ユーザーはタグをクリックして絞り込みできると期待するが、何も起きない

12. **「更新通知を設定」ボタンが機能しない**
    - `app/dashboard/updates/page.tsx` L173-176: ボタンに `onClick` がない
    - **影響**: 期待を裏切るUI

---

## ビジュアルデザイン: 15/20

### 良い点
- ダークモードのカラーパレットは洗練されている。`--primary: 204 89% 53%`（ツイッターブルー系）、`--accent: 258 100% 67%`（パープル）のコンビネーションはX関連プロダクトとして適切
- `text-gradient` (blue → purple → green) のグラデーションテキストはブランドアイデンティティとして一貫性がある
- `glass` ユーティリティ（backdrop-blur + border）はモダンでプレミアム感がある
- パイプラインノードグラフ（explore）のアニメーションは教育的で印象的

### 問題点

13. **ダークモード「のみ」— ライトモード切替不可**
    - `app/globals.css`: `:root` に直接ダーク系の値を設定。`darkMode: ['class']` がtailwind設定にあるが、トグルUIがない
    - `styles/globals.css`: `.dark` セレクタ内の値があるが、これは別ファイルで競合の可能性
    - `components/theme-provider.tsx`: ファイルは存在するがどこからもインポートされていない（`app/layout.tsx` で使用していない）
    - **影響**: WCAG的に、ダークモード固定はユーザーの選択肢を奪う。B2Bユーザーの中にはオフィスの明るい環境で使う人も多い

14. **コントラスト比の問題**
    - `--muted-foreground: 0 0% 60%` → `hsl(0 0% 60%)` = `#999999`
    - `--background: 0 0% 0%` → `#000000`
    - コントラスト比: 5.9:1 → WCAG AA (4.5:1) はクリアだが、AAA (7:1) には未達
    - より深刻: `text-muted-foreground/60` のような opacity をかけた場合 → `rgba(153,153,153,0.6)` ≒ 実質 `#666666` on `#000000` → コントラスト比 3.95:1 → **WCAG AA違反**
    - 該当箇所: `components/forum/post-card.tsx` L86 `text-muted-foreground/60`

15. **`styles/globals.css` と `app/globals.css` の二重定義**
    - `styles/globals.css`: ライトモード＋ダークモードの完全なCSS変数セット
    - `app/globals.css`: ダークモードのみのCSS変数セット（こちらが実際に使われている）
    - **影響**: メンテナンス時の混乱。どちらが正なのか不明

16. **タイポグラフィの階層が弱い**
    - ダッシュボードのページタイトル: `text-2xl font-bold sm:text-3xl` — 全ページ共通パターンだが、ページ間の視覚的差別化が不足
    - カードのタイトル: `text-lg` が多用されすぎて、どのカードが重要か瞬時に判断しづらい
    - Notion/Linearでは見出しに微妙なウェイトやサイズの差を付けてスキャンしやすくしている

17. **空白の不統一**
    - `app/dashboard/page.tsx`: `p-6 lg:p-8` 
    - `app/dashboard/forum/page.tsx`: `p-4 sm:p-6 lg:p-8`
    - `app/dashboard/ranking/page.tsx`: `container mx-auto max-w-6xl py-6 px-4`
    - `app/dashboard/profile/page.tsx`: `p-6 max-w-3xl mx-auto`
    - **影響**: ページ間でパディングが微妙に異なり、遷移時に「揺れ」を感じる。デザインシステムとして統一すべき

---

## レスポンシブデザイン: 11/20

### 良い点
- ダッシュボードレイアウトのサイドバーはモバイルでSheet（ドロワー）に変換される — 基本的なレスポンシブは対応
- フォーラムのカテゴリタブは `overflow-x-auto` で横スクロール対応

### 致命的問題

18. **パイプラインノードグラフがモバイルで読みにくい**
    - `app/dashboard/explore/page.tsx` L370+: デスクトップ版は `hidden md:block` でSVG+absolute positioningを使用
    - モバイル版は垂直スタックに変換されるが、SVGコネクタが `width="2" height="24"` の細い線のみ
    - ステージ間の関係性がモバイルではほぼ失われる
    - **影響**: メイン機能の一つであるパイプライン可視化がモバイルで価値が半減

19. **エンゲージメント分析のチャートがモバイルではみ出す可能性**
    - `app/dashboard/engagement/page.tsx` L120: `ChartContainer` に `className="h-[350px] w-full overflow-hidden"` があるが、`YAxis width={120}` がモバイルの狭い画面で文字切れする可能性
    - `overflow-hidden` で切れた部分が見えなくなる
    - **影響**: 375px幅では棒グラフのラベルが読めない可能性が高い

20. **DeepWiki AIチャットのレイアウト問題**
    - `app/dashboard/deepwiki/page.tsx` L107: `flex h-[calc(100vh-64px)]` — モバイルヘッダー(64px)を考慮しているが、サイドバーの「おすすめの質問」がモバイルではチャット下に配置
    - チャット入力が画面下部に固定されていないので、メッセージが増えるとスクロールが必要
    - **影響**: モバイルでAIチャットの使い勝手が大幅に低下

21. **ランディングページのStatsカードが375pxで窮屈**
    - `app/page.tsx` L172: `grid-cols-2 gap-8` — 375pxでは2列表示で各カードが約160px幅
    - `text-3xl font-bold` の数値（"6,000+"）と `text-sm` のラベルが窮屈
    - gap-8(32px) は375pxでは大きすぎる
    - **影響**: iPhone SEで統計カードがぎゅうぎゅう

22. **プロフィールページのアバター+テキストが横並び固定**
    - `app/dashboard/profile/page.tsx` L106: `flex items-center gap-6` — モバイルでも横並び
    - `h-20 w-20` のアバターが375px幅で結構な面積を占める
    - **影響**: 小さい画面でプロフィール情報が窮屈。`flex-col sm:flex-row` にすべき

23. **ランキングページのTabsTriggerが4列グリッド**
    - `app/dashboard/ranking/page.tsx` L320: `grid grid-cols-4` — 375pxでは各タブが約80px幅
    - テキスト「アクティブ議論」(7文字) は確実にはみ出す
    - **影響**: タブのテキストが切れるか、異常に小さいフォントになる

---

## アクセシビリティ + マイクロインタラクション: 10/20

### マイクロインタラクション（良い点）
- パイプラインの再生アニメーション（play/reset）はエデュケーショナルで効果的
- ツイープクレドスコアのゲージアニメーション（SVG circle transition）は滑らか
- 新アチーブメントのトースト表示（slide-in-from-right + auto-dismiss 5秒）は適切
- タイプライターエフェクト（ランディングページ）はブランド体験に貢献

### 致命的問題

24. **`<html lang="ja">` だけでアクセシビリティ対応は不十分**
    - `app/layout.tsx` L37: `lang="ja"` は設定されているが、以下が全面的に欠如:
    - **aria-label**: ナビゲーションランドマーク (`<nav>`, `<aside>`, `<main>`) に一つも `aria-label` がない
    - **aria-live**: 動的コンテンツ更新（通知カウント、スコア計算結果、投票スコア変更）に `aria-live` がない
    - **skip navigation**: ページ冒頭のスキップリンクがない

25. **フォーカス管理の不在**
    - `app/page.tsx` L115: モバイルメニューオープン時、フォーカスがメニュー内に閉じ込められない（フォーカストラップなし）
    - `app/dashboard/forum/[id]/page.tsx`: ダイアログ（Dialog）コンポーネントはRadix UIベースなのでフォーカストラップはあるが、独自実装のモバイルメニューにはない
    - **影響**: キーボードユーザーがモバイルメニュー外にフォーカスが漏れる

26. **ボタンのaria-label欠如**
    - `app/dashboard/layout.tsx` L254: モバイルヘッダーの `<Avatar>` — クリッカブルに見えるが `<button>` でもリンクでもない。意味のないインタラクティブ要素
    - `components/forum/vote-button.tsx`: ThumbsUp/ThumbsDown ボタンに `aria-label` がない。スクリーンリーダーは「ボタン」としか読み上げない
    - `app/page.tsx` L107: ハンバーガーメニューボタンに `aria-label="メニューを開く"` がない

27. **色のみの情報伝達**
    - `app/dashboard/simulator/page.tsx` L171-175: TweepCredスコアのレベル表示が色のみで差別化
    - 「低」= 赤、「普通」= オレンジ、「良好」= 黄色、「優秀」= 緑、「最高」= 青
    - テキストラベルは付いているが、ゲージのSVG circle は色だけ
    - **影響**: 色覚障害ユーザーにはゲージの変化が分かりにくい

28. **トーストが自動消去のみ（アチーブメント）**
    - `app/dashboard/page.tsx` L75: `setTimeout(() => setShowNewAchievement(false), 5000)`
    - 閉じるボタンがない
    - `aria-live="polite"` がないのでスクリーンリーダーに通知されない
    - **影響**: ユーザーは5秒以内に読めなければ情報を逃す

29. **ページ遷移アニメーションの不在**
    - Next.js App Routerのデフォルトのページ遷移（フルリロード感）がそのまま
    - Notion/LinearのSPA的な滑らかな遷移がない
    - `loading.tsx` ファイルが全ページで欠如 → ナビゲーション時の真っ白画面

30. **スケルトンスクリーンの適用が不完全**
    - フォーラム一覧（`forum/page.tsx` L190-209）: スケルトンあり ✓
    - ダッシュボード（`page.tsx`）: 統計カードのみアニメーションあり、学習進捗・アチーブメントにはなし ✗
    - ランキング（`ranking/page.tsx`）: スケルトンあり ✓
    - プロフィール（`profile/page.tsx`）: Loader2スピナーのみ（スケルトンではない） ✗
    - **影響**: ローディング体験が不均一。Linearでは全ページでスケルトンが統一されている

---

## 🚨 致命的なUX問題（今すぐ修正）

### 1. ログアウト不能
- **ファイル**: `app/dashboard/layout.tsx` L202-205
- **問題**: DropdownMenuItemの「ログアウト」にonClickハンドラがない
- **修正**: `import { signOut } from "next-auth/react"` して `onClick={() => signOut({ callbackUrl: "/" })}` を追加

### 2. フッターの利用規約/プライバシーがデッドリンク
- **ファイル**: `app/page.tsx` L380-400, `app/(auth)/register/page.tsx` L157-164
- **問題**: B2B SaaSとして信頼性を致命的に損なう
- **修正**: 最低限のページを作成するか、リンクを削除

### 3. ThemeProviderが未接続
- **ファイル**: `app/layout.tsx` L37-40
- **問題**: `components/theme-provider.tsx` が存在するが使用されていない。`<html>` に `className="dark"` もない
- **根本原因**: `app/globals.css` で `:root` にダーク値を直接設定しているため動作しているが、設計として壊れている

### 4. ランディングページのモバイルメニューにフォーカストラップがない
- **ファイル**: `app/page.tsx` L110-145
- **問題**: メニューを開いた時にフォーカスが閉じ込められない。アクセシビリティ違反
- **修正**: `Sheet` コンポーネント（Radix UI）をダッシュボードと同じく使うか、`focus-trap-react` を導入

### 5. `styles/globals.css` と `app/globals.css` のCSS変数競合
- **ファイル**: `styles/globals.css` 全体, `app/globals.css` 全体
- **問題**: 2つのファイルが同じCSS変数を異なる値で定義。`body` のスタイルも両方で定義。`styles/globals.css` はどこからインポートされているのか不明
- **修正**: 使用していない方を削除

---

## ⚠️ 重要な改善点（優先度高）

### 6. 全ページに `loading.tsx` を追加
- Next.js App Routerの `loading.tsx` がどのルートにも存在しない
- ページ遷移時に真っ白な画面が表示される
- `app/dashboard/loading.tsx`, `app/dashboard/forum/loading.tsx` 等にスケルトンUIを配置

### 7. パスワードバリデーションの統一
- **ファイル**: `app/(auth)/register/page.tsx`, `app/dashboard/settings/page.tsx`, `lib/validations/auth.ts`
- `lib/validations/auth.ts` に共通バリデーションロジックがあるが、UIで活用されていない
- リアルタイムバリデーション（パスワード強度インジケーター）を追加すべき

### 8. 検索UIの改善
- **ファイル**: `app/dashboard/forum/page.tsx` L139-148
- 検索アイコンをクリック可能にする（ボタン化）
- `debounce` で自動検索を実装（Enterキー不要に）
- 検索結果0件時の提案機能を追加

### 9. NotificationBellのデスクトップ対応
- **ファイル**: `app/dashboard/layout.tsx` L247
- 通知ベルはモバイルヘッダーにのみ存在（`lg:hidden` の中）
- デスクトップのサイドバーには通知ベルがない
- **修正**: サイドバー上部またはメインコンテンツヘッダーにも配置

### 10. エラーハンドリングの統一
- API呼び出しの失敗時:
  - 一部は `console.error` で無視（`forum/page.tsx` L136）
  - 一部はエラーメッセージ表示（`login/page.tsx` L49）
  - 一部は `/* ignore */`（`dashboard/layout.tsx` L76）
- Sonner（toast）が `components/ui/sonner.tsx` にあるが、実際の使用箇所がない
- **修正**: 全API呼び出しに統一したエラー通知（toast）を導入

### 11. ユーザー表示名がハードコード
- **ファイル**: `app/dashboard/layout.tsx` L197-198
- サイドバーのユーザー名が `"Demo User"` / `"Pro Plan"` にハードコード
- 実際のユーザーデータを取得していない
- **影響**: 実ユーザーが自分のアカウントとして認識できない

---

## 💡 プロレベルの提案（差別化）

### 12. コマンドパレット（⌘K）の導入
- Notion/Linear級のUXにはコマンドパレットが必須
- `components/ui/command.tsx` が既に存在するが、使用されていない
- グローバル検索、ページ遷移、クイックアクションを一箇所に集約

### 13. Breadcrumbの追加
- `components/ui/breadcrumb.tsx` が存在するが未使用
- 特にフォーラムの階層（フォーラム → カテゴリ → 投稿詳細）で必須
- 現在は「フォーラムに戻る」ボタンのみで、中間ナビゲーションがない

### 14. キーボードショートカット
- `n` → 新規投稿
- `s` → 検索フォーカス
- `j/k` → 投稿間のナビゲーション
- `?` → ショートカット一覧表示
- Linear/GitHub級のキーボードファーストUX

### 15. ダッシュボードのカスタマイズ
- ウィジェットの並び替え、表示/非表示の切替
- 「学習進捗を非表示にする」等の設定
- Notion/ClickUpのダッシュボードカスタマイズ機能

### 16. リアルタイムUI更新
- フォーラムの投票やコメントをWebSocket/Server-Sent Eventsで即座に反映
- 「他のユーザーがこの投稿を見ています」インジケーター
- Figma的なプレゼンス表示

### 17. エンゲージメント計算のインタラクティブ化
- 「あなたの投稿のエンゲージメント」をリアルタイムで計算するインタラクティブカリキュレーター
- 「リプライ5件 + いいね20件 + リポスト3件 = スコアXX」のようなビジュアル計算

### 18. ページ遷移アニメーション
- `framer-motion` の `AnimatePresence` を使ったスムーズなページ遷移
- カード要素のstaggered animation
- Notion/Linearの滑らかな遷移体験

---

## 📱 モバイル専用の問題

### 19. パイプラインノードグラフのモバイル体験
- **ファイル**: `app/dashboard/explore/page.tsx` L520-610
- 垂直スタックに変換されるが、各ステージ間のSVGコネクタが `height="24"` の短い線のみ
- デスクトップのSVGパスによる美しい曲線接続がモバイルでは完全に失われる
- **提案**: スワイプ可能なカルーセル形式、またはステッパーUI

### 20. フォーラムカテゴリタブのスクロール
- **ファイル**: `app/dashboard/forum/page.tsx` L176
- `scrollbar-hide` クラスでスクロールバーを非表示にしているが、ユーザーはスクロール可能であることに気づかない
- **修正**: 端にフェードグラデーションを追加して「まだ続きがある」ことを視覚的に示す

### 21. Deep AI検索のサイドバー
- **ファイル**: `app/dashboard/deepwiki/page.tsx` L108
- `lg:flex-row` でモバイルでは「おすすめの質問」がチャットの下に配置
- チャット使用中に提案質問にアクセスするには大量にスクロールする必要がある
- **修正**: モバイルでは折りたたみ可能なパネルにするか、チャット入力上にピル状のサジェスチョンチップを配置

### 22. ランキングページの統計カードが375pxで窮屈
- **ファイル**: `app/dashboard/ranking/page.tsx` L362-387
- `sm:grid-cols-3` のカードが375px（sm未満）では1列だが、内部のコンテンツ（`text-3xl font-bold`）がパディング`p-5`と合わせると圧迫感
- 値が「—」（ダッシュ）なので現状問題ないが、実数値が入ると問題

### 23. タッチターゲットサイズの問題箇所
- `components/forum/vote-button.tsx` L77: `h-7 w-7`（28px）→ 44px未満
- `components/forum/post-card.tsx` L180: `h-7 w-7`（28px）ブックマークボタン → 44px未満
- `app/dashboard/layout.tsx` L232: サイドバー折りたたみボタン `h-6 w-6`（24px）→ 44px未満
- **WCAG 2.5.5**: 最低44×44pxのターゲットサイズが推奨

---

## 🎨 具体的なCSS/コード修正案

### 修正1: ログアウト機能の実装
**ファイル**: `app/dashboard/layout.tsx` L1, L202-205
```tsx
// L1: import追加
import { signOut } from "next-auth/react";

// L202-205: onClickハンドラ追加
<DropdownMenuItem 
  className="text-destructive"
  onClick={() => signOut({ callbackUrl: "/" })}
>
  <LogOut className="mr-2 h-4 w-4" />
  ログアウト
</DropdownMenuItem>
```

### 修正2: aria-labelの追加
**ファイル**: `app/dashboard/layout.tsx`
```tsx
// L220: <aside> に aria-label追加
<aside
  aria-label="メインナビゲーション"
  className={cn(...)}
>

// L241: <header> に aria-label追加  
<header 
  aria-label="モバイルヘッダー"
  className="fixed top-0 ..."
>

// L253: ハンバーガーボタン
<Button variant="ghost" size="icon" aria-label="メニューを開く">
```

### 修正3: VoteButtonのaria-label
**ファイル**: `components/forum/vote-button.tsx` L71, L93
```tsx
// L71
<Button aria-label="賛成" ...>

// L93
<Button aria-label="反対" ...>
```

### 修正4: タッチターゲットサイズの修正
**ファイル**: `components/forum/vote-button.tsx` L70, L92
```tsx
// smサイズでも最低44pxを確保
const btnSize = size === "sm" ? "h-7 w-7 min-h-[44px] min-w-[44px]" : "h-9 w-9";
```

### 修正5: ページパディングの統一
**ファイル**: 全ダッシュボードページ
```tsx
// 共通パターンを使用:
<div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
```
現在の不統一:
- `dashboard/page.tsx`: `p-6 lg:p-8 space-y-8`
- `dashboard/forum/page.tsx`: `p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6`
- `dashboard/ranking/page.tsx`: `container mx-auto max-w-6xl space-y-8 py-6 px-4`
- `dashboard/profile/page.tsx`: `p-6 max-w-3xl mx-auto space-y-6`

### 修正6: loading.tsxの追加例
**ファイル**: `app/dashboard/loading.tsx`（新規作成）
```tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1,2,3,4].map(i => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}
```

### 修正7: コントラスト比の修正
**ファイル**: `app/globals.css` L11
```css
/* 変更前 */
--muted-foreground: 0 0% 60%;

/* 変更後 — WCAG AAA (7:1) をクリア */
--muted-foreground: 0 0% 68%;
```

### 修正8: ダッシュボードのユーザー名取得
**ファイル**: `app/dashboard/layout.tsx`
```tsx
// SidebarContentでセッションからユーザー名を取得
// 現在の "Demo User" / "Pro Plan" をセッションデータに置換

// useEffect でセッション取得
const [user, setUser] = useState({ name: "", plan: "" });
useEffect(() => {
  fetch("/api/users/me")
    .then(r => r.json())
    .then(data => setUser({ name: data.name ?? "ユーザー", plan: data.plan ?? "Free" }))
    .catch(() => {});
}, []);
```

### 修正9: トレンドタグのクリックイベント追加
**ファイル**: `app/dashboard/forum/page.tsx` L309-322
```tsx
{["Heavy Ranker", "リプライ重み", ...].map((tag) => (
  <Badge
    key={tag}
    variant="secondary"
    className="cursor-pointer hover:bg-primary/20 transition-colors text-xs"
    onClick={() => {
      setSearchInput(tag);
      setSearchQuery(tag);
    }}
  >
    #{tag}
  </Badge>
))}
```

### 修正10: フォーラムサイドバーのモバイル表示
**ファイル**: `app/dashboard/forum/page.tsx` L222
```tsx
// 変更前
<div className="hidden lg:block space-y-6">

// 変更後 — モバイルでは折りたたみ可能なセクションとして表示
<div className="lg:block space-y-6">
  {/* モバイルでは Collapsible でラップ */}
  <Collapsible className="lg:hidden">
    <CollapsibleTrigger asChild>
      <Button variant="outline" className="w-full gap-2 mb-4">
        コミュニティ情報
        <ChevronDown className="h-4 w-4" />
      </Button>
    </CollapsibleTrigger>
    <CollapsibleContent>
      {/* サイドバーコンテンツ */}
    </CollapsibleContent>
  </Collapsible>
  {/* デスクトップでは通常表示 */}
  <div className="hidden lg:block space-y-6">
    {/* サイドバーコンテンツ */}
  </div>
</div>
```

---

## 総評

matri-xは**コンテンツの質が非常に高い**プロダクトです。Xアルゴリズムの知識体系、パイプライン可視化、エンゲージメント重み付けの解説は専門性が光ります。ビジュアルデザインも洗練されたダークテーマで、ターゲットユーザー（SNSマーケター）に刺さるものがあります。

しかし、**UXの基本的な品質管理が行き届いていない**点が足を引っ張っています。ログアウト不能、デッドリンク、ハードコードされたユーザー名、未接続のThemeProvider — これらは個々には小さな問題ですが、累積するとユーザーの信頼を確実に失います。

**ClickUp/Notion級のUXに到達するために最も重要な3つのアクション:**

1. **基本的なインタラクションバグの全修正**（ログアウト、デッドリンク、未実装ハンドラ）— 1日で完了可能
2. **loading.tsx + エラーハンドリングの統一** — ユーザーの「不安な空白時間」を排除
3. **アクセシビリティの底上げ**（aria-label、フォーカス管理、タッチターゲット）— 2-3日

これらを修正すれば、スコアは **62 → 78** に向上すると推定します。その上でコマンドパレットやページ遷移アニメーションを追加すれば、**85+** を狙えます。
