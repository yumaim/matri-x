import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { searchParams } = new URL(req.url)
    const { type } = await params
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
  } catch (error) {
    console.error('OG Image generation error:', error)
    
    // エラー時はデフォルト画像を返す
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1a1a1a',
            color: 'white',
            fontSize: 48,
            fontWeight: 800,
          }}
        >
          matri-x
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  }
}
