import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'

// レート制限用の簡易インメモリストア（本番環境ではRedis推奨）
const shareRateLimits = new Map<string, { count: number; resetAt: number }>()

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, contentId, timestamp } = await req.json()

    if (!type || !contentId) {
      return NextResponse.json(
        { error: 'Missing required fields: type, contentId' },
        { status: 400 }
      )
    }

    const userId = session.user.id

    // レート制限チェック（同一ユーザー: 1日10回まで）
    const dailyLimitKey = `daily:${userId}`
    const now = Date.now()
    const oneDayMs = 24 * 60 * 60 * 1000
    
    const dailyLimit = shareRateLimits.get(dailyLimitKey)
    if (dailyLimit && dailyLimit.resetAt > now) {
      if (dailyLimit.count >= 10) {
        return NextResponse.json(
          { error: 'Daily share limit exceeded (10 shares/day)' },
          { status: 429 }
        )
      }
      dailyLimit.count += 1
    } else {
      shareRateLimits.set(dailyLimitKey, {
        count: 1,
        resetAt: now + oneDayMs,
      })
    }

    // 同一コンテンツのシェア制限（1日3回まで）
    const contentLimitKey = `content:${userId}:${type}:${contentId}`
    const contentLimit = shareRateLimits.get(contentLimitKey)
    if (contentLimit && contentLimit.resetAt > now) {
      if (contentLimit.count >= 3) {
        return NextResponse.json(
          {
            error: 'Content share limit exceeded',
            warning:
              'このコンテンツは既に3回シェア済みです。過度なシェアはXアカウントの凍結リスクがあります。',
          },
          { status: 429 }
        )
      }
      contentLimit.count += 1
    } else {
      shareRateLimits.set(contentLimitKey, {
        count: 1,
        resetAt: now + oneDayMs,
      })
    }

    // シェアイベントをDBに記録（統計・分析用）
    // TODO: Prisma schemaに ShareEvent モデルを追加
    /*
    await prisma.shareEvent.create({
      data: {
        userId,
        contentType: type,
        contentId,
        timestamp: new Date(timestamp),
      },
    })
    */

    // 暫定: コンソールログ（将来的にはDB保存）
    console.log('[Share Event]', {
      userId,
      type,
      contentId,
      timestamp: new Date(timestamp).toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Share tracking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// メモリクリーンアップ（1時間ごとに期限切れエントリを削除）
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, value] of shareRateLimits.entries()) {
      if (value.resetAt <= now) {
        shareRateLimits.delete(key)
      }
    }
  }, 60 * 60 * 1000)
}
