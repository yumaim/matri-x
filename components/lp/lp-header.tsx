import Link from "next/link";

const navigation = [
  { name: "探索", href: "#features" },
  { name: "シミュレーター", href: "#engagement" },
  { name: "料金", href: "#pricing" },
];

export function LPHeader() {
  return (
    <>
      {/* Hidden checkbox controls the menu - zero JS */}
      <input type="checkbox" id="mobile-menu-toggle" className="peer hidden" aria-hidden="true" />

      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-4 lg:px-8 relative z-10">
          <div className="flex lg:flex-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary glow-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path></svg>
              </div>
              <span className="text-xl font-bold text-gradient">Matri-X</span>
            </Link>
          </div>

          {/* Hamburger button - just a label, no JS */}
          <label
            htmlFor="mobile-menu-toggle"
            className="flex lg:hidden items-center justify-center h-10 w-10 rounded-md hover:bg-accent active:bg-accent/80 cursor-pointer"
            aria-label="メニューを開く"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5h16"></path><path d="M4 12h16"></path><path d="M4 19h16"></path></svg>
          </label>

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
            <Link href="/login" className="inline-flex items-center justify-center h-9 px-3 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">ログイン</Link>
            <Link href="/register" className="inline-flex items-center justify-center h-9 px-3 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 glow-primary transition-colors">無料で始める</Link>
          </div>
        </nav>
      </header>

      {/* Mobile menu overlay - controlled purely by CSS :checked */}
      <div className="mobile-menu-overlay fixed inset-0 z-[200] lg:hidden pointer-events-none opacity-0 transition-opacity duration-200">
        {/* Backdrop */}
        <label
          htmlFor="mobile-menu-toggle"
          className="absolute inset-0 bg-black/70 cursor-default"
          aria-hidden="true"
        />
        {/* Panel */}
        <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-background p-6 shadow-2xl border-l border-border translate-x-full transition-transform duration-200">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path></svg>
              </div>
              <span className="text-xl font-bold text-gradient">Matri-X</span>
            </Link>
            {/* Close button - just a label */}
            <label
              htmlFor="mobile-menu-toggle"
              className="inline-flex items-center justify-center h-10 w-10 rounded-md hover:bg-accent active:bg-accent/80 cursor-pointer"
              aria-label="メニューを閉じる"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"></path><path d="M6 6 18 18"></path></svg>
            </label>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-border">
              <div className="space-y-2 py-6">
                {navigation.map((item) => (
                  <label key={item.name} htmlFor="mobile-menu-toggle" className="block">
                    <Link
                      href={item.href}
                      className="block rounded-lg px-3 py-2 text-base font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {item.name}
                    </Link>
                  </label>
                ))}
              </div>
              <div className="py-6 space-y-3">
                <Link href="/login" className="flex items-center justify-center w-full h-10 px-4 rounded-md border border-input bg-transparent text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">ログイン</Link>
                <Link href="/register" className="flex items-center justify-center w-full h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 glow-primary transition-colors">無料で始める</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
