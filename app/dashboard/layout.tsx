"use client";

import React from "react"

import { useState, useEffect, useCallback } from "react";
import { signOut } from "next-auth/react";
import { OnboardingProvider } from "@/components/onboarding";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Zap,
  LayoutDashboard,
  GitBranch,
  Users,
  BarChart3,
  Search,
  Settings,
  LogOut,
  ChevronLeft,
  Bell,
  Menu,
  MessageCircle,
  History,
  User,
  Trophy,
  CheckCheck,
  MessageSquare,
  ThumbsUp,
  Info,
  Activity,
  BookOpen,
  TicketPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface Notification {
  id: string;
  type: string;
  message: string;
  postId: string | null;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

function NotificationIcon({ type }: { type: string }) {
  switch (type) {
    case "COMMENT":
      return <MessageSquare className="h-4 w-4 text-blue-400" />;
    case "VOTE":
      return <ThumbsUp className="h-4 w-4 text-emerald-400" />;
    case "TICKET":
      return <Info className="h-4 w-4 text-purple-400" />;
    case "ALGORITHM_UPDATE":
      return <Activity className="h-4 w-4 text-red-400" />;
    default:
      return <Info className="h-4 w-4 text-orange-400" />;
  }
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "たった今";
  if (diffMin < 60) return `${diffMin}分前`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}時間前`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay}日前`;
  return `${Math.floor(diffDay / 30)}ヶ月前`;
}

function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      /* ignore */
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h4 className="text-sm font-semibold">通知</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground gap-1"
              onClick={markAllRead}
            >
              <CheckCheck className="h-3 w-3" />
              すべて既読
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-[360px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">通知はありません</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((n) => (
                <Link
                  key={n.id}
                  href={n.link || (n.postId ? `/dashboard/forum/${n.postId}` : "/dashboard")}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex gap-3 px-4 py-3 transition-colors hover:bg-muted/50",
                    !n.isRead && "bg-primary/5"
                  )}
                >
                  <div className="mt-0.5 shrink-0">
                    <NotificationIcon type={n.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm leading-snug", !n.isRead && "font-medium")}>
                      {n.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>
                  {!n.isRead && (
                    <div className="mt-1.5 shrink-0">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

const navigation = [
  { name: "ダッシュボード", href: "/dashboard", icon: LayoutDashboard },
  { name: "フォーラム", href: "/dashboard/forum", icon: MessageCircle },
  { name: "ランキング", href: "/dashboard/ranking", icon: Trophy },
  { name: "アナリティクス", href: "/dashboard/analytics", icon: Activity },
  { name: "パイプライン探索", href: "/dashboard/explore", icon: GitBranch },
  { name: "エンゲージメント分析", href: "/dashboard/engagement", icon: BarChart3 },
  { name: "TweepCredシミュレーター", href: "/dashboard/simulator", icon: Users },
  { name: "Deep AI検索", href: "/dashboard/deepwiki", icon: Search },
  { name: "用語集", href: "/dashboard/glossary", icon: BookOpen },
  { name: "開発チケット", href: "/dashboard/tickets", icon: TicketPlus },
  { name: "更新履歴", href: "/dashboard/updates", icon: History },
];

const bottomNavigation = [
  { name: "プロフィール", href: "/dashboard/profile", icon: User },
  { name: "設定", href: "/dashboard/settings", icon: Settings },
];

function SidebarContent({
  collapsed,
  pathname,
}: {
  collapsed: boolean;
  pathname: string;
}) {
  const [userName, setUserName] = useState("ユーザー");
  const [userId, setUserId] = useState<string | null>(null);
  const [userImage, setUserImage] = useState<string | null>(null);
  useEffect(() => {
    fetch("/api/users/me").then(r => r.ok ? r.json() : null).then(d => {
      if (d?.name) setUserName(d.name);
      if (d?.id) setUserId(d.id);
      if (d?.image) setUserImage(d.image);
    }).catch(() => {});
  }, []);
  const userInitial = userName[0]?.toUpperCase() ?? "U";
  return (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center px-4 border-b border-border">
        <span className={cn("font-bold text-gradient", collapsed ? "text-lg" : "text-xl")}>
          {collapsed ? "MX" : "Matri-X"}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-border p-3 space-y-1">
        {bottomNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </div>

      {/* User Profile */}
      <div className="border-t border-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all hover:bg-muted",
                collapsed && "justify-center"
              )}
            >
              <Avatar className="h-8 w-8 shrink-0">
                {userImage && <AvatarImage src={userImage} />}
                <AvatarFallback className="bg-primary/20 text-primary text-sm">
                  {userInitial}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex-1 text-left">
                  <p className="font-medium text-foreground">{userName}</p>
                  <p className="text-xs text-muted-foreground">Free プラン</p>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {userId && (
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/users/${userId}`}>
                  <User className="mr-2 h-4 w-4" />
                  マイページ
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" />
                設定
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => signOut({ callbackUrl: "/" })}>
              <LogOut className="mr-2 h-4 w-4" />
              ログアウト
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [myUserImage, setMyUserImage] = useState<string | null>(null);
  const [myUserName, setMyUserName] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/users/me").then(r => r.ok ? r.json() : null).then(d => {
      if (d?.id) setMyUserId(d.id);
      if (d?.image) setMyUserImage(d.image);
      if (d?.name) setMyUserName(d.name);
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 hidden h-screen border-r border-border bg-card transition-all duration-300 lg:flex lg:flex-col",
          collapsed ? "w-[72px]" : "w-64"
        )}
      >
        <SidebarContent collapsed={collapsed} pathname={pathname} />
        
        {/* Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform",
              collapsed && "rotate-180"
            )}
          />
        </button>
      </aside>

      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0" aria-label="ナビゲーションメニュー">
              <div className="flex h-full flex-col" onClick={() => setMobileMenuOpen(false)}>
                <SidebarContent collapsed={false} pathname={pathname} />
              </div>
            </SheetContent>
          </Sheet>
          <span className="text-lg font-bold text-gradient">Matri-X</span>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <Link href={myUserId ? `/dashboard/users/${myUserId}` : "/dashboard/profile"}>
            <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
              {myUserImage && <AvatarImage src={myUserImage} />}
              <AvatarFallback className="bg-primary/20 text-primary text-sm">
                {myUserName ? myUserName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "MX"}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main
        className={cn(
          "min-h-screen pt-16 transition-all duration-300 lg:pt-0 overflow-x-hidden",
          collapsed ? "lg:pl-[72px]" : "lg:pl-64"
        )}
      >
        <OnboardingProvider>
          {children}
        </OnboardingProvider>
      </main>
    </div>
  );
}
