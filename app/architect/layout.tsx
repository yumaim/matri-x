"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  TicketPlus,
  Bell,
  Activity,
  Shield,
  ScrollText,
  ChevronLeft,
  Menu,
  X,
  MessageCircleWarning,
  GitBranch,
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminNav = [
  { name: "概要", href: "/architect", icon: LayoutDashboard },
  { name: "ユーザー管理", href: "/architect/users", icon: Users },
  { name: "コンテンツ管理", href: "/architect/moderation", icon: MessageCircleWarning },
  { name: "チケット管理", href: "/architect/tickets", icon: TicketPlus },
  { name: "更新通知", href: "/architect/updates", icon: Bell },
  { name: "ヘルスチェック", href: "/architect/health", icon: Activity },
  { name: "チーム管理", href: "/architect/team", icon: Shield },
  { name: "監査ログ", href: "/architect/audit", icon: ScrollText },
  { name: "バージョン", href: "/architect/changelog", icon: GitBranch },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Items restricted to ADMIN only
  const restrictedForModerator = ["/architect/users"];

  const filteredNav = userRole === "MODERATOR"
    ? adminNav.filter((item) => !restrictedForModerator.includes(item.href))
    : adminNav;

  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.role === "ADMIN" || d?.role === "MODERATOR") {
          setUserRole(d.role);
        } else {
          setUserRole(null);
          router.push("/dashboard");
        }
      })
      .catch(() => {
        setUserRole(null);
        router.push("/dashboard");
      });
  }, [router]);

  // Block MODERATOR from accessing restricted pages
  useEffect(() => {
    if (userRole === "MODERATOR" && restrictedForModerator.some((p) => pathname.startsWith(p))) {
      router.push("/architect");
    }
  }, [userRole, pathname, router]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  if (userRole === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">認証確認中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card/50">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-red-400" />
          <span className="font-bold text-gradient">Admin</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="lg:hidden border-b border-border bg-card/80 p-2">
          {filteredNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                pathname === item.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </div>
      )}

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-60 border-r border-border bg-card/30 min-h-screen">
          <div className="flex items-center gap-2 p-4 border-b border-border">
            <Shield className="h-5 w-5 text-red-400" />
            <span className="font-bold text-gradient">Admin Panel</span>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {filteredNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="p-3 border-t border-border space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50"
            >
              <ChevronLeft className="h-4 w-4" />
              ダッシュボードへ戻る
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen">{children}</main>
      </div>
    </div>
  );
}
