"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  CheckCheck,
  Loader2,
  MessageSquare,
  ThumbsUp,
  Info,
  Activity,
  TicketPlus,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { formatDate } from "@/lib/format-utils";

interface Notification {
  id: string;
  type: string;
  message: string;
  postId: string | null;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

const NOTIFICATION_TYPES = [
  { value: "ALL", label: "すべて", icon: Bell },
  { value: "COMMENT", label: "コメント", icon: MessageSquare },
  { value: "VOTE", label: "投票", icon: ThumbsUp },
  { value: "TICKET", label: "チケット", icon: TicketPlus },
  { value: "ALGORITHM_UPDATE", label: "アルゴリズム更新", icon: Activity },
  { value: "SYSTEM", label: "システム", icon: Info },
];

function NotificationIcon({ type }: { type: string }) {
  switch (type) {
    case "COMMENT":
      return <MessageSquare className="h-5 w-5 text-blue-400" />;
    case "VOTE":
      return <ThumbsUp className="h-5 w-5 text-emerald-400" />;
    case "TICKET":
      return <TicketPlus className="h-5 w-5 text-purple-400" />;
    case "ALGORITHM_UPDATE":
      return <Activity className="h-5 w-5 text-red-400" />;
    case "SYSTEM":
      return <Info className="h-5 w-5 text-orange-400" />;
    default:
      return <Bell className="h-5 w-5 text-muted-foreground" />;
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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("ALL");
  const [markingAll, setMarkingAll] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const fetchNotifications = async (type: string = "ALL") => {
    setLoading(true);
    try {
      const url = type === "ALL" 
        ? "/api/notifications" 
        : `/api/notifications?type=${type}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(filterType);
  }, [filterType]);

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

  const markAllAsRead = async () => {
    setMarkingAll(true);
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const readNotifications = notifications.filter((n) => n.isRead);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-xl font-bold">通知</h1>
                {unreadCount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {unreadCount}件の未読
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "transition-colors",
                  showFilters && "bg-muted"
                )}
              >
                <Filter className="h-5 w-5" />
              </Button>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  disabled={markingAll}
                  className="gap-2 text-xs"
                >
                  {markingAll ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCheck className="h-3.5 w-3.5" />
                  )}
                  すべて既読
                </Button>
              )}
            </div>
          </div>

          {/* Filter Buttons */}
          {showFilters && (
            <div className="px-4 pb-4 border-t border-border/50 pt-3">
              <div className="flex flex-wrap gap-2">
                {NOTIFICATION_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isActive = filterType === type.value;
                  return (
                    <Button
                      key={type.value}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterType(type.value)}
                      className={cn(
                        "gap-1.5 text-xs",
                        !isActive && "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {type.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Bell className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
            <h3 className="font-semibold text-lg mb-1">通知はありません</h3>
            <p className="text-sm text-muted-foreground text-center">
              {filterType !== "ALL"
                ? "このタイプの通知はまだありません"
                : "新しい通知があるとここに表示されます"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {/* Unread Notifications */}
            {unreadNotifications.length > 0 && (
              <div>
                {unreadNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                  />
                ))}
              </div>
            )}

            {/* Read Notifications */}
            {readNotifications.length > 0 && (
              <div className={cn(unreadNotifications.length > 0 && "pt-2")}>
                {unreadNotifications.length > 0 && (
                  <div className="px-4 py-2 bg-muted/30">
                    <p className="text-xs text-muted-foreground font-medium">
                      既読の通知
                    </p>
                  </div>
                )}
                {readNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function NotificationItem({
  notification,
  onMarkAsRead,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}) {
  const href =
    notification.link ||
    (notification.postId ? `/dashboard/forum/${notification.postId}` : "#");

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
  };

  const content = (
    <div
      className={cn(
        "flex gap-3 px-4 py-4 transition-colors hover:bg-muted/50 cursor-pointer border-l-2",
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
            "text-sm leading-relaxed",
            !notification.isRead && "font-medium text-foreground"
          )}
        >
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-1.5">
          {timeAgo(notification.createdAt)} · {formatDate(notification.createdAt)}
        </p>
      </div>
      {!notification.isRead && (
        <div className="mt-1.5 shrink-0">
          <div className="h-2.5 w-2.5 rounded-full bg-primary" />
        </div>
      )}
    </div>
  );

  if (href === "#") {
    return <div>{content}</div>;
  }

  return (
    <Link href={href} className="block">
      {content}
    </Link>
  );
}
