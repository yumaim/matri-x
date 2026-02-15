"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, MessageSquare, ThumbsUp, Info, Activity, TicketPlus, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

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
      return <MessageSquare className="h-3.5 w-3.5 text-blue-400" />;
    case "VOTE":
      return <ThumbsUp className="h-3.5 w-3.5 text-emerald-400" />;
    case "TICKET":
      return <TicketPlus className="h-3.5 w-3.5 text-purple-400" />;
    case "ALGORITHM_UPDATE":
      return <Activity className="h-3.5 w-3.5 text-red-400" />;
    case "SYSTEM":
      return <Info className="h-3.5 w-3.5 text-orange-400" />;
    default:
      return <Bell className="h-3.5 w-3.5 text-muted-foreground" />;
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

export function NotificationWidget() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications?limit=5");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications.slice(0, 5));
          setUnreadCount(data.unreadCount);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 180000); // 3分ごと
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds: [notificationId] }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  return (
    <Card className="glass border-border/30 overflow-hidden">
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-3 border-b border-border/30">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            通知
          </h4>
          {unreadCount > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary/20 px-1.5 text-[10px] font-bold text-primary">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          最新の活動をチェック
        </p>
      </div>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-3 space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-2.5">
                <Skeleton className="h-7 w-7 rounded shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-2.5 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <div className="h-10 w-10 rounded-full bg-muted/30 flex items-center justify-center mb-2">
              <Bell className="h-5 w-5 text-muted-foreground/40" />
            </div>
            <p className="text-xs text-muted-foreground">通知はありません</p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {notifications.map((notification) => {
              const href =
                notification.link ||
                (notification.postId ? `/dashboard/forum/${notification.postId}` : "#");

              const handleClick = () => {
                if (!notification.isRead) {
                  markAsRead(notification.id);
                }
              };

              const content = (
                <div
                  className={cn(
                    "flex gap-2.5 px-3 py-2.5 transition-colors hover:bg-muted/50 cursor-pointer border-l-2",
                    notification.isRead
                      ? "border-transparent"
                      : "border-primary bg-primary/[0.02]"
                  )}
                  onClick={handleClick}
                >
                  <div className="mt-0.5 shrink-0">
                    <NotificationIcon type={notification.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-xs leading-relaxed line-clamp-2",
                        !notification.isRead && "font-medium text-foreground"
                      )}
                    >
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {timeAgo(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="mt-1 shrink-0">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                  )}
                </div>
              );

              if (href === "#") {
                return <div key={notification.id}>{content}</div>;
              }

              return (
                <Link key={notification.id} href={href} className="block">
                  {content}
                </Link>
              );
            })}
          </div>
        )}
        {notifications.length > 0 && (
          <div className="border-t border-border/30 px-3 py-2.5">
            <Link
              href="/dashboard/notifications"
              className="flex items-center justify-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors font-medium group"
            >
              一覧で確認する
              <ExternalLink className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
