import React from "react";
import Link from "next/link";
import { Zap } from "lucide-react";

export const dynamic = "force-dynamic";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(29,155,240,0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(120,86,255,0.1),transparent_50%)]" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-gradient">Matri-X</span>
          </Link>

          <div className="space-y-6 max-w-md">
            <h1 className="text-4xl font-bold leading-tight">
              Xアルゴリズムを
              <br />
              <span className="text-gradient">解き明かす。</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              推薦アルゴリズムの仕組みを理解し、仮説を検証。
              データに基づいたX運用を実現する、会員制プラットフォーム。
            </p>
            <div className="flex items-center gap-6 pt-4">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-foreground">500+</span>
                <span className="text-sm text-muted-foreground">検証レポート</span>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-foreground">50+</span>
                <span className="text-sm text-muted-foreground">アルゴリズム解説</span>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-foreground">24h</span>
                <span className="text-sm text-muted-foreground">リアルタイム更新</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            © 2026 Matri-X. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
