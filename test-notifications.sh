#!/bin/bash

# 通知システムの動作確認スクリプト
# 使用方法: ./test-notifications.sh

echo "==================================="
echo "通知システム動作確認"
echo "==================================="
echo ""

# カラーコード
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. ファイルの存在確認
echo "📁 1. ファイル存在確認"
echo "-----------------------------------"

files=(
  "app/dashboard/notifications/page.tsx"
  "app/dashboard/notifications/loading.tsx"
  "app/api/notifications/route.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC} $file"
  else
    echo -e "${RED}✗${NC} $file (見つかりません)"
  fi
done
echo ""

# 2. サイドバーのリンク確認
echo "🔗 2. サイドバーリンク確認"
echo "-----------------------------------"
if grep -q 'href: "/dashboard/notifications"' app/dashboard/layout.tsx; then
  echo -e "${GREEN}✓${NC} サイドバーに通知リンクが追加されています"
else
  echo -e "${RED}✗${NC} サイドバーに通知リンクが見つかりません"
fi
echo ""

# 3. TypeScript構文チェック（簡易）
echo "🔍 3. 基本構文チェック"
echo "-----------------------------------"

# page.tsx の import チェック
if grep -q "import.*useState.*from.*react" app/dashboard/notifications/page.tsx; then
  echo -e "${GREEN}✓${NC} page.tsx: React imports OK"
else
  echo -e "${YELLOW}⚠${NC} page.tsx: React imports に問題がある可能性"
fi

# route.ts の NextResponse チェック
if grep -q "import.*NextResponse.*from.*next/server" app/api/notifications/route.ts; then
  echo -e "${GREEN}✓${NC} route.ts: Next.js imports OK"
else
  echo -e "${YELLOW}⚠${NC} route.ts: Next.js imports に問題がある可能性"
fi
echo ""

# 4. API エンドポイント確認
echo "🌐 4. API エンドポイント確認"
echo "-----------------------------------"

# GET メソッド
if grep -q "export async function GET" app/api/notifications/route.ts; then
  echo -e "${GREEN}✓${NC} GET /api/notifications エンドポイント定義済み"
else
  echo -e "${RED}✗${NC} GET エンドポイントが見つかりません"
fi

# PUT メソッド
if grep -q "export async function PUT" app/api/notifications/route.ts; then
  echo -e "${GREEN}✓${NC} PUT /api/notifications エンドポイント定義済み"
else
  echo -e "${RED}✗${NC} PUT エンドポイントが見つかりません"
fi
echo ""

# 5. 通知タイプフィルター確認
echo "🎯 5. 通知タイプフィルター確認"
echo "-----------------------------------"

types=("COMMENT" "VOTE" "TICKET" "ALGORITHM_UPDATE" "SYSTEM")
for type in "${types[@]}"; do
  if grep -q "$type" app/dashboard/notifications/page.tsx; then
    echo -e "${GREEN}✓${NC} $type フィルター定義済み"
  else
    echo -e "${YELLOW}⚠${NC} $type フィルターが見つかりません"
  fi
done
echo ""

# 6. 主要機能の実装確認
echo "⚙️  6. 主要機能の実装確認"
echo "-----------------------------------"

features=(
  "markAsRead:既読マーク機能"
  "markAllAsRead:一括既読機能"
  "fetchNotifications:通知取得機能"
  "NotificationIcon:通知アイコン"
  "timeAgo:相対時間表示"
)

for feature in "${features[@]}"; do
  func_name="${feature%%:*}"
  func_desc="${feature##*:}"
  if grep -q "$func_name" app/dashboard/notifications/page.tsx; then
    echo -e "${GREEN}✓${NC} $func_desc"
  else
    echo -e "${YELLOW}⚠${NC} $func_desc が見つかりません"
  fi
done
echo ""

# 7. スタイリング確認
echo "🎨 7. スタイリング確認"
echo "-----------------------------------"

styles=(
  "bg-primary:プライマリーカラー"
  "hover\\:bg-muted:ホバー効果"
  "border-primary:未読ボーダー"
  "text-blue-400:アイコンカラー"
)

for style in "${styles[@]}"; do
  class="${style%%:*}"
  desc="${style##*:}"
  if grep -q "$class" app/dashboard/notifications/page.tsx; then
    echo -e "${GREEN}✓${NC} $desc 使用"
  else
    echo -e "${YELLOW}⚠${NC} $desc が見つかりません"
  fi
done
echo ""

# 8. レスポンシブ対応確認
echo "📱 8. レスポンシブ対応確認"
echo "-----------------------------------"

if grep -q "max-w-2xl" app/dashboard/notifications/page.tsx; then
  echo -e "${GREEN}✓${NC} 最大幅制限（デスクトップ対応）"
else
  echo -e "${YELLOW}⚠${NC} 最大幅制限が見つかりません"
fi

if grep -q "sticky" app/dashboard/notifications/page.tsx; then
  echo -e "${GREEN}✓${NC} スティッキーヘッダー"
else
  echo -e "${YELLOW}⚠${NC} スティッキーヘッダーが見つかりません"
fi
echo ""

# 9. 開発サーバー起動確認
echo "🚀 9. 開発サーバー確認"
echo "-----------------------------------"

if pgrep -f "next dev" > /dev/null; then
  echo -e "${GREEN}✓${NC} Next.js 開発サーバー起動中"
  echo ""
  echo "   開発環境URL: http://matrix.10x-dev.tech:3456/dashboard/notifications"
else
  echo -e "${YELLOW}⚠${NC} Next.js 開発サーバーが起動していません"
  echo ""
  echo "   起動コマンド: npm run dev"
fi
echo ""

# 10. まとめ
echo "==================================="
echo "✅ 動作確認完了"
echo "==================================="
echo ""
echo "次のステップ:"
echo "1. ブラウザで http://matrix.10x-dev.tech:3456/dashboard/notifications にアクセス"
echo "2. ログインしてテストアカウントで通知を確認"
echo "3. フィルター機能、既読マーク機能をテスト"
echo "4. レスポンシブ動作を確認（モバイル/デスクトップ）"
echo ""
echo "詳細なドキュメント:"
echo "- NOTIFICATIONS_IMPLEMENTATION.md"
echo "- NOTIFICATIONS_UI_STRUCTURE.md"
echo ""
