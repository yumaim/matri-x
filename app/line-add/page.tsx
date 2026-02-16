import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Gift, LineChart, Zap } from 'lucide-react'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'LINE友達追加 - matri-x',
  description:
    'matri-x公式LINEで限定情報をお届け！X運用代行者向けアルゴリズム解説レポート3本プレゼント🎁',
  openGraph: {
    title: 'LINE友達追加 - matri-x',
    description: 'X運用代行者向け限定情報をLINEでお届け',
    images: ['/api/og/share/line-add?title=LINE%E5%8F%8B%E9%81%94%E8%BF%BD%E5%8A%A0'],
  },
}

export default function LineAddPage() {
  // TODO: 実際のLINE公式アカウントURLに置き換える
  const lineAddUrl = 'https://line.me/R/ti/p/@matri-x'
  const lineQrCodeUrl = '/images/line-qr-code.png' // TODO: 実際のQRコード画像パス

  return (
    <div className="container max-w-4xl py-12">
      <div className="space-y-8">
        {/* ヒーロー */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lime-500/10 text-lime-500 text-sm font-medium">
            <Gift className="h-4 w-4" />
            限定プレゼント実施中
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            matri-x公式LINEで
            <br />
            限定情報をお届け
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            X運用代行者向けアルゴリズム解説レポート3本を
            <br />
            LINE友達追加で今すぐプレゼント🎁
          </p>
        </div>

        {/* メインカード */}
        <Card className="border-lime-500/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">今すぐ友達追加する</CardTitle>
            <CardDescription>
              QRコードをスキャンするか、ボタンをタップしてください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* QRコード */}
            <div className="flex justify-center">
              <div className="p-6 bg-white rounded-lg border-2 border-lime-500/20">
                {/* TODO: 実際のQRコード画像を配置 */}
                <div className="w-64 h-64 bg-muted flex items-center justify-center text-muted-foreground">
                  <div className="text-center space-y-2">
                    <LineChart className="h-16 w-16 mx-auto" />
                    <p className="text-sm">QRコード</p>
                    <p className="text-xs">（実装時に差し替え）</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 友達追加ボタン */}
            <div className="text-center space-y-4">
              <a
                href={lineAddUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Button size="lg" className="bg-[#06C755] hover:bg-[#06C755]/90 text-white gap-2">
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                  </svg>
                  友達追加する
                </Button>
              </a>
              <p className="text-xs text-muted-foreground">
                ※ タップするとLINEアプリが開きます
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 特典詳細 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-lime-500" />
              登録特典
            </CardTitle>
            <CardDescription>
              LINE友達追加で以下の限定レポートを今すぐプレゼント
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-lime-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">
                    【レポート1】Heavy Rankerアルゴリズム完全解説
                  </p>
                  <p className="text-sm text-muted-foreground">
                    フォロワーの影響力を最大化する実践テクニック
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-lime-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">
                    【レポート2】TweepCredスコア向上の5つの秘訣
                  </p>
                  <p className="text-sm text-muted-foreground">
                    信頼性スコアを30日で2倍にした実例付き
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-lime-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">
                    【レポート3】2026年X APIアルゴリズム変更まとめ
                  </p>
                  <p className="text-sm text-muted-foreground">
                    最新アップデートへの対応方法を徹底解説
                  </p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* 配信内容 */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-lime-500" />
                <CardTitle className="text-lg">アルゴリズム更新通知</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Xアルゴリズムの最新変更をいち早くお知らせ
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <LineChart className="h-5 w-5 text-lime-500" />
                <CardTitle className="text-lg">運用ノウハウ配信</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                成功事例・ケーススタディを定期配信
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-lime-500" />
                <CardTitle className="text-lg">限定クーポン</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                有料プラン初月50%OFFなど特別オファー
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center space-y-4 py-8">
          <p className="text-lg font-medium">今すぐ友達追加して限定情報をゲット！</p>
          <a
            href={lineAddUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <Button size="lg" className="bg-[#06C755] hover:bg-[#06C755]/90 text-white gap-2">
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
              </svg>
              友達追加する
            </Button>
          </a>
        </div>
      </div>
    </div>
  )
}
