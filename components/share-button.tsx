'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface ShareButtonProps {
  /**
   * コンテンツタイプ（OGP画像生成に使用）
   */
  type: 'deepwiki' | 'simulator' | 'forum' | 'ticket'
  
  /**
   * コンテンツID
   */
  contentId: string
  
  /**
   * シェアURL（省略時は現在のページURL）
   */
  url?: string
  
  /**
   * シェア文言（Xポスト本文）
   */
  text?: string
  
  /**
   * コンテンツタイトル（OGP画像生成用）
   */
  title?: string
  
  /**
   * スコア（simulator用、OGP画像に表示）
   */
  score?: string
  
  /**
   * ステータス（ticket用、OGP画像に表示）
   */
  status?: string
  
  /**
   * UTMキャンペーン名（省略時は 'share'）
   */
  utmCampaign?: string
  
  /**
   * ボタンサイズ
   */
  size?: 'sm' | 'default' | 'lg'
  
  /**
   * ボタンバリアント
   */
  variant?: 'default' | 'outline' | 'ghost'
  
  /**
   * ボタンテキスト（省略時はアイコンのみ）
   */
  label?: string
}

export function ShareButton({
  type,
  contentId,
  url,
  text,
  title,
  score,
  status,
  utmCampaign = 'share',
  size = 'default',
  variant = 'outline',
  label,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    // URLの構築（UTMパラメータ付き）
    const baseUrl = url || (typeof window !== 'undefined' ? window.location.href : '')
    const shareUrl = new URL(baseUrl)
    shareUrl.searchParams.set('utm_source', 'twitter')
    shareUrl.searchParams.set('utm_medium', 'share')
    shareUrl.searchParams.set('utm_campaign', utmCampaign)
    shareUrl.searchParams.set('utm_content', `${type}-${contentId}`)

    // デフォルトシェア文言
    const defaultText = `matri-xでXアルゴリズムを学習中 | ${title || 'X Algorithm Research Platform'}`
    const shareText = text || defaultText

    // X Intent URL
    const xIntentUrl = new URL('https://twitter.com/intent/tweet')
    xIntentUrl.searchParams.set('text', shareText)
    xIntentUrl.searchParams.set('url', shareUrl.toString())

    // Web Share API対応ブラウザの場合
    if (navigator.share && /mobile/i.test(navigator.userAgent)) {
      try {
        await navigator.share({
          title: title || 'matri-x',
          text: shareText,
          url: shareUrl.toString(),
        })
        
        // シェアイベント記録（Analytics）
        trackShareEvent(type, contentId)
        return
      } catch (err) {
        // ユーザーがキャンセルした場合は何もしない
        if ((err as Error).name === 'AbortError') {
          return
        }
      }
    }

    // X Intent URLを開く
    window.open(xIntentUrl.toString(), '_blank', 'width=550,height=420')
    
    // シェアイベント記録（Analytics）
    trackShareEvent(type, contentId)
    
    // コピー完了フィードバック
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleShare}
            size={size}
            variant={variant}
            className="gap-2"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
            {label && <span>{copied ? 'Shared!' : label}</span>}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Share on X (Twitter)</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/**
 * シェアイベントをトラッキング（Vercel Analytics / Google Analytics 4）
 */
async function trackShareEvent(type: string, contentId: string) {
  // Vercel Analytics
  if (typeof window !== 'undefined' && 'va' in window) {
    // @ts-ignore
    window.va('event', 'share', {
      type,
      content_id: contentId,
    })
  }

  // Google Analytics 4
  if (typeof window !== 'undefined' && 'gtag' in window) {
    // @ts-ignore
    window.gtag('event', 'share', {
      event_category: 'engagement',
      event_label: `${type}-${contentId}`,
      content_type: type,
      content_id: contentId,
    })
  }

  // サーバーサイドでもトラッキング（レート制限・統計用）
  try {
    await fetch('/api/share/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        contentId,
        timestamp: Date.now(),
      }),
    })
  } catch (error) {
    // エラーは無視（トラッキング失敗してもシェアは成功させる）
    console.warn('Share tracking failed:', error)
  }
}
