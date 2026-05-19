import Link from 'next/link'
import Image from 'next/image'
import { Instagram, Facebook, Twitter } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-secondary border-t border-border mt-12 lg:mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          <div className="col-span-2 md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <Image src="/meat.png" alt="Oishi Niku" width={40} height={40} className="w-10 h-10 object-contain" />
              <span className="font-heading text-3xl tracking-widest text-foreground">OISHI NIKU</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
              最高品質の農場から厳選した精肉。最良のカットを直接お届けします。
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a href="#" className="w-9 h-9 rounded-full bg-background flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors" aria-label="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-background flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors" aria-label="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-background flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors" aria-label="Twitter">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-heading tracking-widest text-foreground mb-4 text-sm uppercase">ショップ</h3>
            <ul className="space-y-3">
              {[
                { label: '全商品', href: '/products' },
                { label: '和牛', href: '/products?category=wagyu' },
                { label: '豚肉', href: '/products?category=pork' },
                { label: '鶏肉', href: '/products?category=chicken' },
                { label: 'ラム肉', href: '/products?category=lamb' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-heading tracking-widest text-foreground mb-4 text-sm uppercase">サポート</h3>
            <ul className="space-y-3">
              {[
                { label: '配送情報', href: '/shipping' },
                { label: '返品・交換', href: '/returns' },
                { label: 'よくある質問', href: '/#faq' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Oishi Niku. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-primary transition-colors">プライバシーポリシー</Link>
            <Link href="/terms" className="text-xs text-muted-foreground hover:text-primary transition-colors">利用規約</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
