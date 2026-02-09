import Link from "next/link";
import { Zap } from "lucide-react";

const footerLinks = {
  product: [
    { name: "パイプライン探索", href: "/explore" },
    { name: "シミュレーター", href: "/simulator" },
    { name: "SimClusters", href: "/simclusters" },
    { name: "DeepWiki", href: "/deepwiki" },
  ],
  resources: [
    { name: "更新履歴", href: "/updates" },
    { name: "成功事例", href: "/case-studies" },
    { name: "コミュニティ", href: "/community" },
    { name: "保護マトリックス", href: "/protection" },
  ],
  company: [
    { name: "料金プラン", href: "/pricing" },
    { name: "利用規約", href: "#" },
    { name: "プライバシー", href: "#" },
    { name: "お問い合わせ", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-gradient">Matri-X</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Xの推薦アルゴリズムを視覚的・動的に学べる会員制SaaSプラットフォーム
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              プロダクト
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">リソース</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">会社情報</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Matri-X. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
