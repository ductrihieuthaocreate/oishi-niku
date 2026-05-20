'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Instagram, Facebook, Twitter } from 'lucide-react'
import { useLang } from '@/lib/lang-context'

export function Footer() {
  const { t } = useLang()
  const f = t.footer

  const shopLinks = [
    { label: f.allProducts, href: '/products' },
    { label: f.wagyu, href: '/products?category=wagyu' },
    { label: f.pork, href: '/products?category=pork' },
    { label: f.chicken, href: '/products?category=chicken' },
    { label: f.lamb, href: '/products?category=lamb' },
  ]

  const supportLinks = [
    { label: f.shipping, href: '/shipping' },
    { label: f.returns, href: '/returns' },
    { label: f.faq, href: '/#faq' },
  ]

  return (
    <footer className="bg-secondary border-t border-border mt-12 lg:mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          <div className="col-span-2 md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <Image src="/meat.png" alt="Oishi Niku" width={40} height={40} className="w-10 h-10 object-contain" />
              <span className="font-heading text-3xl tracking-widest text-foreground">OISHI NIKU</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">{f.tagline}</p>
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
            <h3 className="font-heading tracking-widest text-foreground mb-4 text-sm uppercase">{f.shop}</h3>
            <ul className="space-y-3">
              {shopLinks.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-heading tracking-widest text-foreground mb-4 text-sm uppercase">{f.support}</h3>
            <ul className="space-y-3">
              {supportLinks.map(link => (
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
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-primary transition-colors">{f.privacy}</Link>
            <Link href="/terms" className="text-xs text-muted-foreground hover:text-primary transition-colors">{f.terms}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
