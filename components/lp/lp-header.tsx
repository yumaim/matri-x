"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Zap, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "探索", href: "#features" },
  { name: "シミュレーター", href: "#engagement" },
  { name: "料金", href: "#pricing" },
];

export function LPHeader() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      // Focus the close button when panel opens
      setTimeout(() => closeButtonRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Focus trap
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [open]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-4 lg:px-8 relative z-10">
          <div className="flex lg:flex-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary glow-primary">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-gradient">Matri-X</span>
            </Link>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center h-10 w-10 rounded-md hover:bg-accent active:bg-accent/80 transition-colors"
              onClick={() => setOpen(true)}
              aria-label="メニューを開く"
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
          <div className="hidden lg:flex lg:gap-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4">
            <Button asChild variant="ghost" size="sm"><Link href="/login">ログイン</Link></Button>
            <Button asChild size="sm" className="glow-primary"><Link href="/register">無料で始める</Link></Button>
          </div>
        </nav>
      </header>

      {open && (
        <div className="fixed inset-0 z-[200] lg:hidden" role="dialog" aria-modal="true" aria-label="ナビゲーションメニュー">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={panelRef}
            id="mobile-menu"
            className="absolute inset-y-0 right-0 w-full max-w-sm bg-background p-6 shadow-2xl border-l border-border"
          >
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                  <Zap className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-gradient">Matri-X</span>
              </Link>
              <button
                ref={closeButtonRef}
                type="button"
                className="inline-flex items-center justify-center h-10 w-10 rounded-md hover:bg-accent active:bg-accent/80 transition-colors"
                onClick={() => setOpen(false)}
                aria-label="メニューを閉じる"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-border">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="block rounded-lg px-3 py-2 text-base font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      onClick={() => setOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
                <div className="py-6 space-y-3">
                  <Button asChild variant="outline" className="w-full bg-transparent"><Link href="/login">ログイン</Link></Button>
                  <Button asChild className="w-full glow-primary"><Link href="/register">無料で始める</Link></Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
